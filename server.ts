import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'jolas-secret-key-9988-7766';

// Fail loudly if DATABASE_URL is missing — never silently fall back to SQLite
if (!process.env.DATABASE_URL) {
  console.error('FATAL: DATABASE_URL environment variable is not set. Cannot start without a database.');
  process.exit(1);
}

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'error']
});

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const logAudit = async (action: string, username: string, role: string, targetUserId: string) => {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        userId: targetUserId,
        username,
        role,
        ipAddress: '0.0.0.0',
        device: 'Production API',
        browser: 'Express',
        timestamp: new Date().toISOString()
      }
    });
  } catch (e) {
    console.error('Audit logging failed:', e);
  }
};

const verifyToken = (req: any, res: any): { username: string; role: string } | null => {
  const token = req.cookies?.token;
  if (!token) { res.status(401).json({ error: 'Unauthorized — no session token' }); return null; }
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch {
    res.status(401).json({ error: 'Unauthorized — invalid or expired token' });
    return null;
  }
};

// ─── AUTH ─────────────────────────────────────────────────────────────────────

app.post('/api/auth/login', async (req, res) => {
  try {
    const { emailOrUsername, passwordHash } = req.body;
    if (!emailOrUsername || !passwordHash) {
      return res.status(400).json({ success: false, error: 'Email/username and password are required.' });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrUsername.toLowerCase() },
          { username: emailOrUsername.toLowerCase() }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid JOLAS username or email.' });
    }

    const passwordMatch = await bcrypt.compare(passwordHash, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: 'Authentication rejected. Verify security key.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    const { passwordHash: _, ...userSession } = user;
    await logAudit('User Login', user.username, user.role, user.username);
    res.json({ success: true, user: userSession });

  } catch (e: any) {
    console.error('Login error:', e);
    res.status(500).json({ success: false, error: 'Database connection error. Please try again.' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { profile, passwordHash, role } = req.body;

    const exists = await prisma.user.findFirst({
      where: {
        OR: [{ username: profile.username }, { email: profile.email }]
      }
    });

    if (exists) {
      return res.status(400).json({ success: false, error: 'A user with this username or email already exists.' });
    }

    const secureHash = await bcrypt.hash(passwordHash, 10);

    let referrerUser = null;
    if (profile.referredBy) {
      referrerUser = await prisma.user.findFirst({
        where: {
          OR: [
            { referralCode: profile.referredBy.trim() },
            { username: profile.referredBy.trim().toLowerCase() }
          ]
        }
      });
    }

    const newUser = await prisma.user.create({
      data: {
        fullName: profile.fullName,
        username: profile.username,
        email: profile.email,
        phoneNumber: profile.phoneNumber || '',
        passportPhoto: profile.passportPhoto,
        dob: profile.dob || '',
        gender: profile.gender || '',
        address: profile.address || '',
        state: profile.state || '',
        lga: profile.lga || '',
        occupation: profile.occupation || '',
        nextOfKinName: profile.nextOfKin?.name || '',
        nextOfKinRelationship: profile.nextOfKin?.relationship || '',
        nextOfKinPhone: profile.nextOfKin?.phoneNumber || '',
        bankName: profile.bankName || '',
        accountNumber: profile.accountNumber || '',
        accountName: profile.accountName || '',
        bvn: profile.bvn,
        nin: profile.nin,
        referralCode: profile.referralCode,
        referredBy: referrerUser ? referrerUser.username : (profile.referredBy || null),
        isKycVerified: profile.isKycVerified || false,
        kycStatus: profile.kycStatus || 'Unverified',
        twoFactorEnabled: profile.twoFactorEnabled || false,
        status: profile.status || 'Active',
        passwordHash: secureHash,
        role: role || 'Customer'
      }
    });

    if (referrerUser) {
      await prisma.notification.create({
        data: {
          title: 'Referral Bonus Credited! 🎉',
          message: `${profile.fullName} registered using your referral code.`,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          isRead: false,
          type: 'success',
          username: referrerUser.username
        }
      });
      await logAudit(`Referral Signup: ${profile.username}`, referrerUser.username, referrerUser.role, referrerUser.username);
    }

    const { passwordHash: _, ...registeredUser } = newUser;
    await logAudit('Account Registered', profile.username, role || 'Customer', profile.username);
    res.json({ success: true, user: registeredUser });

  } catch (e: any) {
    console.error('Register error:', e);
    res.status(500).json({ success: false, error: 'Registration failed: ' + e.message });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

// ─── USERS ────────────────────────────────────────────────────────────────────

app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({ omit: { passwordHash: true } });
    res.json(users);
  } catch (e: any) {
    res.status(500).json({ error: 'Database error: ' + e.message });
  }
});

app.put('/api/users/:username', async (req, res) => {
  const { username } = req.params;
  try {
    // Never allow password update through this endpoint
    const { passwordHash, ...safeData } = req.body;
    const updated = await prisma.user.update({ where: { username }, data: safeData });
    res.json(updated);
  } catch (e) {
    res.status(404).json({ error: 'User not found' });
  }
});

// Secure: returns ONLY customers assigned to the authenticated agent
app.get('/api/users/assigned', async (req, res) => {
  const session = verifyToken(req, res);
  if (!session) return;

  const agentUser = await prisma.user.findUnique({ where: { username: session.username } });
  if (!agentUser || agentUser.role !== 'Agent') {
    return res.status(403).json({ error: 'Forbidden: Agent access only' });
  }

  const assignedCustomers = await prisma.user.findMany({
    where: { assignedAgentUsername: session.username, role: 'Customer' },
    omit: { passwordHash: true }
  });

  res.json(assignedCustomers);
});

// ─── SAVINGS GOALS ────────────────────────────────────────────────────────────

app.get('/api/goals', async (req, res) => {
  try {
    const goals = await prisma.savingsGoal.findMany();
    res.json(goals);
  } catch (e: any) {
    res.status(500).json({ error: 'Database error: ' + e.message });
  }
});

// Returns only goals for a specific customer (used for deposit form validation)
app.get('/api/goals/mine', async (req, res) => {
  const session = verifyToken(req, res);
  if (!session) return;
  const goals = await prisma.savingsGoal.findMany({ where: { username: session.username } });
  res.json(goals);
});

app.post('/api/goals', async (req, res) => {
  const { goal, username } = req.body;
  try {
    await prisma.savingsGoal.create({
      data: {
        id: goal.id,
        name: goal.name,
        category: goal.category,
        targetAmount: goal.targetAmount,
        frequency: goal.frequency,
        expectedDeposit: goal.expectedDeposit,
        amountSaved: goal.amountSaved || 0.0,
        startDate: goal.startDate,
        endDate: goal.endDate,
        withdrawalDate: goal.withdrawalDate,
        reminderEnabled: goal.reminderEnabled,
        imageUrl: goal.imageUrl,
        notes: goal.notes,
        status: goal.status || 'Active',
        apy: 0.0,
        accruedInterest: 0.0,
        username: username
      }
    });
    await logAudit(`Goal Created: ${goal.name}`, username, 'Customer', username);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/goals/:id', async (req, res) => {
  const { id } = req.params;
  const { updated } = req.body;
  try {
    const { apy, accruedInterest, ...safeUpdate } = updated; // Strip APY/interest fields
    const target = await prisma.savingsGoal.update({ where: { id }, data: safeUpdate });
    res.json(target);
  } catch (e) {
    res.status(404).json({ error: 'Goal not found' });
  }
});

app.post('/api/goals/bulk', async (req, res) => {
  const { goals } = req.body;
  try {
    for (const goal of goals) {
      await prisma.savingsGoal.update({
        where: { id: goal.id },
        data: { amountSaved: goal.amountSaved }
      });
    }
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── DEPOSIT REQUESTS ─────────────────────────────────────────────────────────

app.get('/api/deposit-requests', async (req, res) => {
  try {
    const requests = await prisma.depositRequest.findMany({ orderBy: { updatedAt: 'desc' } });
    res.json(requests.map(r => ({ ...r, auditLog: JSON.parse(r.auditLogJson) })));
  } catch (e: any) {
    res.status(500).json({ error: 'Database error: ' + e.message });
  }
});

// Create deposit request — validates that goalId belongs to the submitting customer
app.post('/api/deposit-requests', async (req, res) => {
  const session = verifyToken(req, res);
  if (!session) return;

  const { req: depositReq } = req.body;
  try {
    // Security: verify the goal belongs to the authenticated customer
    const goal = await prisma.savingsGoal.findUnique({ where: { id: depositReq.goalId } });
    if (!goal) {
      return res.status(404).json({ error: 'Savings goal not found.' });
    }
    if (goal.username !== session.username) {
      return res.status(403).json({ error: 'Forbidden: You cannot submit a deposit for another customer\'s goal.' });
    }

    // Validate amount
    if (!depositReq.amount || depositReq.amount <= 0) {
      return res.status(400).json({ error: 'Deposit amount must be greater than zero.' });
    }

    await prisma.depositRequest.create({
      data: {
        id: depositReq.id,
        customerId: session.username,
        customerName: depositReq.customerName,
        customerPhone: depositReq.customerPhone || '',
        customerUsername: session.username,
        goalId: depositReq.goalId,
        goalName: goal.name,
        amount: depositReq.amount,
        createdAt: new Date().toISOString(),
        status: 'Pending',
        proofOfPaymentUrl: depositReq.proofOfPaymentUrl,
        notes: depositReq.notes,
        auditLogJson: JSON.stringify([{
          action: 'Deposit Request Submitted',
          actor: session.username,
          timestamp: new Date().toISOString()
        }])
      }
    });

    await logAudit(`Deposit Request Created: ₦${depositReq.amount?.toLocaleString()} for goal "${goal.name}"`, session.username, 'Customer', session.username);
    res.json({ success: true });
  } catch (e: any) {
    console.error('Deposit request error:', e);
    res.status(500).json({ error: e.message });
  }
});

// Update proof of payment (customer uploads receipt)
app.patch('/api/deposit-requests/:id/proof', async (req, res) => {
  const session = verifyToken(req, res);
  if (!session) return;

  const { id } = req.params;
  const { proofOfPaymentUrl, notes } = req.body;

  try {
    const request = await prisma.depositRequest.findUnique({ where: { id } });
    if (!request) return res.status(404).json({ error: 'Deposit request not found.' });
    if (request.customerUsername !== session.username) {
      return res.status(403).json({ error: 'Forbidden: You can only update your own deposit requests.' });
    }
    if (request.status !== 'Pending' && request.status !== 'Awaiting Verification') {
      return res.status(400).json({ error: 'Cannot update a request that is already ' + request.status });
    }

    const currentLog = JSON.parse(request.auditLogJson);
    const updatedLog = [...currentLog, {
      action: 'Proof of Payment Uploaded',
      actor: session.username,
      timestamp: new Date().toISOString()
    }];

    await prisma.depositRequest.update({
      where: { id },
      data: {
        proofOfPaymentUrl,
        notes,
        status: 'Awaiting Verification',
        auditLogJson: JSON.stringify(updatedLog)
      }
    });

    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// APPROVE deposit — atomic transaction prevents double-crediting
app.post('/api/deposit-requests/:id/approve', async (req, res) => {
  const session = verifyToken(req, res);
  if (!session) return;

  // Only Admin or Agent can approve
  if (!['Admin', 'Agent', 'Super Admin'].includes(session.role)) {
    return res.status(403).json({ error: 'Forbidden: Only Admin or Agent can approve deposits.' });
  }

  const { id } = req.params;
  const { notes } = req.body;

  try {
    // Run the entire approval as an atomic DB transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Lock and fetch the deposit request
      const request = await tx.depositRequest.findUnique({ where: { id } });
      if (!request) throw new Error('Deposit request not found.');

      // 2. Guard: only Pending or Awaiting Verification can be approved
      if (!['Pending', 'Awaiting Verification'].includes(request.status)) {
        throw new Error(`Cannot approve a request with status "${request.status}". It may already be processed.`);
      }

      // 3. Fetch the savings goal
      const goal = await tx.savingsGoal.findUnique({ where: { id: request.goalId } });
      if (!goal) throw new Error('Savings goal not found for this deposit request.');

      // 4. Credit ONLY the exact principal amount (no APY, no interest, no bonus)
      const newBalance = goal.amountSaved + request.amount;
      await tx.savingsGoal.update({
        where: { id: request.goalId },
        data: { amountSaved: newBalance }
      });

      // 5. Create exactly ONE transaction record
      const receiptNumber = `REC-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      await tx.transaction.create({
        data: {
          receiptNumber,
          transactionId: request.id,
          goalName: request.goalName,
          goalId: request.goalId,
          amount: request.amount,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          paymentMethod: 'Bank Transfer (Admin Verified)',
          balanceAfter: newBalance,
          type: 'Deposit',
          status: 'Successful',
          customerName: request.customerName
        }
      });

      // 6. Send notification to customer
      await tx.notification.create({
        data: {
          title: '✅ Deposit Approved & Credited',
          message: `Your deposit of ₦${request.amount.toLocaleString()} has been verified and credited to your "${request.goalName}" goal. New balance: ₦${newBalance.toLocaleString()}.`,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          isRead: false,
          type: 'success',
          username: request.customerUsername
        }
      });

      // 7. Update deposit request status to Credited
      const currentLog = JSON.parse(request.auditLogJson);
      const updatedLog = [...currentLog, {
        action: 'Deposit Approved & Account Credited',
        actor: `${session.role} (${session.username})`,
        timestamp: new Date().toISOString(),
        details: notes || 'Approved by admin'
      }];

      const updated = await tx.depositRequest.update({
        where: { id },
        data: {
          status: 'Credited',
          approvedBy: `${session.role} (${session.username})`,
          approvedAt: new Date().toISOString(),
          receiptNumber,
          notes: notes || request.notes,
          auditLogJson: JSON.stringify(updatedLog)
        }
      });

      return { updated, receiptNumber, newBalance };
    });

    await logAudit(`Deposit Approved: ${id} | ₦${result.updated.amount.toLocaleString()} → "${result.updated.goalName}"`, session.username, session.role, result.updated.customerUsername);
    res.json({ success: true, receiptNumber: result.receiptNumber, newBalance: result.newBalance });

  } catch (e: any) {
    console.error('Approval error:', e);
    res.status(400).json({ error: e.message });
  }
});

// DECLINE deposit — never touches goal balance
app.post('/api/deposit-requests/:id/decline', async (req, res) => {
  const session = verifyToken(req, res);
  if (!session) return;

  if (!['Admin', 'Agent', 'Super Admin'].includes(session.role)) {
    return res.status(403).json({ error: 'Forbidden: Only Admin or Agent can decline deposits.' });
  }

  const { id } = req.params;
  const { reason } = req.body;

  try {
    const request = await prisma.depositRequest.findUnique({ where: { id } });
    if (!request) return res.status(404).json({ error: 'Deposit request not found.' });

    if (!['Pending', 'Awaiting Verification'].includes(request.status)) {
      return res.status(400).json({ error: `Cannot decline a request with status "${request.status}".` });
    }

    // IMPORTANT: do NOT touch the savings goal balance
    const currentLog = JSON.parse(request.auditLogJson);
    const updatedLog = [...currentLog, {
      action: 'Deposit Declined',
      actor: `${session.role} (${session.username})`,
      timestamp: new Date().toISOString(),
      details: reason || 'No reason provided'
    }];

    await prisma.depositRequest.update({
      where: { id },
      data: {
        status: 'Declined',
        declinedBy: `${session.role} (${session.username})`,
        declinedAt: new Date().toISOString(),
        declineReason: reason || 'No reason provided',
        auditLogJson: JSON.stringify(updatedLog)
      }
    });

    // Notify customer (balance is NOT changed)
    await prisma.notification.create({
      data: {
        title: '❌ Deposit Request Declined',
        message: `Your deposit request of ₦${request.amount.toLocaleString()} for "${request.goalName}" was declined. Reason: ${reason || 'Contact support for details.'}`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        isRead: false,
        type: 'error',
        username: request.customerUsername
      }
    });

    await logAudit(`Deposit Declined: ${id} | Reason: ${reason}`, session.username, session.role, request.customerUsername);
    res.json({ success: true });

  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Legacy PUT endpoint (for backward compat — non-approve/decline status changes like proof upload)
app.put('/api/deposit-requests/:id', async (req, res) => {
  const { id } = req.params;
  const { status, actor, actorRole, proofUrl, notes } = req.body;

  // Block approve/decline through this endpoint — must use dedicated endpoints
  if (status === 'Credited' || status === 'Declined') {
    return res.status(400).json({ error: 'Use /approve or /decline endpoints for approval decisions.' });
  }

  try {
    const currentReq = await prisma.depositRequest.findUnique({ where: { id } });
    if (!currentReq) return res.status(404).json({ error: 'Deposit request not found' });

    const currentAuditLog = JSON.parse(currentReq.auditLogJson);
    const updatedAuditLog = [...currentAuditLog, {
      action: `Status updated to ${status}`,
      actor: `${actorRole} (${actor})`,
      timestamp: new Date().toISOString(),
      details: notes
    }];

    const updateData: any = { status, auditLogJson: JSON.stringify(updatedAuditLog) };
    if (proofUrl) updateData.proofOfPaymentUrl = proofUrl;
    if (notes) updateData.notes = notes;

    await prisma.depositRequest.update({ where: { id }, data: updateData });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── CATEGORIES ───────────────────────────────────────────────────────────────

app.get('/api/categories', async (req, res) => {
  try {
    const cats = await prisma.savingsCategory.findMany();
    res.json(cats);
  } catch (e: any) {
    res.status(500).json({ error: 'Database error: ' + e.message });
  }
});

app.post('/api/categories', async (req, res) => {
  const { id, name, icon, color } = req.body;
  try {
    const newCat = await prisma.savingsCategory.create({ data: { id, name, icon, color } });
    res.json(newCat);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await prisma.savingsCategory.update({ where: { id }, data: req.body });
    res.json(updated);
  } catch (e: any) {
    res.status(404).json({ error: 'Category not found' });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.savingsCategory.delete({ where: { id } });
    res.json({ success: true });
  } catch (e: any) {
    res.status(404).json({ error: 'Category not found' });
  }
});

// ─── WITHDRAWALS ──────────────────────────────────────────────────────────────

app.get('/api/withdrawals', async (req, res) => {
  const ws = await prisma.withdrawalRequest.findMany();
  res.json(ws);
});

app.post('/api/withdrawals', async (req, res) => {
  const { req: withdrawalReq, username } = req.body;
  try {
    await prisma.withdrawalRequest.create({
      data: {
        id: withdrawalReq.id,
        goalId: withdrawalReq.goalId,
        goalName: withdrawalReq.goalName,
        amount: withdrawalReq.amount,
        withdrawalType: withdrawalReq.withdrawalType,
        reason: withdrawalReq.reason,
        bankAccount: withdrawalReq.bankAccount,
        date: withdrawalReq.date,
        status: withdrawalReq.status || 'Pending',
        fee: withdrawalReq.fee || 0.0
      }
    });
    await logAudit(`Withdrawal Request: ₦${withdrawalReq.amount?.toLocaleString()}`, username, 'Customer', username);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/withdrawals/:id', async (req, res) => {
  const { id } = req.params;
  const { status, actorName, actorRole } = req.body;

  try {
    const currentReq = await prisma.withdrawalRequest.findUnique({ where: { id } });
    if (!currentReq) return res.status(404).json({ error: 'Withdrawal not found' });

    if (status === 'Approved') {
      const goal = await prisma.savingsGoal.findUnique({ where: { id: currentReq.goalId } });
      if (goal) {
        const newBalance = Math.max(0, goal.amountSaved - currentReq.amount);
        await prisma.savingsGoal.update({ where: { id: currentReq.goalId }, data: { amountSaved: newBalance } });

        await prisma.transaction.create({
          data: {
            receiptNumber: `REC-WD-${Date.now()}`,
            transactionId: currentReq.id,
            goalName: currentReq.goalName,
            goalId: currentReq.goalId,
            amount: currentReq.amount,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
            paymentMethod: 'Bank Transfer Payout',
            balanceAfter: newBalance,
            type: 'Withdrawal',
            status: 'Successful',
            customerName: 'Customer'
          }
        });
      }
    }

    await prisma.withdrawalRequest.update({ where: { id }, data: { status } });
    await logAudit(`Withdrawal ${status}: ${id}`, actorName, actorRole, 'Customer');
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── TRANSACTIONS ─────────────────────────────────────────────────────────────

app.get('/api/transactions', async (req, res) => {
  try {
    const txs = await prisma.transaction.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(txs);
  } catch (e: any) {
    res.status(500).json({ error: 'Database error: ' + e.message });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    await prisma.transaction.create({ data: req.body });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

app.get('/api/notifications', async (req, res) => {
  try {
    const notifs = await prisma.notification.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(notifs);
  } catch (e: any) {
    res.status(500).json({ error: 'Database error: ' + e.message });
  }
});

app.post('/api/notifications', async (req, res) => {
  try {
    await prisma.notification.create({ data: req.body });
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/notifications/read-all', async (req, res) => {
  await prisma.notification.updateMany({ data: { isRead: true } });
  res.json({ success: true });
});

// ─── AUDIT LOGS ───────────────────────────────────────────────────────────────

app.get('/api/audit-logs', async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({ orderBy: { timestamp: 'desc' }, take: 500 });
    res.json(logs);
  } catch (e: any) {
    res.status(500).json({ error: 'Database error: ' + e.message });
  }
});

app.post('/api/audit-logs', async (req, res) => {
  const { action, username, role } = req.body;
  await logAudit(action, username, role, username);
  res.json({ success: true });
});

// ─── AGENT ASSIGNMENT ─────────────────────────────────────────────────────────

app.put('/api/users/:username/assign-agent', async (req, res) => {
  const session = verifyToken(req, res);
  if (!session) return;
  if (!['Admin', 'Super Admin'].includes(session.role)) {
    return res.status(403).json({ error: 'Only Admin can assign agents.' });
  }

  const { username } = req.params;
  const { agentUsername } = req.body;
  try {
    await prisma.user.update({ where: { username }, data: { assignedAgentUsername: agentUsername } });
    await logAudit(`Customer ${username} assigned to Agent ${agentUsername}`, session.username, session.role, username);
    res.json({ success: true });
  } catch (e) {
    res.status(404).json({ error: 'User not found' });
  }
});

// ─── PAYSTACK WEBHOOK ─────────────────────────────────────────────────────────

app.post('/api/payments/paystack/webhook', async (req, res) => {
  const { event, data } = req.body;
  const signature = req.headers['x-paystack-signature'];
  if (!signature) return res.status(401).json({ status: 'error', message: 'Unauthorized webhook.' });

  try {
    if (event === 'charge.success') {
      const amount = data.amount / 100;
      const email = data.customer.email;
      const goalId = data.metadata?.goalId;

      const user = await prisma.user.findFirst({ where: { email } });
      if (!user) return res.status(404).json({ status: 'error', message: 'Customer not found.' });

      const goal = await prisma.savingsGoal.findFirst({ where: { id: goalId, username: user.username } });
      if (!goal) return res.status(404).json({ status: 'error', message: 'Goal not found or does not belong to this customer.' });

      await prisma.$transaction(async (tx) => {
        const newBalance = goal.amountSaved + amount;
        await tx.savingsGoal.update({ where: { id: goal.id }, data: { amountSaved: newBalance } });

        const receiptNumber = `PAYSTACK-${data.reference}`;
        await tx.transaction.create({
          data: {
            receiptNumber,
            transactionId: data.reference,
            goalName: goal.name,
            goalId: goal.id,
            amount,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
            paymentMethod: 'Paystack Virtual Account',
            balanceAfter: newBalance,
            type: 'Deposit',
            status: 'Successful',
            customerName: user.fullName
          }
        });

        await tx.notification.create({
          data: {
            title: '💳 Paystack Payment Credited',
            message: `₦${amount.toLocaleString()} credited to "${goal.name}". New balance: ₦${newBalance.toLocaleString()}.`,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
            isRead: false,
            type: 'success',
            username: user.username
          }
        });
      });

      await logAudit(`Paystack Credit: ₦${amount.toLocaleString()} → "${goal.name}"`, user.username, 'Customer', user.username);
    }

    res.json({ status: 'success' });
  } catch (e: any) {
    res.status(500).json({ status: 'error', message: e.message });
  }
});

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────

app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const dbUrl = process.env.DATABASE_URL || '';
    const provider = dbUrl.startsWith('mysql') ? 'MySQL' : dbUrl.startsWith('postgresql') ? 'PostgreSQL' : 'Unknown';
    res.json({
      status: 'ok',
      database: provider,
      timestamp: new Date().toISOString()
    });
  } catch (e: any) {
    res.status(503).json({ status: 'error', database: 'unreachable', error: e.message });
  }
});

// ─── SEED & START ─────────────────────────────────────────────────────────────

const seedInitialData = async () => {
  // Only create admin accounts if they don't exist — never overwrite production data
  const adminHash = await bcrypt.hash('admin', 10);
  const superHash = await bcrypt.hash('super123', 10);

  const adminExists = await prisma.user.findFirst({ where: { username: 'admin' } });
  if (!adminExists) {
    await prisma.user.create({
      data: {
        fullName: 'JOLAS Admin',
        username: 'admin',
        email: 'admin@jolas.com',
        phoneNumber: '',
        dob: '1980-01-01',
        gender: 'Male',
        address: '',
        state: '',
        lga: '',
        occupation: 'Platform Administrator',
        nextOfKinName: '',
        nextOfKinRelationship: '',
        nextOfKinPhone: '',
        bankName: '',
        accountNumber: '',
        accountName: '',
        passwordHash: adminHash,
        role: 'Admin'
      }
    });
    console.log('Admin account created.');
  }

  const superExists = await prisma.user.findFirst({ where: { username: 'superadmin' } });
  if (!superExists) {
    await prisma.user.create({
      data: {
        fullName: 'JOLAS Super Admin',
        username: 'superadmin',
        email: 'superadmin@jolas.com',
        phoneNumber: '',
        dob: '1979-01-01',
        gender: 'Male',
        address: '',
        state: '',
        lga: '',
        occupation: 'Root Administrator',
        nextOfKinName: '',
        nextOfKinRelationship: '',
        nextOfKinPhone: '',
        bankName: '',
        accountNumber: '',
        accountName: '',
        passwordHash: superHash,
        role: 'Super Admin'
      }
    });
    console.log('Super Admin account created.');
  }

  const categoriesCount = await prisma.savingsCategory.count();
  if (categoriesCount === 0) {
    await prisma.savingsCategory.createMany({
      data: [
        { id: 'cat-rent', name: 'House Rent', icon: '🏠', color: 'from-amber-400 to-orange-500' },
        { id: 'cat-school', name: 'School Fees', icon: '🎓', color: 'from-blue-450 to-indigo-600' },
        { id: 'cat-elec', name: 'Electronics', icon: '💻', color: 'from-violet-400 to-purple-600' },
        { id: 'cat-travel', name: 'Travel', icon: '✈️', color: 'from-emerald-450 to-teal-600' },
        { id: 'cat-emergency', name: 'Emergency Fund', icon: '⭐', color: 'from-rose-400 to-pink-500' }
      ]
    });
    console.log('Default savings categories seeded.');
  }
};

seedInitialData()
  .then(() => {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });

    app.listen(PORT, () => {
      console.log(`JOLAS SAVE Production API running on port ${PORT}`);
      console.log(`Database: ${process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'configured'}`);
    });
  })
  .catch((e) => {
    console.error('FATAL: Failed to connect to database or seed:', e.message);
    process.exit(1);
  });
