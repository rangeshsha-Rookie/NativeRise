// client/src/pages/customer/TicketDetailPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Send, User, Bot, Store, Clock } from 'lucide-react';
import apiClient from '../../api/client';
import Button from '../../components/ui/Button';
import clsx from 'clsx';

export function TicketDetailPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const isMr = i18n.language === 'mr';

  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchTicket = async () => {
    try {
      const res = await apiClient.get(`/support/tickets/${id}`);
      if (res?.ok && res.data) {
        const tData = res.data.ticket || res.data;
        setTicket(tData);
        setMessages(tData.messages || []);
      }
    } catch (err) {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || sending) return;

    setSending(true);
    try {
      const res = await apiClient.post(`/support/tickets/${id}/messages`, {
        message: replyText.trim()
      });
      if (res?.ok) {
        setReplyText('');
        fetchTicket();
      }
    } catch (err) {
      alert(err.message || 'Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[800px] mx-auto px-4 sm:px-8 py-10 space-y-4">
        <div className="h-6 w-32 bg-cream-2 rounded animate-pulse" />
        <div className="h-32 bg-cream-2 rounded-card animate-pulse" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="max-w-[800px] mx-auto px-4 sm:px-8 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold font-serif text-ink">
          {isMr ? 'तिकीट सापडले नाही' : 'Ticket Not Found'}
        </h2>
        <Link to="/support" className="inline-block px-6 py-2 rounded-full bg-primary text-ink font-semibold">
          {isMr ? 'सर्व तिकिटे पहा' : 'Back to Support'}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/support"
          className="inline-flex items-center gap-1 text-xs text-ink-2 hover:text-ink mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isMr ? 'सर्व तिकिटे' : 'Back to Support'}</span>
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-ink">{ticket.subject}</h1>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-clay/10 text-clay">
            {ticket.status}
          </span>
        </div>
        <p className="text-xs text-ink-2 mt-1">
          {ticket.category} · {new Date(ticket.createdAt).toLocaleString(isMr ? 'mr-IN' : 'en-IN')}
        </p>
      </div>

      {/* Messages Feed */}
      <div className="bg-surface border border-line rounded-card p-4 sm:p-6 space-y-4 min-h-[350px] max-h-[500px] overflow-y-auto">
        {/* Original Description */}
        <div className="p-4 bg-cream-2 rounded-2xl border border-line space-y-1">
          <span className="text-xs font-bold text-ink block">{isMr ? 'तुमचा प्रश्न / तक्रार:' : 'Your inquiry:'}</span>
          <p className="text-xs sm:text-sm text-ink leading-relaxed whitespace-pre-line">
            {ticket.description}
          </p>
        </div>

        {/* Message Thread */}
        {messages.map((m, idx) => {
          const isCustomer = m.senderRole === 'customer';
          return (
            <div
              key={idx}
              className={clsx(
                'flex flex-col',
                isCustomer ? 'items-end' : 'items-start'
              )}
            >
              <div
                className={clsx(
                  'max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-sm space-y-1',
                  isCustomer
                    ? 'bg-primary text-ink rounded-tr-none font-medium'
                    : 'bg-cream text-ink border border-line rounded-tl-none'
                )}
              >
                <div className="flex items-center justify-between gap-4 text-[10px] text-ink-2 mb-1">
                  <span className="font-bold">
                    {m.senderName || (isCustomer ? 'You' : 'Seller / Support')}
                  </span>
                  <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="whitespace-pre-line leading-relaxed">{m.message || m.body}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Box */}
      {ticket.status !== 'CLOSED' ? (
        <form onSubmit={handleSendReply} className="flex items-center gap-2">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={isMr ? 'येथे उत्तर लिहा...' : 'Type your reply message...'}
            className="flex-1 h-12 px-4 bg-surface border border-line rounded-full text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
          <button
            type="submit"
            disabled={!replyText.trim() || sending}
            className="w-12 h-12 rounded-full bg-primary text-ink flex items-center justify-center hover:bg-primary-600 disabled:opacity-50 transition-colors shrink-0 shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      ) : (
        <p className="text-xs text-ink-2 text-center italic">
          {isMr ? 'हे तिकीट बंद करण्यात आले आहे.' : 'This support ticket has been closed.'}
        </p>
      )}
    </div>
  );
}

export default TicketDetailPage;
