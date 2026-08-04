import React, { useState, useEffect } from 'react';
import { 
  UserProfile, 
  SavingsGoal, 
  Transaction, 
  WithdrawalRequest, 
  SystemNotification, 
  MembershipLog, 
  SupportTicket, 
  UserRole,
  DepositRequest,
  DepositRequestStatus,
  InforgeAuditLog
} from './types';



import { SplashAndOnboarding } from './components/SplashAndOnboarding';
import { HomeMarketingView } from './components/HomeMarketingView';
import { AuthFlow } from './components/AuthFlow';
import { TopBar, DesktopSidebar, BottomNav } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { GoalsView } from './components/GoalsView';
import { DepositView } from './components/DepositView';
import { WithdrawalView } from './components/WithdrawalView';
import { TransactionsView } from './components/TransactionsView';
import { ReportsView } from './components/ReportsView';
import { MembershipView } from './components/MembershipView';
import { ProfileView } from './components/ProfileView';
import { HelpSupportView } from './components/HelpSupportView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { AgentDashboardView } from './components/AgentDashboardView';
import { SuperAdminDashboardView } from './components/SuperAdminDashboardView';
import { Modal, Receipt } from './components/UIComponents';
import { Shield, Sparkles, RefreshCw, Layers } from 'lucide-react';
import { InforgeBaaS } from './lib/inforge';

export default function App() {
  // Navigation & Screen States
  const [sessionState, setSessionState] = useState<'splash' | 'marketing' | 'auth' | 'app'>('splash');
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.CUSTOMER);

  // Core Synchronized Application States
  const [userProfile, setUserProfile] = useState<UserProfile>({} as UserProfile);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [membershipLogs, setMembershipLogs] = useState<MembershipLog[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<InforgeAuditLog[]>([]);

  // System Configurations
  const [maintenanceModeActive, setMaintenanceModeActive] = useState(false);
  const [activeReceiptTx, setActiveReceiptTx] = useState<Transaction | null>(null);

  // Static prefilled users list for admin compliance screens
  const [usersList, setUsersList] = useState<UserProfile[]>([]);

  // Initialize Inforge and subscribe to updates
  useEffect(() => {
    // 1. Initialize Inforge BaaS database collections and audit logs
    InforgeBaaS.initialize();

    // 2. Load active session if any, otherwise fall back to INITIAL_CUSTOMER_PROFILE
    const session = InforgeBaaS.auth.getCurrentSession();
    if (session) {
      setUserProfile(session);
      if (session.role === UserRole.ADMIN) {
        setCurrentRole(UserRole.ADMIN);
        setCurrentView('admin_dashboard');
      } else if (session.role === UserRole.SUPER_ADMIN) {
        setCurrentRole(UserRole.SUPER_ADMIN);
        setCurrentView('super_dashboard');
      } else if (session.role === UserRole.AGENT) {
        setCurrentRole(UserRole.AGENT);
        setCurrentView('agent_dashboard');
      } else {
        setCurrentRole(UserRole.CUSTOMER);
        setCurrentView('dashboard');
      }
      setSessionState('app');
    } else {
      // No active session — leave userProfile as empty default (login required)
      setUserProfile({ fullName: '', username: '', email: '', phoneNumber: '', dob: '', gender: '', address: '', state: '', lga: '', occupation: '', nextOfKin: { name: '', relationship: '', phoneNumber: '' }, bankName: '', accountNumber: '', accountName: '', isKycVerified: false, kycStatus: 'Unverified', twoFactorEnabled: false, status: 'Active' } as any);
    }

    // 3. Populate starting states from Inforge DB
    setGoals(InforgeBaaS.db.savingsGoals.getAll());
    setTransactions(InforgeBaaS.db.transactions.getAll());
    setWithdrawalRequests(InforgeBaaS.db.withdrawals.getAll());
    setDepositRequests(InforgeBaaS.db.depositRequests.getAll());
    setNotifications(InforgeBaaS.db.notifications.getAll());
    setAuditLogs(InforgeBaaS.db.auditLogs.getAll());
    setUsersList(InforgeBaaS.db.users.getAll());
    setCategories(InforgeBaaS.db.categories.getAll());

    // 4. Setup Inforge WebSocket-like Real-Time listeners (auto-renders on update)
    const unsubGoals = InforgeBaaS.realtime.subscribe('savings_goals', (data) => setGoals(data));
    const unsubTxs = InforgeBaaS.realtime.subscribe('transactions', (data) => setTransactions(data));
    const unsubWithdrawals = InforgeBaaS.realtime.subscribe('withdrawals', (data) => setWithdrawalRequests(data));
    const unsubDeposits = InforgeBaaS.realtime.subscribe('deposit_requests', (data) => {
      setDepositRequests(data);
    });
    const unsubNotifs = InforgeBaaS.realtime.subscribe('notifications', (data) => setNotifications(data));
    const unsubLogs = InforgeBaaS.realtime.subscribe('audit_logs', (data) => setAuditLogs(data));
    const unsubUsers = InforgeBaaS.realtime.subscribe('users', () => {
      setUsersList(InforgeBaaS.db.users.getAll());
    });
    const unsubCats = InforgeBaaS.realtime.subscribe('savings_categories', (data) => setCategories(data));

    return () => {
      unsubGoals();
      unsubTxs();
      unsubWithdrawals();
      unsubDeposits();
      unsubNotifs();
      unsubLogs();
      unsubUsers();
      unsubCats();
    };
  }, []);

  // Re-fetch live MySQL data whenever navigation view changes (e.g. entering Admin Dashboard)
  useEffect(() => {
    if (sessionState === 'app') {
      InforgeBaaS.initialize();
    }
  }, [currentView, sessionState]);

  // Update user session profile if updated
  useEffect(() => {
    if (userProfile && sessionState === 'app') {
      const users = InforgeBaaS.db.users.getAll();
      const matched = users.find(u => u.username === userProfile.username);
      if (matched) {
        setUsersList(prev => prev.map(u => u.username === userProfile.username ? { ...u, ...userProfile } : u));
      }
    }
  }, [userProfile, sessionState]);

  // Real-time live interest yield ticking simulation (Removed)

  // Handle successful deposit top-ups
  const handleDepositSuccess = (goalId: string, amount: number, paymentMethod: string) => {
    // 1. Update goals state
    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        return { ...g, amountSaved: g.amountSaved + amount };
      }
      return g;
    }));

    // 2. Generate transaction record
    const targetGoal = goals.find(g => g.id === goalId);
    const goalName = targetGoal ? targetGoal.name : 'Custom Goal';
    const cleanAmount = Number(amount);
    const receiptNum = 'RCPT' + Math.floor(Math.random() * 900000 + 100000);
    const txId = 'TXN_' + Math.floor(Math.random() * 9000000000 + 1000000000);
    
    const newTx: Transaction = {
      id: 'tx-gen-' + Math.random(),
      receiptNumber: receiptNum,
      transactionId: txId,
      goalName: goalName,
      goalId: goalId,
      amount: cleanAmount,
      date: 'Today',
      time: new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }),
      paymentMethod: paymentMethod,
      balanceAfter: (targetGoal?.amountSaved || 0) + cleanAmount,
      type: 'Deposit',
      status: 'Successful',
      customerName: userProfile.fullName
    };

    setTransactions(prev => [newTx, ...prev]);

    // 3. Post notification
    const notif: SystemNotification = {
      id: 'n-gen-' + Math.random(),
      title: 'Deposit Credited',
      message: `₦${cleanAmount.toLocaleString()} securely credited to your ${goalName} plan via ${paymentMethod}.`,
      date: 'Today',
      time: new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      type: 'success'
    };
    setNotifications(prev => [notif, ...prev]);
  };

  // Handle submit withdrawal payout request
  const handleWithdrawalRequestSubmit = (req: Partial<WithdrawalRequest>) => {
    const fullRequest = req as WithdrawalRequest;
    InforgeBaaS.db.withdrawals.add(fullRequest, userProfile.username);
  };

  // Admin approves withdrawal request (deducts funds from goal savings balance!)
  const handleApproveWithdrawal = (id: string) => {
    const actorName = currentRole === UserRole.SUPER_ADMIN ? 'Super Admin' : 'Admin';
    InforgeBaaS.db.withdrawals.approve(id, actorName, currentRole);
  };

  // Admin rejects withdrawal request
  const handleRejectWithdrawal = (id: string) => {
    const actorName = currentRole === UserRole.SUPER_ADMIN ? 'Super Admin' : 'Admin';
    InforgeBaaS.db.withdrawals.reject(id, actorName, currentRole);
  };

  const [agentCanCredit, setAgentCanCredit] = useState<boolean>(true);

  // Customer creates a new deposit request
  const handleCreateDepositRequest = (req: DepositRequest) => {
    InforgeBaaS.db.depositRequests.add(req, userProfile.username);
  };

  // Customer updates progress or uploads receipt evidence
  const handleUpdateDepositRequestStatus = (reqId: string, status: DepositRequestStatus, proofUrl?: string, notes?: string) => {
    InforgeBaaS.db.depositRequests.updateStatus(reqId, status, userProfile.username, currentRole, proofUrl, notes);
  };

  // Admin or Agent verifies, rejects, or credits manual deposit requests
  const handleVerifyDepositRequest = (reqId: string, action: 'verify' | 'credit' | 'reject', notes?: string) => {
    const actorName = currentRole === UserRole.ADMIN ? 'Admin' : 'Agent';

    if (action === 'credit') {
      InforgeBaaS.db.depositRequests.updateStatus(reqId, DepositRequestStatus.CREDITED, actorName, currentRole, undefined, notes);
    } else if (action === 'verify') {
      InforgeBaaS.db.depositRequests.updateStatus(reqId, DepositRequestStatus.VERIFIED, actorName, currentRole, undefined, notes);
    } else if (action === 'reject') {
      InforgeBaaS.db.depositRequests.updateStatus(reqId, DepositRequestStatus.REJECTED, actorName, currentRole, undefined, notes);
    }
  };

  // Admin broadcasts message to all users
  const handleBroadcastAnnouncement = (title: string, msg: string) => {
    const notif: SystemNotification = {
      id: 'n-gen-' + Math.random(),
      title: `📣 Broadcast: ${title}`,
      message: msg,
      date: 'Today',
      time: new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      type: 'alert'
    };
    setNotifications(prev => [notif, ...prev]);
  };

  // Pay Monthly Membership Fee
  const handlePayMembershipFee = (month: string, amount: number) => {
    // 1. Update logs status to Paid
    setMembershipLogs(prev => prev.map(l => {
      if (l.month === month) {
        return { ...l, status: 'Paid', paidDate: 'Today' };
      }
      return l;
    }));

    // 2. Append transaction history
    const cleanAmount = Number(amount);
    const receiptNum = 'RCPT-MEM-' + Math.floor(Math.random() * 90000 + 1000);
    const txId = 'TXN_MEM_' + Math.floor(Math.random() * 900000 + 100000);

    const newTx: Transaction = {
      id: 'tx-gen-' + Math.random(),
      receiptNumber: receiptNum,
      transactionId: txId,
      goalName: `Monthly Membership Clearance (${month})`,
      amount: cleanAmount,
      date: 'Today',
      time: new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' }),
      paymentMethod: 'Debit Card',
      balanceAfter: 0,
      type: 'Membership Fee',
      status: 'Successful',
      customerName: userProfile.fullName
    };

    setTransactions(prev => [newTx, ...prev]);
  };

  // Support tickets send/reply
  const handleSendSupportReply = (ticketId: string, msg: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: 'Open',
          replies: [
            ...t.replies,
            {
              sender: currentRole === UserRole.CUSTOMER ? 'User' : 'Support',
              message: msg,
              timestamp: new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
            }
          ]
        };
      }
      return t;
    }));
  };

  // Quick-switch login for Admin/SuperAdmin roles (Customer shortcut removed — no demo customer account)
  const handleSandboxRoleLogin = async (role: 'Customer' | 'Agent' | 'Admin' | 'Super Admin') => {
    let email = '';
    let pass = '';
    let targetView = 'dashboard';
    let targetRole = UserRole.CUSTOMER;

    if (role === 'Admin') {
      email = 'admin@jolas.com';
      pass = 'admin';
      targetView = 'admin_dashboard';
      targetRole = UserRole.ADMIN;
    } else if (role === 'Super Admin') {
      email = 'superadmin@jolas.com';
      pass = 'super123';
      targetView = 'super_dashboard';
      targetRole = UserRole.SUPER_ADMIN;
    } else {
      // Customer/Agent shortcut: no demo accounts exist — route to real login
      setSessionState('auth');
      return;
    }

    const res = await InforgeBaaS.auth.login(email, pass);
    if (res.success && res.user) {
      setUserProfile(res.user);
    }
    setCurrentRole(targetRole);
    setCurrentView(targetView);
    setSessionState('app');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased">
      
      {/* 1. Splash & Onboarding Launcher */}
      {sessionState === 'splash' && (
        <SplashAndOnboarding onComplete={() => setSessionState('marketing')} />
      )}

      {/* 2. Landing Marketing Page */}
      {sessionState === 'marketing' && (
        <HomeMarketingView 
          onGetStarted={() => setSessionState('auth')} 
          onAdminLogin={handleSandboxRoleLogin}
        />
      )}

      {/* 3. Onboarding & Registration / Login Forms */}
      {sessionState === 'auth' && (
        <AuthFlow 
          onAuthSuccess={(profile, role) => {
            setUserProfile(profile);
            if (role === 'Admin') {
              setCurrentRole(UserRole.ADMIN);
              setCurrentView('admin_dashboard');
            } else if (role === 'Super Admin') {
              setCurrentRole(UserRole.SUPER_ADMIN);
              setCurrentView('super_dashboard');
            } else {
              setCurrentRole(UserRole.CUSTOMER);
              setCurrentView('dashboard');
            }
            setSessionState('app');
          }}
          onBackToMarketing={() => setSessionState('marketing')}
        />
      )}

      {/* 4. Core Application Console */}
      {sessionState === 'app' && (
        <div className="flex min-h-screen relative">
          
          {/* Collapsible/Fixed Desktop Sidebar */}
          <DesktopSidebar 
            currentView={currentView}
            setCurrentView={setCurrentView}
            userProfile={userProfile}
            userRole={currentRole}
            onLogout={() => setSessionState('marketing')}
            unreadNotifications={notifications.filter(n => !n.isRead).length}
          />

          {/* Primary View Area */}
          <div className="flex-1 flex flex-col min-w-0">
            
            {/* Top Common Header */}
            <TopBar 
              currentView={currentView}
              setCurrentView={setCurrentView}
              userProfile={userProfile}
              userRole={currentRole}
              onLogout={() => setSessionState('marketing')}
              unreadNotifications={notifications.filter(n => !n.isRead).length}
            />

            {/* Dynamic Layout Router */}
            <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-5xl w-full mx-auto overflow-y-auto">
              
              {/* MAINTENANCE BLOCK */}
              {maintenanceModeActive && currentRole === UserRole.CUSTOMER ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-red-150 shadow-md max-w-md mx-auto space-y-4">
                  <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                    <Shield size={32} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">System Under Audit Maintenance</h2>
                  <p className="text-slate-500 text-xs px-4">
                    JOLAS SAVE cloud servers are currently undergoing database indexing. Your secure wealth assets remain perfectly backed. Check back shortly.
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">Status code: SEC_MAINT_503</p>
                </div>
              ) : (
                <>
                  {/* CUSTOMER Dashboard views */}
                  {currentView === 'dashboard' && currentRole === UserRole.CUSTOMER && (
                    <DashboardView 
                      userProfile={userProfile}
                      goals={goals}
                      transactions={transactions}
                      depositRequests={depositRequests}
                      onQuickAction={(action) => {
                        if (action === 'create_goal') setCurrentView('goals');
                        else if (action === 'deposit') setCurrentView('deposit');
                        else if (action === 'withdraw') setCurrentView('withdraw');
                        else if (action === 'reports') setCurrentView('reports');
                        else if (action === 'membership') setCurrentView('membership');
                        else setCurrentView(action);
                      }}
                      onViewTransaction={(tx) => setActiveReceiptTx(tx)}
                    />
                  )}

                  {currentView === 'goals' && currentRole === UserRole.CUSTOMER && (
                    <GoalsView 
                      goals={goals}
                      categories={categories}
                      onCreateGoal={(goalData) => {
                        const newId = 'g-gen-' + Math.floor(Math.random() * 1000 + 100);
                        const newGoal: SavingsGoal = {
                          ...(goalData as SavingsGoal),
                          id: newId
                        };
                        InforgeBaaS.db.savingsGoals.add(newGoal, userProfile.username);
                        
                        // Push automatic notification
                        const notif: SystemNotification = {
                          id: 'n-gen-' + Math.random(),
                          title: 'New Target Goal Created',
                          message: `Goal "${newGoal.name}" has been registered successfully.`,
                          date: 'Today',
                          time: 'Just now',
                          isRead: false,
                          type: 'success'
                        };
                        setNotifications(prev => [notif, ...prev]);
                      }}
                      onSelectGoalForDeposit={(goalId) => {
                        setCurrentView('deposit');
                      }}
                      onSelectGoalForWithdraw={(goalId) => {
                        setCurrentView('withdraw');
                      }}
                    />
                  )}

                  {currentView === 'deposit' && currentRole === UserRole.CUSTOMER && (
                    <DepositView 
                      goals={goals}
                      depositRequests={depositRequests}
                      onCreateDepositRequest={handleCreateDepositRequest}
                      onUpdateDepositRequestStatus={handleUpdateDepositRequestStatus}
                      userProfile={userProfile}
                      onViewReceipt={(tx) => setActiveReceiptTx(tx)}
                      onNavigateToGoals={() => setCurrentView('goals')}
                    />
                  )}

                  {currentView === 'withdraw' && currentRole === UserRole.CUSTOMER && (
                    <WithdrawalView 
                      goals={goals}
                      linkedBank={{ bankName: userProfile.bankName, accountNumber: userProfile.accountNumber, accountName: userProfile.accountName }}
                      onWithdrawalRequest={handleWithdrawalRequestSubmit}
                      withdrawalHistory={withdrawalRequests}
                    />
                  )}

                  {currentView === 'activity' && currentRole === UserRole.CUSTOMER && (
                    <TransactionsView 
                      transactions={transactions}
                      onViewReceipt={(tx) => setActiveReceiptTx(tx)}
                      userProfile={userProfile}
                    />
                  )}

                  {currentView === 'reports' && currentRole === UserRole.CUSTOMER && (
                    <ReportsView 
                      goals={goals}
                      transactions={transactions}
                    />
                  )}

                  {currentView === 'membership' && currentRole === UserRole.CUSTOMER && (
                    <MembershipView 
                      logs={membershipLogs}
                      onPayMembership={handlePayMembershipFee}
                    />
                  )}

                  {currentView === 'profile' && currentRole === UserRole.CUSTOMER && (
                    <ProfileView 
                      userProfile={userProfile}
                      onUpdateProfile={(updated) => setUserProfile(prev => ({ ...prev, ...updated }))}
                      onLogout={() => { InforgeBaaS.auth.logout(); setSessionState('marketing'); }}
                    />
                  )}

                  {currentView === 'support' && currentRole === UserRole.CUSTOMER && (
                    <HelpSupportView 
                      tickets={tickets}
                      onSubmitTicket={(newTkt) => setTickets(prev => [newTkt as SupportTicket, ...prev])}
                      onSendReply={handleSendSupportReply}
                    />
                  )}

                  {/* NOTIFICATION CENTER LIST (Universal) */}
                  {currentView === 'notifications' && (
                    <div className="space-y-4 max-w-lg mx-auto pb-20 md:pb-6">
                      <div className="flex justify-between items-center pb-2 border-b">
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Notification Bulletin</h2>
                        <button 
                          onClick={() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))}
                          className="text-xs font-bold text-emerald-600 hover:underline"
                          id="mark-all-read-btn"
                        >
                          Mark all as read
                        </button>
                      </div>

                      {notifications.length > 0 ? (
                        <div className="space-y-2.5">
                          {notifications.map(notif => (
                            <div 
                              key={notif.id}
                              className={`p-4 rounded-2xl border flex items-start gap-3 transition-colors ${
                                notif.isRead 
                                  ? 'bg-white border-slate-100' 
                                  : 'bg-emerald-50/40 border-emerald-100'
                              }`}
                            >
                              <div className={`p-1.5 rounded-lg mt-0.5 ${
                                notif.type === 'success' 
                                  ? 'bg-emerald-100 text-emerald-700' 
                                  : notif.type === 'warning'
                                    ? 'bg-amber-100 text-amber-700'
                                    : notif.type === 'alert'
                                      ? 'bg-purple-100 text-purple-700'
                                      : 'bg-blue-100 text-blue-700'
                              }`}>
                                <Shield size={14} />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-xs font-bold text-slate-800">{notif.title}</h4>
                                <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{notif.message}</p>
                                <span className="block text-[9px] font-mono text-slate-400 mt-1.5">{notif.date} • {notif.time}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <p className="text-slate-400 text-xs">No notifications yet.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* AGENT PANEL VIEWS */}
                  {(currentView === 'agent_dashboard' || currentView.startsWith('agent_')) && currentRole === UserRole.AGENT && (
                    <AgentDashboardView 
                      depositRequests={depositRequests}
                      onVerifyDepositRequest={handleVerifyDepositRequest}
                      usersList={usersList}
                      agentCanCredit={agentCanCredit}
                      userProfile={userProfile}
                    />
                  )}

                  {/* ADMIN PANEL VIEWS */}
                  {(currentView === 'admin_dashboard' || currentView.startsWith('admin_')) && currentRole === UserRole.ADMIN && (
                    <AdminDashboardView 
                      currentView={currentView}
                      setCurrentView={setCurrentView}
                      withdrawalRequests={withdrawalRequests}
                      onApproveWithdrawal={handleApproveWithdrawal}
                      onRejectWithdrawal={handleRejectWithdrawal}
                      onBroadcastAnnouncement={handleBroadcastAnnouncement}
                      usersList={usersList}
                      goalsList={goals}
                      transactionsList={transactions}
                      onToggleUserStatus={(username, status) => {
                        setUsersList(prev => prev.map(u => u.username === username ? { ...u, status } : u));
                        if (username === userProfile.username) {
                          setUserProfile(prev => ({ ...prev, status }));
                        }
                        alert(`User @${username} account status updated to: ${status}`);
                      }}
                      categoriesList={categories}
                      onAddCategory={(name, icon) => {
                        const newCat = {
                          id: 'cat-' + Math.floor(Math.random() * 900 + 100),
                          name,
                          icon,
                          color: 'from-slate-400 to-slate-600'
                        };
                        InforgeBaaS.db.categories.add(newCat);
                      }}
                      depositRequests={depositRequests}
                      onVerifyDepositRequest={handleVerifyDepositRequest}
                      onAssignAgent={(customerUsername, agentUsername) => {
                        InforgeBaaS.db.users.updateProfile(customerUsername, { assignedAgentUsername: agentUsername || undefined });
                      }}
                    />
                  )}

                  {/* SUPER ADMIN PANEL VIEWS */}
                  {(currentView === 'super_dashboard' || currentView.startsWith('super_')) && currentRole === UserRole.SUPER_ADMIN && (
                    <SuperAdminDashboardView 
                      onToggleMaintenanceMode={() => {
                        setMaintenanceModeActive(!maintenanceModeActive);
                        alert(`Maintenance mode: ${!maintenanceModeActive ? 'ENGAGED' : 'DISENGAGE'}`);
                      }}
                      maintenanceModeActive={maintenanceModeActive}
                      agentCanCredit={agentCanCredit}
                      onToggleAgentCanCredit={() => {
                        setAgentCanCredit(!agentCanCredit);
                        alert(`Agent direct credit permission: ${!agentCanCredit ? 'ENABLED' : 'DISABLED'}`);
                      }}
                      auditLogs={auditLogs}
                    />
                  )}
                </>
              )}

            </main>

            {/* Sticky Mobile bottom navigation */}
            <BottomNav 
              currentView={currentView}
              setCurrentView={setCurrentView}
              userProfile={userProfile}
              userRole={currentRole}
              onLogout={() => setSessionState('marketing')}
              unreadNotifications={notifications.filter(n => !n.isRead).length}
            />

          </div>

          {/* ACTIVE RECEIPT MODAL VIEWER */}
          <Modal 
            isOpen={activeReceiptTx !== null} 
            onClose={() => setActiveReceiptTx(null)} 
            title="Secure Receipt Viewer"
          >
            {activeReceiptTx && (
              <Receipt transaction={activeReceiptTx} onClose={() => setActiveReceiptTx(null)} />
            )}
          </Modal>

        </div>
      )}

    </div>
  );
}
