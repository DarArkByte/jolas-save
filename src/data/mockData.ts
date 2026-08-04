import { 
  UserProfile, 
  SavingsGoal, 
  Transaction, 
  WithdrawalRequest, 
  SystemNotification, 
  MembershipLog, 
  SupportTicket,
  DepositFrequency
} from '../types';

export const INITIAL_CUSTOMER_PROFILE: UserProfile = {
  fullName: 'Chinaza John',
  username: 'chinazajohn',
  email: 'chinazajohn@gmail.com',
  phoneNumber: '0803 123 4567',
  dob: '1998-05-14',
  gender: 'Female',
  address: 'Block B2, Chevron Drive, Lekki',
  state: 'Lagos',
  lga: 'Eti-Osa',
  occupation: 'Software Engineer',
  passportPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
  nextOfKin: {
    name: 'Obinna John',
    relationship: 'Brother',
    phoneNumber: '0803 987 6543'
  },
  bankName: 'GTBank',
  accountNumber: '0123456789',
  accountName: 'Chinaza John',
  bvn: '22211133344',
  nin: '12345678901',
  referralCode: 'JOLAS-CHINAZA',
  isKycVerified: true,
  kycStatus: 'Verified',
  twoFactorEnabled: false,
  status: 'Active'
};

export const INITIAL_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: 'g-1',
    name: 'House Rent',
    category: 'House Rent',
    targetAmount: 600000,
    frequency: DepositFrequency.MONTHLY,
    expectedDeposit: 50000,
    amountSaved: 390000,
    startDate: '2025-05-15',
    endDate: '2026-05-15',
    withdrawalDate: '2026-05-15',
    reminderEnabled: true,
    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=300',
    notes: 'For next year Lekki apartment rent renew',
    status: 'Active',
    apy: 0,
    accruedInterest: 0,
    username: 'chinazajohn'
  },
  {
    id: 'g-2',
    name: 'School Fees',
    category: 'School Fees',
    targetAmount: 150000,
    frequency: DepositFrequency.WEEKLY,
    expectedDeposit: 10000,
    amountSaved: 120000,
    startDate: '2025-10-01',
    endDate: '2026-03-01',
    withdrawalDate: '2026-03-01',
    reminderEnabled: true,
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=300',
    notes: 'Postgrad tuition installment',
    status: 'Active',
    apy: 0,
    accruedInterest: 0,
    username: 'chinazajohn'
  },
  {
    id: 'g-3',
    name: 'Laptop Purchase',
    category: 'Electronics',
    targetAmount: 250000,
    frequency: DepositFrequency.MONTHLY,
    expectedDeposit: 30000,
    amountSaved: 100000,
    startDate: '2025-08-01',
    endDate: '2026-04-01',
    withdrawalDate: '2026-04-01',
    reminderEnabled: false,
    imageUrl: 'https://images.unsplash.com/photo-1496181130204-755241544e35?auto=format&fit=crop&q=80&w=300',
    notes: 'New MacBook Pro',
    status: 'Active',
    apy: 0,
    accruedInterest: 0,
    username: 'chinazajohn'
  },
  {
    id: 'g-4',
    name: 'Vacation Trip',
    category: 'Travel',
    targetAmount: 200000,
    frequency: DepositFrequency.ANYTIME,
    expectedDeposit: 20000,
    amountSaved: 50000,
    startDate: '2025-09-10',
    endDate: '2026-07-10',
    withdrawalDate: '2026-07-10',
    reminderEnabled: true,
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=300',
    notes: 'End of year Zanzibar trip',
    status: 'Active',
    apy: 0,
    accruedInterest: 0,
    username: 'chinazajohn'
  },
  {
    id: 'g-5',
    name: 'Emergency Fund',
    category: 'Emergency Fund',
    targetAmount: 100000,
    frequency: DepositFrequency.DAILY,
    expectedDeposit: 1000,
    amountSaved: 60000,
    startDate: '2025-11-01',
    endDate: '2026-05-01',
    withdrawalDate: '2026-05-01',
    reminderEnabled: false,
    imageUrl: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&q=80&w=300',
    notes: 'Rainy day savings just in case',
    status: 'Active',
    apy: 0,
    accruedInterest: 0,
    username: 'chinazajohn'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    receiptNumber: 'RCPT2505151024',
    transactionId: 'TXN_8839283748',
    goalName: 'House Rent',
    goalId: 'g-1',
    amount: 50000,
    date: '15 May, 2025',
    time: '10:24 AM',
    paymentMethod: 'Bank Transfer',
    balanceAfter: 390000,
    type: 'Deposit',
    status: 'Successful',
    customerName: 'Chinaza John'
  },
  {
    id: 'tx-2',
    receiptNumber: 'RCPT2505140815',
    transactionId: 'TXN_1248593859',
    goalName: 'School Fees',
    goalId: 'g-2',
    amount: 30000,
    date: '14 May, 2025',
    time: '08:15 PM',
    paymentMethod: 'Debit Card',
    balanceAfter: 120000,
    type: 'Deposit',
    status: 'Successful',
    customerName: 'Chinaza John'
  },
  {
    id: 'tx-3',
    receiptNumber: 'RCPT2505121100',
    transactionId: 'TXN_5549301294',
    goalName: 'House Rent',
    goalId: 'g-1',
    amount: 20000,
    date: '12 May, 2025',
    time: '11:00 AM',
    paymentMethod: 'Bank Transfer',
    balanceAfter: 340000,
    type: 'Withdrawal',
    status: 'Pending',
    customerName: 'Chinaza John'
  },
  {
    id: 'tx-4',
    receiptNumber: 'RCPT2505110930',
    transactionId: 'TXN_4439201958',
    goalName: 'Vacation Trip',
    goalId: 'g-4',
    amount: 40000,
    date: '11 May, 2025',
    time: '09:30 AM',
    paymentMethod: 'Bank Transfer',
    balanceAfter: 50000,
    type: 'Deposit',
    status: 'Successful',
    customerName: 'Chinaza John'
  },
  {
    id: 'tx-5',
    receiptNumber: 'RCPT2505101422',
    transactionId: 'TXN_2210495837',
    goalName: 'Laptop Purchase',
    goalId: 'g-3',
    amount: 25000,
    date: '10 May, 2025',
    time: '02:22 PM',
    paymentMethod: 'Debit Card',
    balanceAfter: 100000,
    type: 'Deposit',
    status: 'Successful',
    customerName: 'Chinaza John'
  },
  {
    id: 'tx-6',
    receiptNumber: 'RCPT2505091705',
    transactionId: 'TXN_9930491823',
    goalName: 'Emergency Fund',
    goalId: 'g-5',
    amount: 50000,
    date: '09 May, 2025',
    time: '05:05 PM',
    paymentMethod: 'Bank Transfer',
    balanceAfter: 60000,
    type: 'Withdrawal',
    status: 'Approved',
    customerName: 'Chinaza John'
  },
  {
    id: 'tx-m1',
    receiptNumber: 'RCPT-MEM-05',
    transactionId: 'TXN_MEM_104938',
    goalName: 'Membership Fee',
    amount: 1000,
    date: '01 May, 2025',
    time: '08:00 AM',
    paymentMethod: 'Auto-Debit',
    balanceAfter: 0,
    type: 'Membership Fee',
    status: 'Successful',
    customerName: 'Chinaza John'
  }
];

export const INITIAL_WITHDRAWALS: WithdrawalRequest[] = [
  {
    id: 'wdr-1',
    goalId: 'g-1',
    goalName: 'House Rent',
    amount: 20000,
    withdrawalType: 'Partial',
    reason: 'Emergency car maintenance repair bills',
    bankAccount: 'GTBank - 0123456789 (Chinaza John)',
    date: '15 May, 2025 - 10:24 AM',
    status: 'Pending',
    fee: 0
  },
  {
    id: 'wdr-2',
    goalId: 'g-5',
    goalName: 'Emergency Fund',
    amount: 50000,
    withdrawalType: 'Full',
    reason: 'Medical hospital fees for relative',
    bankAccount: 'GTBank - 0123456789 (Chinaza John)',
    date: '09 May, 2025 - 04:30 PM',
    status: 'Approved',
    fee: 0
  }
];

export const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'n-1',
    title: 'Deposit Received',
    message: '₦50,000.00 saved for your House Rent goal.',
    date: 'Today',
    time: '10:24 AM',
    isRead: false,
    type: 'success'
  },
  {
    id: 'n-2',
    title: 'Receipt Generated',
    message: 'Receipt #RCPT2505151024 has been created for your records.',
    date: 'Today',
    time: '10:24 AM',
    isRead: false,
    type: 'info'
  },
  {
    id: 'n-3',
    title: 'Goal Progress',
    message: 'House Rent is now 65% complete. Excellent progress!',
    date: 'Yesterday',
    time: '09:30 PM',
    isRead: true,
    type: 'success'
  },
  {
    id: 'n-4',
    title: 'Maturity Reminder',
    message: 'School Fees savings plan will mature soon on 15 Oct, 2025.',
    date: 'Yesterday',
    time: '08:00 PM',
    isRead: true,
    type: 'warning'
  },
  {
    id: 'n-5',
    title: 'Withdrawal Approved',
    message: '₦50,000.00 withdrawal from Emergency Fund approved and sent to GTBank.',
    date: '10 May, 2025',
    time: '11:15 AM',
    isRead: true,
    type: 'success'
  }
];

export const SAVINGS_CATEGORIES = [
  { id: 'cat-rent', name: 'House Rent', icon: '🏠', color: 'from-amber-400 to-orange-500' },
  { id: 'cat-srent', name: 'Shop Rent', icon: '🏪', color: 'from-indigo-400 to-purple-600' },
  { id: 'cat-school', name: 'School Fees', icon: '🎓', color: 'from-blue-400 to-indigo-600' },
  { id: 'cat-land', name: 'Land Purchase', icon: '🏡', color: 'from-emerald-400 to-green-600' },
  { id: 'cat-build', name: 'Building Project', icon: '🏗', color: 'from-yellow-500 to-amber-600' },
  { id: 'cat-vehicle', name: 'Vehicle Purchase', icon: '🚗', color: 'from-red-400 to-rose-600' },
  { id: 'cat-electronics', name: 'Electronics', icon: '💻', color: 'from-cyan-400 to-sky-600' },
  { id: 'cat-capital', name: 'Business Capital', icon: '💰', color: 'from-teal-400 to-emerald-600' },
  { id: 'cat-farm', name: 'Farming', icon: '🌾', color: 'from-lime-400 to-green-600' },
  { id: 'cat-medical', name: 'Medical Bills', icon: '🏥', color: 'from-rose-400 to-red-600' },
  { id: 'cat-wedding', name: 'Wedding', icon: '💒', color: 'from-fuchsia-400 to-pink-600' },
  { id: 'cat-travel', name: 'Travel', icon: '✈', color: 'from-sky-400 to-blue-500' },
  { id: 'cat-emergency', name: 'Emergency Fund', icon: '🆘', color: 'from-red-500 to-orange-600' },
  { id: 'cat-education', name: 'Children\'s Education', icon: '👶', color: 'from-violet-400 to-purple-600' },
  { id: 'cat-custom', name: 'Custom Goal', icon: '⭐', color: 'from-slate-400 to-slate-600' }
];

export const INITIAL_MEMBERSHIP_LOGS: MembershipLog[] = [
  { month: 'May 2026', amount: 1000, status: 'Paid', dueDate: '2026-05-01', paidDate: '2026-05-01' },
  { month: 'June 2026', amount: 1000, status: 'Paid', dueDate: '2026-06-01', paidDate: '2026-05-30' },
  { month: 'July 2026', amount: 1000, status: 'Paid', dueDate: '2026-07-01', paidDate: '2026-07-01' },
  { month: 'August 2026', amount: 1000, status: 'Due', dueDate: '2026-08-01' }
];

export const FAQS = [
  {
    q: 'What is JOLAS SAVE?',
    a: 'JOLAS SAVE is a highly secure, automated savings platform designed to help you save money seamlessly towards your financial goals. Whether you are saving for rent, school fees, business capital, or emergency funds, we offer flexible savings schedules (daily, weekly, monthly, or anytime) with high trust and instant tracking.'
  },
  {
    q: 'How safe are my savings funds?',
    a: 'We implement industry-grade security protocols, including complete data encryption, secure login credentials, OTP (One-Time Password) confirmations, and strict audit logs. All funds are backed by secure banking partners in Nigeria.'
  },
  {
    q: 'Can I withdraw my money before the maturity date?',
    a: 'Yes, you can request early or partial withdrawals. Please note that early withdrawals prior to your set date may incur a slight administrative fee or forfeit earned interest to promote financial discipline.'
  },
  {
    q: 'What is the Monthly Membership Fee?',
    a: 'JOLAS SAVE charges a nominal flat membership fee of ₦1,000 monthly. This supports the continuous secure operation, payment gateway charges, automated reminder dispatching, and high-quality server performance.'
  },
  {
    q: 'How do I perform deposits?',
    a: 'Deposits are requested in-app and settled securely via our official WhatsApp Support channel (+234 803 736 7585). Simply request a deposit, tap "Continue to WhatsApp" to chat with our verification agents, and receive our secure bank details. Once you transfer the money and send the payment receipt, our admin will verify and instantly credit your savings account.'
  }
];

export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'TKT-1082',
    subject: 'Double debit on deposit payment',
    category: 'Deposit Issue',
    message: 'I tried to deposit ₦20,000 yesterday night and was debited twice by my bank, but only one deposit is showing on my laptop purchase goal progress bar.',
    status: 'Pending',
    date: '2026-07-14',
    replies: [
      {
        sender: 'User',
        message: 'I tried to deposit ₦20,000 yesterday night and was debited twice by my bank, but only one deposit is showing.',
        timestamp: '2026-07-14 09:12 PM'
      },
      {
        sender: 'Support',
        message: 'Hello Chinaza, thank you for reaching out. We are verifying this with Paystack. If a double debit occurred, the second payment will be auto-refunded to your card within 24-48 working hours. We will update you shortly.',
        timestamp: '2026-07-15 08:30 AM'
      }
    ]
  }
];
