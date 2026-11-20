// client/src/pages/seller/SellerTicketDetailPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Send, Sparkles, CheckCircle2, Bot, Clock } from 'lucide-react';
import apiClient from '../../api/client';
import Button from '../../components/ui/Button';
import clsx from 'clsx';

export function SellerTicketDetailPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const isMr = i18n.language === 'mr';

  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [suggestedAction, setSuggestedAction] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [draftingAi, setDraftingAi] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchTicket = async () => {
    try {
      const res = await apiClient.get(`/seller/support/tickets/${id}`);
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

  // Feature F10: AI Draft Reply
  const handleDraftAiReply = async () => {
    setDraftingAi(true);
    try {
      const lastCustMsg = messages
        .filter((m) => m.senderRole === 'customer')
        .slice(-1)[0]?.message || ticket?.description || '';

      const res = await apiClient.post('/ai/draft-ticket-reply', {
        ticketId: id,
        message: lastCustMsg
      });

      if (res?.ok && res.data) {
        const draft = res.data.draftReply || res.data.reply || '';
        const action = res.data.suggestedAction || '';
        setReplyText(draft);
        setSuggestedAction(action);
      }
    } catch (err) {
      alert(err.message || 'Failed to generate AI reply');
    } finally {
      setDraftingAi(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || sending) return;

    setSending(true);
    try {
      await apiClient.post(`/seller/support/tickets/${id}/messages`, {
        text: replyText.trim()
      });
      setReplyText('');
      setSuggestedAction('');
      fetchTicket();
    } catch (err) {
      alert(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleMarkResolved = async () => {
    try {
      await apiClient.patch(`/seller/support/tickets/${id}/status`, {
        status: 'RESOLVED'
      });
      fetchTicket();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="max-w-[800px] mx-auto px-4 py-10 space-y-4">
        <div className="h-6 w-32 bg-cream-2 rounded animate-pulse" />
        <div className="h-32 bg-cream-2 rounded-card animate-pulse" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="max-w-[800px] mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold font-serif text-ink">
          {isMr ? 'तिकीट सापडले नाही' : 'Ticket Not Found'}
        </h2>
        <Link to="/seller/support" className="inline-block px-6 py-2 rounded-full bg-primary text-ink font-semibold">
          {isMr ? 'सर्व तिकिटे' : 'Back to Support'}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-6">
      <div>
        <Link
          to="/seller/support"
          className="inline-flex items-center gap-1 text-xs text-ink-2 hover:text-ink mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isMr ? 'सपोर्ट इनबॉक्सकडे परत' : 'Back to Support'}</span>
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-ink">{ticket.subject}</h1>
            <p className="text-xs text-ink-2 mt-1">
              {ticket.category} · {new Date(ticket.createdAt).toLocaleString(isMr ? 'mr-IN' : 'en-IN')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-clay/10 text-clay">
              {ticket.status}
            </span>

            {ticket.status !== 'RESOLVED' && (
              <button
                type="button"
                onClick={handleMarkResolved}
                className="px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-semibold hover:bg-emerald-200"
              >
                {isMr ? 'निकाली काढा (Resolved)' : 'Mark Resolved'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="bg-surface border border-line rounded-card p-4 sm:p-6 space-y-4 min-h-[350px] max-h-[500px] overflow-y-auto">
        {/* Original Issue */}
        <div className="p-4 bg-cream-2 rounded-2xl border border-line space-y-1">
          <span className="text-xs font-bold text-ink block">
            {isMr ? 'ग्राहकाचा प्रश्न:' : 'Customer Issue:'}
          </span>
          <p className="text-xs sm:text-sm text-ink leading-relaxed whitespace-pre-line">
            {ticket.description}
          </p>
        </div>

        {/* Message Thread */}
        {messages.map((m, idx) => {
          const isSeller = m.senderRole === 'seller';
          return (
            <div
              key={idx}
              className={clsx('flex flex-col', isSeller ? 'items-end' : 'items-start')}
            >
              <div
                className={clsx(
                  'max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-sm space-y-1',
                  isSeller
                    ? 'bg-clay text-cream rounded-tr-none font-medium'
                    : 'bg-cream text-ink border border-line rounded-tl-none'
                )}
              >
                <div className="flex items-center justify-between gap-4 text-[10px] opacity-75 mb-1">
                  <span className="font-bold">{m.senderName || (isSeller ? 'You' : 'Customer')}</span>
                  <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="whitespace-pre-line leading-relaxed">{m.message || m.body || m.text}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Feature F10: AI Draft Reply Action */}
      <div className="p-4 bg-purple-50 border border-purple-200 rounded-card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-purple-900 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-purple-700" />
            <span>{isMr ? 'AI उत्तर मसुदा (Feature F10)' : 'AI-Drafted Response (Feature F10)'}</span>
          </div>
          <button
            type="button"
            disabled={draftingAi}
            onClick={handleDraftAiReply}
            className="text-xs font-semibold text-purple-800 underline hover:text-purple-900"
          >
            {draftingAi ? (isMr ? 'तयार करत आहे...' : 'Drafting...') : isMr ? 'मसुदा तयार करा' : 'Draft Reply with AI'}
          </button>
        </div>

        {suggestedAction && (
          <p className="text-xs text-purple-900 bg-purple-100/60 p-2.5 rounded-lg">
            <strong>{isMr ? 'सुचवलेली कृती:' : 'Suggested Action:'}</strong> {suggestedAction}
          </p>
        )}
      </div>

      {/* Reply Input Form */}
      <form onSubmit={handleSendReply} className="flex items-center gap-2">
        <input
          type="text"
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder={isMr ? 'येथे उत्तर लिहा...' : 'Type reply to customer...'}
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
    </div>
  );
}

export default SellerTicketDetailPage;
