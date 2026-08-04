export enum UserRole {
  CUSTOMER = 'Customer',
  ADMIN = 'Admin',
  SUPER_ADMIN = 'Super Admin',
  AGENT = 'Agent'
}

export enum DepositRequestStatus {
  PENDING = 'Pending',
  DRAFT = 'Draft',
  WAITING_WHATSAPP = 'Waiting for WhatsApp Contact',
  AWAITING_TRANSFER = 'Awaiting Transfer',
  AWAITING_VERIFICATION = 'Awaiting Verification',
  VERIFIED = 'Verified',
  CREDITED = 'Credited',
  DECLINED = 'Declined',
  REJECTED = 'Rejected',
  CANCELLED = 'Cancelled'
}

export interface DepositRequest {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerUsername: string;
  goalId: string;
  goalName: string;
  amount: number;
  createdAt: string;
  status: DepositRequestStatus;
  proofOfPaymentUrl?: string;
  notes?: string;
  approvedBy?: string;
  approvedAt?: string;
  receiptNumber?: string;
  auditLog: Array<{
    action: string;
    actor: string;
    timestamp: string;
    details?: string;
  }>;
  assignedAgentId?: string;
}


export interface UserProfile {
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  passportPhoto?: string;
  dob: string;
  gender: string;
  address: string;
  state: string;
  lga: string;
  occupation: string;
  nextOfKin: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };
  bankName: string;
  accountNumber: string;
  accountName: string;
  bvn?: string;
  nin?: string;
  referralCode?: string;
  referredBy?: string;
  isKycVerified: boolean;
  kycStatus: 'Unverified' | 'Pending' | 'Verified';
  twoFactorEnabled: boolean;
  status: 'Active' | 'Frozen' | 'Suspended';
  role?: UserRole;
  assignedAgentUsername?: string;
}

export enum DepositFrequency {
  DAILY = 'Daily',
  WEEKLY = 'Weekly',
  MONTHLY = 'Monthly',
  ANYTIME = 'Anytime'
}

export interface SavingsGoal {
  id: string;
  name: string;
  category: string;
  targetAmount: number;
  frequency: DepositFrequency;
  expectedDeposit: number;
  amountSaved: number;
  startDate: string;
  endDate: string;
  withdrawalDate: string;
  reminderEnabled: boolean;
  imageUrl?: string;
  notes?: string;
  status: 'Active' | 'Completed' | 'Matured';
  apy?: number;
  accruedInterest?: number;
  username?: string;
}

export interface Transaction {
  id: string;
  receiptNumber: string;
  transactionId: string;
  goalName: string;
  goalId?: string;
  amount: number;
  date: string;
  time: string;
  paymentMethod: string;
  balanceAfter: number;
  type: 'Deposit' | 'Withdrawal' | 'Membership Fee';
  status: 'Successful' | 'Pending' | 'Approved' | 'Rejected' | 'Paid' | 'Cancelled';
  customerName: string;
}

export interface WithdrawalRequest {
  id: string;
  goalId: string;
  goalName: string;
  amount: number;
  withdrawalType: 'Full' | 'Partial' | 'Early';
  reason: string;
  bankAccount: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  fee: number;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  message: string;
  status: 'Open' | 'Pending' | 'Resolved';
  date: string;
  replies: Array<{
    sender: 'User' | 'Support';
    message: string;
    timestamp: string;
  }>;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  time: string;
  isRead: boolean;
  type: 'info' | 'success' | 'warning' | 'alert';
}

export interface MembershipLog {
  month: string;
  amount: number;
  status: 'Paid' | 'Due' | 'Overdue';
  dueDate: string;
  paidDate?: string;
}

export interface InforgeAuditLog {
  id: string;
  action: string;
  userId: string;
  username: string;
  role: string;
  ipAddress: string;
  device: string;
  browser: string;
  timestamp: string;
}

