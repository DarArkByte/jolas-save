import React, { useState } from 'react';
import { Settings, Shield, Power, ToggleLeft, ToggleRight, Landmark, CreditCard, Key, Database, Mail, Terminal, Clock, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { JolasLogoIcon } from './JolasLogo';
import { InforgeAuditLog } from '../types';

interface SuperAdminDashboardProps {
  onToggleMaintenanceMode: () => void;
  maintenanceModeActive: boolean;
  agentCanCredit: boolean;
  onToggleAgentCanCredit: () => void;
  auditLogs: InforgeAuditLog[];
}

export const SuperAdminDashboardView: React.FC<SuperAdminDashboardProps> = ({
  onToggleMaintenanceMode,
  maintenanceModeActive,
  agentCanCredit,
  onToggleAgentCanCredit,
  auditLogs = []
}) => {
  const [gateway, setGateway] = useState<'Paystack' | 'Flutterwave' | 'Moniepoint'>('Paystack');
  const [brandingTitle, setBrandingTitle] = useState('JOLAS SAVE');
  const [tagline, setTagline] = useState('Save Today... Secure Tomorrow');
  const [twoFaSuper, setTwoFaSuper] = useState(true);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Global Super-Admin configurations updated successfully on the PostgreSQL cloud servers!');
  };

  const simulatedBackups = [
    { date: '15 July, 2026', size: '14.2 MB', status: 'Completed', source: 'PostgreSQL Cloud Spanner' },
    { date: '14 July, 2026', size: '14.1 MB', status: 'Completed', source: 'PostgreSQL Cloud Spanner' },
    { date: '13 July, 2026', size: '13.9 MB', status: 'Completed', source: 'PostgreSQL Cloud Spanner' }
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-jolas-green-primary/5 rounded-2xl">
            <JolasLogoIcon size={44} />
          </div>
          <div>
            <div className="flex items-center gap-1 text-red-600 font-mono text-[10px] tracking-wider uppercase font-bold">
              <Shield size={12} />
              <span>Core Kernel Credentials</span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-800 uppercase tracking-tight leading-none mt-0.5">Super Admin Dashboard</h2>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 text-right">
          <div className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full border border-red-200">
            Super Root Key
          </div>
          <span className="text-[8px] font-bold uppercase text-slate-500 tracking-wider">JOLAS SAVE • Core Security</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Settings Form */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs md:col-span-2 space-y-6">
          <h3 className="font-sans font-bold text-sm text-slate-800 uppercase tracking-wider">Site Branding Configuration</h3>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">App Logo Title</label>
              <input
                type="text"
                value={brandingTitle}
                onChange={(e) => setBrandingTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-red-500 focus:outline-hidden font-bold"
                id="branding-title-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Slogan Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-red-500 focus:outline-hidden"
                id="branding-tagline-input"
              />
            </div>

            {/* Payment gateway checklist */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-600 mb-2">Default Payment Settlement Gateway</label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'Paystack', label: 'Paystack Sandbox', active: gateway === 'Paystack' },
                  { id: 'Flutterwave', label: 'Flutterwave API', active: gateway === 'Flutterwave' },
                  { id: 'Moniepoint', label: 'Moniepoint Node', active: gateway === 'Moniepoint' }
                ].map(gw => (
                  <button
                    key={gw.id}
                    type="button"
                    onClick={() => setGateway(gw.id as any)}
                    className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${
                      gw.active 
                        ? 'border-red-500 bg-red-50/20 text-red-700' 
                        : 'border-slate-150 hover:bg-slate-50 text-slate-500'
                    }`}
                    id={`gw-select-${gw.id}`}
                  >
                    {gw.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl text-xs uppercase cursor-pointer"
              id="super-branding-save"
            >
              Commit Core Configurations
            </button>
          </form>
        </div>

        {/* Global Controls Panel */}
        <div className="space-y-6">
          
          {/* Maintenance Switch */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-sans font-bold text-sm text-slate-800 uppercase tracking-wider">Maintenance Mode</h3>
              <Power size={18} className={maintenanceModeActive ? 'text-red-500' : 'text-slate-400'} />
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Activating maintenance mode takes the frontend offline for normal customers, locking actions to avoid write operations during core migrations.
            </p>

            <button
              onClick={onToggleMaintenanceMode}
              className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                maintenanceModeActive 
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/10' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border'
              }`}
              id="toggle-maintenance-btn"
            >
              <span>{maintenanceModeActive ? 'DISENGAGE MAINTENANCE' : 'ENGAGE MAINTENANCE MODE'}</span>
            </button>
          </div>

          {/* Agent Direct Credit Toggle Switch */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-sans font-bold text-sm text-slate-800 uppercase tracking-wider">Agent Direct Credit</h3>
              <Shield size={18} className={agentCanCredit ? 'text-jolas-green-primary' : 'text-slate-400'} />
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              When enabled, authorized field agents can directly credit customer savings goals. When disabled, agents can only verify deposits and recommend them to back-office admins.
            </p>

            <button
              type="button"
              onClick={onToggleAgentCanCredit}
              className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                agentCanCredit 
                  ? 'bg-jolas-green-primary text-white shadow-md shadow-emerald-600/10' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border'
              }`}
              id="toggle-agent-credit-btn"
            >
              <span>{agentCanCredit ? 'DISABLE DIRECT AGENT CREDIT' : 'ENABLE DIRECT AGENT CREDIT'}</span>
            </button>
          </div>

          {/* Database Backups logs */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-3.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Database size={16} className="text-blue-500" />
              <span>Automated Daily Backups</span>
            </div>

            <div className="divide-y divide-slate-100">
              {simulatedBackups.map((bak, idx) => (
                <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                  <div>
                    <span className="block font-bold text-slate-800">{bak.date}</span>
                    <span className="block text-[9px] text-slate-400 font-mono mt-0.5">{bak.source}</span>
                  </div>
                  <div className="text-right text-[10px]">
                    <span className="font-mono block text-slate-500">{bak.size}</span>
                    <span className="text-jolas-green-primary font-bold uppercase">Safe</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Live Inforge BaaS - Real-Time Enterprise Audit Logs */}
      <div className="bg-slate-950 text-slate-100 rounded-3xl p-6 shadow-xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal size={18} className="text-emerald-400 animate-pulse" />
            <h3 className="font-mono text-sm font-bold tracking-wider text-emerald-400 uppercase">
              Inforge BaaS Real-Time Enterprise Ledger
            </h3>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>LIVE SYNC ACTIVE</span>
          </div>
        </div>

        <div className="font-mono text-xs max-h-80 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-800">
          {auditLogs.length > 0 ? (
            [...auditLogs].reverse().map((log) => (
              <div key={log.id} className="p-3 bg-slate-900/60 rounded-xl border border-slate-900 flex items-start gap-3 hover:border-slate-800 transition-colors">
                <div className="text-[10px] text-slate-500 min-w-[130px] select-none pt-0.5">
                  [{log.timestamp}]
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-1.5 py-0.5 bg-slate-850 text-slate-300 rounded text-[9px] font-bold border border-slate-800">
                      {log.action}
                    </span>
                    <span className="text-slate-400 font-bold">by</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <UserCheck size={10} />
                      @{log.actor}
                    </span>
                  </div>
                  {log.details && (
                    <p className="text-slate-400 text-[11px] mt-1 italic leading-relaxed">
                      ↳ {log.details}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-slate-500">
              [No Inforge core audit packets intercepted yet]
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
