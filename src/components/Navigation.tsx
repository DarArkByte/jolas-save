import React from 'react';
import { 
  Home, 
  Target, 
  Plus, 
  History, 
  User, 
  Bell, 
  ChevronRight, 
  LogOut, 
  Users, 
  FileText, 
  Settings, 
  ShieldCheck, 
  Menu,
  BookOpen
} from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile, UserRole } from '../types';
import { JolasLogo } from './JolasLogo';

interface NavigationProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  userProfile: UserProfile;
  userRole: UserRole;
  onLogout: () => void;
  unreadNotifications: number;
}

export const TopBar: React.FC<NavigationProps> = ({ 
  currentView, 
  setCurrentView, 
  userProfile, 
  userRole, 
  unreadNotifications 
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
      {/* Brand logo on mobile, welcome message on desktop */}
      <div className="flex items-center gap-3">
        <div className="md:hidden">
          <JolasLogo variant="horizontal" size={26} showTagline={false} />
        </div>
        <div className="hidden md:block">
          <span className="text-[10px] uppercase font-bold text-jolas-green-primary tracking-wider font-mono">
            {userRole} Mode
          </span>
          <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-1">
            <span>Good day, {userProfile.fullName.split(' ')[0]}</span>
            <span className="animate-wiggle">👋</span>
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3.5">
        {/* User avatar moved to right side */}
        <button 
          onClick={() => setCurrentView('profile')}
          className="focus:outline-none"
        >
          {userProfile.passportPhoto && userRole === UserRole.CUSTOMER ? (
            <img 
              src={userProfile.passportPhoto} 
              alt="User avatar" 
              className="w-8 h-8 rounded-full object-cover border-2 border-emerald-500 shadow-xs cursor-pointer"
            />
          ) : (
            <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-xs">
              {userProfile.fullName.charAt(0)}
            </div>
          )}
        </button>

        <button 
          onClick={() => setCurrentView('notifications')}
          className="relative p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
          id="notif-bell-btn"
        >
          <Bell size={18} />
          {unreadNotifications > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white">
              {unreadNotifications}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  subItems?: { id: string; label: string }[];
}

export const DesktopSidebar: React.FC<NavigationProps> = ({
  currentView,
  setCurrentView,
  userProfile,
  userRole,
  onLogout
}) => {
  const [expandedItems, setExpandedItems] = React.useState<Record<string, boolean>>({});

  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const customerMenuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { 
      id: 'goals', 
      label: 'My Goals', 
      icon: Target,
      subItems: [
        { id: 'goals', label: 'View Savings Plans' }
      ]
    },
    { 
      id: 'deposit', 
      label: 'Make Deposit', 
      icon: Plus,
      subItems: [
        { id: 'deposit', label: 'Transfer Instructions' }
      ]
    },
    { id: 'activity', label: 'Transactions', icon: History },
    { id: 'membership', label: 'Membership Plan', icon: ShieldCheck },
    { 
      id: 'reports', 
      label: 'Financial Reports', 
      icon: FileText,
      subItems: [
        { id: 'reports', label: 'Wealth Analytics' }
      ]
    },
    { id: 'profile', label: 'Profile &amp; KYC', icon: User },
    { id: 'support', label: 'Help &amp; Support', icon: BookOpen }
  ];

  const adminMenuItems: MenuItem[] = [
    { 
      id: 'admin_dashboard', 
      label: 'Admin Panel', 
      icon: Home,
      subItems: [
        { id: 'admin_dashboard', label: 'Awaiting Payouts' },
        { id: 'admin_broadcast', label: 'Broadcast Bulletins' }
      ]
    },
    { 
      id: 'admin_users', 
      label: 'User Compliance', 
      icon: Users,
      subItems: [
        { id: 'admin_users', label: 'Account KYC Audits' }
      ]
    },
    { 
      id: 'admin_transactions', 
      label: 'All Operations', 
      icon: History,
      subItems: [
        { id: 'admin_transactions', label: 'Manual Deposits' }
      ]
    },
    { 
      id: 'admin_reports', 
      label: 'Platform Reports', 
      icon: FileText,
      subItems: [
        { id: 'admin_reports', label: 'Savings Categories' }
      ]
    }
  ];

  const agentMenuItems: MenuItem[] = [
    { id: 'agent_dashboard', label: 'Agent Portfolio', icon: Home }
  ];

  const superAdminMenuItems: MenuItem[] = [
    { id: 'super_dashboard', label: 'Super Dashboard', icon: Home },
    { id: 'super_settings', label: 'System Settings', icon: Settings }
  ];

  const menuItems: MenuItem[] = userRole === UserRole.SUPER_ADMIN 
    ? [...superAdminMenuItems, ...adminMenuItems] 
    : userRole === UserRole.ADMIN 
      ? adminMenuItems 
      : userRole === UserRole.AGENT
        ? agentMenuItems
        : customerMenuItems;

  React.useEffect(() => {
    // Auto-expand parent if a sub-item is active
    menuItems.forEach(item => {
      if (item.subItems?.some(sub => sub.id === currentView)) {
        setExpandedItems(prev => ({
          ...prev,
          [item.id]: true
        }));
      }
    });
  }, [currentView, menuItems]);

  return (
    <aside className="hidden md:flex flex-col w-64 bg-jolas-green-primary text-white min-h-screen border-r border-white/10 shrink-0 sticky top-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-white/10">
        <JolasLogo variant="horizontal" size={36} showTagline={true} lightBackground={false} />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map(item => {
          const Icon = item.icon;
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isExpanded = !!expandedItems[item.id];
          const isActive = currentView === item.id || 
            (item.id === 'admin_dashboard' && currentView === 'admin_broadcast') ||
            (item.subItems?.some(sub => sub.id === currentView));

          return (
            <div key={item.id} className="space-y-1">
              <button
                onClick={() => {
                  if (hasSubItems) {
                    toggleExpand(item.id);
                  }
                  setCurrentView(item.id);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-white/10 text-white border-l-4 border-jolas-gold' 
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? 'text-jolas-gold' : 'text-white/60'} />
                  <span dangerouslySetInnerHTML={{ __html: item.label }}></span>
                </div>
                {hasSubItems ? (
                  <ChevronRight 
                    size={14} 
                    className={`opacity-60 transition-transform duration-200 ${isExpanded ? 'rotate-90 text-jolas-gold' : 'text-white/40'}`} 
                  />
                ) : (
                  <ChevronRight size={14} className="opacity-60 text-white/40" />
                )}
              </button>
              
              {hasSubItems && isExpanded && (
                <div className="pl-9 space-y-1 text-xs">
                  {item.subItems.map(sub => {
                    const isSubActive = currentView === sub.id;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => setCurrentView(sub.id)}
                        className={`w-full text-left py-2 px-3 rounded-lg font-medium transition-all cursor-pointer ${
                          isSubActive 
                            ? 'text-jolas-gold font-bold bg-white/5' 
                            : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {sub.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Official WhatsApp Support contact sidebar widget */}
      <div className="mx-4 my-2 p-3 bg-white/5 border border-white/10 rounded-xl">
        <span className="block text-[9px] uppercase font-bold text-white/50 tracking-wider">Secure Support</span>
        <a 
          href="https://wa.me/2348037367585"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-xs text-jolas-gold font-extrabold hover:underline mt-1"
        >
          <span>WhatsApp Support</span>
        </a>
        <span className="block text-[9px] text-white/75 font-mono font-medium mt-0.5">+234 803 736 7585</span>
      </div>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-white/10 bg-white/5">
        <div className="flex items-center gap-3 mb-4">
          {userProfile.passportPhoto && userRole === UserRole.CUSTOMER ? (
            <img 
              src={userProfile.passportPhoto} 
              alt="Avatar" 
              className="w-9 h-9 rounded-full object-cover border border-jolas-gold"
            />
          ) : (
            <div className="w-9 h-9 bg-white/10 text-white rounded-lg flex items-center justify-center font-bold text-sm">
              {userProfile.fullName.charAt(0)}
            </div>
          )}
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-white truncate">{userProfile.fullName}</h4>
            <p className="text-[10px] text-white/60 truncate">{userProfile.email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-white/20 text-xs text-red-300 hover:bg-white/5 hover:border-red-400 transition-all font-semibold"
          id="logout-btn"
        >
          <LogOut size={14} />
          <span>Secure Logout</span>
        </button>
      </div>
    </aside>
  );
};

export const BottomNav: React.FC<NavigationProps> = ({
  currentView,
  setCurrentView,
  userRole
}) => {
  let tabs = [
    { id: 'dashboard', label: 'Home', icon: Home, isFab: false },
    { id: 'goals', label: 'Goals', icon: Target, isFab: false },
    { id: 'deposit', label: 'Deposit', icon: Plus, isFab: true },
    { id: 'activity', label: 'Activity', icon: History, isFab: false },
    { id: 'profile', label: 'Profile', icon: User, isFab: false }
  ];

  if (userRole === UserRole.ADMIN) {
    tabs = [
      { id: 'admin_dashboard', label: 'Panel', icon: Home, isFab: false },
      { id: 'admin_users', label: 'KYC', icon: Users, isFab: false },
      { id: 'admin_transactions', label: 'Ops', icon: History, isFab: false },
      { id: 'admin_reports', label: 'Reports', icon: FileText, isFab: false }
    ];
  } else if (userRole === UserRole.SUPER_ADMIN) {
    tabs = [
      { id: 'super_dashboard', label: 'Super', icon: Home, isFab: false },
      { id: 'super_settings', label: 'Settings', icon: Settings, isFab: false }
    ];
  } else if (userRole === UserRole.AGENT) {
    tabs = [
      { id: 'agent_dashboard', label: 'Portfolio', icon: Home, isFab: false }
    ];
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-150 px-2 py-2 shadow-lg flex justify-around items-center">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = currentView === tab.id || (tab.id === 'admin_dashboard' && currentView === 'admin_broadcast');
        
        if (tab.isFab) {
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id)}
              className="relative -top-4 w-12 h-12 bg-jolas-green-primary hover:bg-jolas-green-dark text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-900/30 ring-4 ring-jolas-gold active:scale-95 transition-transform"
              id="fab-deposit-btn"
            >
              <Icon size={24} className="stroke-[3]" />
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => setCurrentView(tab.id)}
            className="flex flex-col items-center gap-1 py-1 px-3 text-slate-400 hover:text-slate-800 transition-colors"
          >
            <Icon 
              size={20} 
              className={`${isActive ? 'text-jolas-green-primary scale-110 font-bold' : 'text-slate-400'} transition-all`} 
            />
            <span className={`text-[9px] font-semibold tracking-wide ${isActive ? 'text-jolas-green-primary font-bold' : 'text-slate-400'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
