import React, { useState } from 'react';
import { HelpCircle, MessageSquare, PhoneCall, Mail, ChevronDown, Plus, MessageCircle, Send, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SupportTicket } from '../types';
import { FAQS } from '../data/mockData';

interface HelpSupportViewProps {
  tickets: SupportTicket[];
  onSubmitTicket: (ticket: Partial<SupportTicket>) => void;
  onSendReply: (ticketId: string, msg: string) => void;
}

export const HelpSupportView: React.FC<HelpSupportViewProps> = ({
  tickets,
  onSubmitTicket,
  onSendReply
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [view, setView] = useState<'index' | 'new_ticket' | 'chat'>('index');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // New Ticket Form
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Deposit Issue');
  const [message, setMessage] = useState('');

  // Chat/reply box
  const [chatMsg, setChatMsg] = useState('');

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    const newTicket: Partial<SupportTicket> = {
      id: 'TKT-' + Math.floor(Math.random() * 9000 + 1000),
      subject,
      category,
      message,
      status: 'Open',
      date: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD
      replies: [
        {
          sender: 'User',
          message: message,
          timestamp: new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };

    onSubmitTicket(newTicket);
    setSubject('');
    setMessage('');
    setView('index');
    alert('Support ticket created successfully!');
  };

  const handleChatSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMsg.trim() || !selectedTicket) return;

    onSendReply(selectedTicket.id, chatMsg);
    setChatMsg('');

    // Trigger auto simulated support reply shortly
    setTimeout(() => {
      onSendReply(selectedTicket.id, 'Our backend support auditors are inspecting this transaction with our settlement payment gateway. We will push an in-app notice shortly.');
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      
      <AnimatePresence mode="wait">
        
        {/* LANDING INDEX */}
        {view === 'index' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight uppercase">Help &amp; Customer Support</h2>
                <p className="text-slate-500 text-xs mt-0.5 font-medium">Have questions or transactions dispute? Let us help you.</p>
              </div>
              <button
                onClick={() => setView('new_ticket')}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                id="create-ticket-btn"
              >
                <Plus size={16} />
                <span>Create Ticket</span>
              </button>
            </div>

            {/* Quick Contacts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'WhatsApp Support', info: '+234 803 736 7585', icon: MessageCircle, color: 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:border-emerald-200', link: 'https://wa.me/2348037367585' },
                { label: 'Dial Telephone', info: '+234 803 736 7585', icon: PhoneCall, color: 'bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-200', link: 'https://wa.me/2348037367585' },
                { label: 'Secure Email Address', info: 'support@jolas.com.ng', icon: Mail, color: 'bg-amber-50 text-amber-600 border-amber-100 hover:border-amber-200', link: 'mailto:support@jolas.com.ng' }
              ].map((contact, idx) => {
                const Icon = contact.icon;
                return (
                  <a 
                    key={idx} 
                    href={contact.link}
                    target="_blank"
                    rel="noreferrer"
                    className={`p-4 rounded-2xl border ${contact.color} space-y-1.5 hover:shadow-xs transition-all cursor-pointer block`}
                  >
                    <Icon size={20} className="stroke-[2.5]" />
                    <span className="block text-xs font-bold text-slate-700">{contact.label}</span>
                    <span className="block font-mono font-bold text-slate-800 text-[11px]">{contact.info}</span>
                  </a>
                );
              })}
            </div>

            {/* Support Tickets Section */}
            {tickets.length > 0 && (
              <div className="space-y-3">
                <span className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider">Your Support Tickets</span>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-xs divide-y divide-slate-100 overflow-hidden">
                  {tickets.map(ticket => (
                    <div 
                      key={ticket.id}
                      onClick={() => { setSelectedTicket(ticket); setView('chat'); }}
                      className="p-4 flex items-center justify-between hover:bg-slate-50/50 cursor-pointer transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-sm font-bold">{ticket.id}</span>
                          <h4 className="text-xs font-bold text-slate-800">{ticket.subject}</h4>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">{ticket.date} • Category: {ticket.category}</p>
                      </div>

                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        ticket.status === 'Resolved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ Accordion */}
            <div className="space-y-3">
              <span className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider">Frequently Asked Questions</span>
              <div className="space-y-2">
                {FAQS.map((faq, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div key={index} className="bg-white border border-slate-150/60 rounded-2xl overflow-hidden shadow-xs">
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        className="w-full text-left p-4 flex items-center justify-between font-semibold text-xs text-slate-800 focus:outline-hidden"
                        id={`faq-btn-${index}`}
                      >
                        <span>{faq.q}</span>
                        <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden border-t border-slate-50"
                          >
                            <p className="p-4 text-xs text-slate-500 leading-relaxed bg-slate-50/40">{faq.a}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* NEW TICKET PANEL */}
        {view === 'new_ticket' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h3 className="font-bold text-base text-slate-800">Submit Support Dispute</h3>
            <form onSubmit={handleCreateTicket} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Dispute Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-emerald-500 focus:outline-hidden"
                  placeholder="e.g. Double debit on school fees deposit"
                  id="ticket-subject"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Dispute Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-emerald-500 focus:outline-hidden bg-white"
                  id="ticket-cat"
                >
                  <option value="Deposit Issue">Deposit Payment Issues</option>
                  <option value="Withdrawal Issue">Withdrawal Approvals Payouts</option>
                  <option value="KYC Issue">KYC Compliance Submissions</option>
                  <option value="Custom goal">General Savings Accounts</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Detailed Message</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-emerald-500 focus:outline-hidden"
                  placeholder="Include dates, bank transactions ID, and precise amounts for audits..."
                  id="ticket-msg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setView('index')}
                  className="w-full py-3 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 rounded-xl shadow-md cursor-pointer"
                >
                  Submit Support Ticket
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* CHAT/MESSAGE BOX PANEL */}
        {view === 'chat' && selectedTicket && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => { setSelectedTicket(null); setView('index'); }} 
                className="p-1 hover:bg-slate-100 rounded-full text-slate-500"
                id="chat-back-btn"
              >
                <ChevronDown className="rotate-90" size={18} />
              </button>
              <div>
                <h4 className="text-sm font-bold text-slate-800">{selectedTicket.subject}</h4>
                <p className="text-[10px] text-slate-400">Ref ID: {selectedTicket.id} • Category: {selectedTicket.category}</p>
              </div>
            </div>

            {/* Chat Body container */}
            <div className="bg-slate-100 rounded-3xl border border-slate-200 p-4 h-[400px] flex flex-col justify-between overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {selectedTicket.replies.map((reply, idx) => {
                  const isUser = reply.sender === 'User';
                  return (
                    <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-3 max-w-[80%] rounded-2xl text-xs space-y-1 ${
                        isUser 
                          ? 'bg-emerald-600 text-white rounded-tr-xs' 
                          : 'bg-white text-slate-800 border rounded-tl-xs'
                      }`}>
                        <span className="block font-bold text-[9px] uppercase tracking-wider opacity-75">{reply.sender}</span>
                        <p>{reply.message}</p>
                        <span className="block text-right text-[8px] opacity-60 font-mono">{reply.timestamp}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleChatSend} className="flex gap-2 bg-white p-1.5 rounded-2xl border mt-3">
                <input
                  type="text"
                  required
                  value={chatMsg}
                  onChange={(e) => setChatMsg(e.target.value)}
                  placeholder="Type a compliance dispute response..."
                  className="flex-1 text-xs px-3 focus:outline-hidden"
                  id="chat-msg-input"
                />
                <button
                  type="submit"
                  className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer"
                  id="chat-send-btn"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
};
