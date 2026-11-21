// client/src/components/assistant/CustomerAssistantModal.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, X, Send, Bot, User as UserIcon, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import ProductCard from '../ui/ProductCard';
import clsx from 'clsx';

export function CustomerAssistantModal() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        i18n.language === 'mr'
          ? 'नमस्कार! मी NativeRise AI सहाय्यक आहे. मी तुम्हाला उत्पादने शोधण्यात, ऑर्डर ट्रॅक करण्यात किंवा माहिती मिळवण्यात कशी मदत करू शकतो?'
          : 'Namaste! I am the NativeRise AI Assistant. How can I help you find authentic village products, track orders, or answer questions today?'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickPrompts =
    i18n.language === 'mr'
      ? [
          '₹३०० च्या आत काय मिळेल?',
          'माझ्या जवळचे लोणचे दाखवा',
          'रद्द करण्याचे धोरण काय आहे?'
        ]
      : [
          'What products under ₹300?',
          'Show me pickles near me',
          'What is the cancellation policy?'
        ];

  const handleSend = async (textToSend) => {
    const queryText = (textToSend || input).trim();
    if (!queryText || loading) return;

    const lower = queryText.toLowerCase();
    const isOrderQuery = lower.includes('my order') || lower.includes('order status') || lower.includes('ऑर्डर स्थिती') || lower.includes('माझी ऑर्डर');

    if (isOrderQuery && !isAuthenticated) {
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: queryText },
        {
          role: 'assistant',
          content:
            i18n.language === 'mr'
              ? 'कृपया तुमच्या ऑर्डरची स्थिती तपासण्यासाठी आधी लॉगिन करा.'
              : 'Please log in to check your order status.',
          requiresLogin: true
        }
      ]);
      setInput('');
      return;
    }

    const newMessages = [...messages, { role: 'user', content: queryText }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // Build history for backend
      const history = newMessages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role, content: m.content }));

      let res;
      try {
        res = await apiClient.post('/assistant/chat', {
          messages: history,
          message: queryText,
          history: history.slice(-6)
        });
      } catch {
        res = await apiClient.post('/ai/assistant', {
          messages: history,
          message: queryText,
          history: history.slice(-6)
        });
      }

      const replyText = res?.data?.reply || res?.reply || res?.data?.message || '';
      const cardsList = res?.data?.cards || res?.cards || [];
      const actionsList = res?.data?.actions || res?.actions || [];

      if (replyText) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: replyText,
            cards: cardsList,
            actions: actionsList
          }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              i18n.language === 'mr'
                ? 'माफ करा, उत्तर मिळवण्यात अडचण आली. कृपया पुन्हा प्रयत्न करा.'
                : 'Sorry, I had trouble answering that. Please try again.'
          }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            err?.message ||
            (i18n.language === 'mr'
              ? 'माफ करा, तांत्रिक अडचण आली आहे.'
              : 'Sorry, an error occurred while reaching the AI assistant.')
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Only render for customer or guest
  if (user && user.role !== 'customer') {
    return null;
  }

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 md:bottom-6 right-6 z-40 bg-ink text-cream px-4 py-3 rounded-full shadow-xl hover:bg-bark transition-all duration-200 flex items-center gap-2.5 font-medium border border-line"
          aria-label="Open AI Assistant"
        >
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold">
            {t('assistant.title', 'Ask NativeRise AI')}
          </span>
        </button>
      )}

      {/* Assistant Modal / Drawer */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[420px] sm:h-[600px] z-50 bg-surface sm:rounded-card border border-line shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-4 py-3 bg-bark text-cream flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight">NativeRise AI</h3>
                <span className="text-[11px] text-cream/70 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-success inline-block"></span>
                  {t('assistant.grounded', 'Rural marketplace assistant')}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-cream/70 hover:text-cream hover:bg-white/10"
              aria-label="Close Assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-cream">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={clsx(
                  'flex flex-col',
                  msg.role === 'user' ? 'items-end' : 'items-start'
                )}
              >
                <div
                  className={clsx(
                    'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm',
                    msg.role === 'user'
                      ? 'bg-primary text-ink rounded-tr-none font-medium'
                      : 'bg-surface text-ink border border-line rounded-tl-none'
                  )}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>

                  {msg.requiresLogin && (
                    <div className="mt-2.5 pt-2 border-t border-line">
                      <a
                        href="/login"
                        className="inline-block px-3 py-1 bg-ink text-cream text-xs font-semibold rounded-full"
                      >
                        {t('nav.login', 'Log In')}
                      </a>
                    </div>
                  )}
                </div>

                {/* Render Cards if AI returned product cards */}
                {msg.cards && msg.cards.length > 0 && (
                  <div className="mt-2.5 w-full space-y-2">
                    {msg.cards.map((card, cIdx) => {
                      if (card.type === 'product' && card.data) {
                        return (
                          <div key={cIdx} className="w-full">
                            <ProductCard product={card.data} />
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-ink-2 text-xs p-2 bg-surface/80 rounded-xl w-fit border border-line">
                <Bot className="w-4 h-4 animate-spin text-clay" />
                <span>{t('assistant.thinking', 'Thinking & searching catalog...')}</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length <= 2 && (
            <div className="px-3 py-2 bg-surface border-t border-line flex items-center gap-2 overflow-x-auto text-xs">
              {quickPrompts.map((prompt, pIdx) => (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  className="px-2.5 py-1 rounded-full bg-cream-2 border border-line text-ink hover:border-ink shrink-0"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-surface border-t border-line flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('assistant.askPlaceholder', 'Ask anything about products, orders, delivery...')}
              className="flex-1 h-10 px-3 bg-cream-2 border border-line rounded-full text-sm text-ink placeholder:text-ink-2 focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-full bg-primary text-ink flex items-center justify-center hover:bg-primary-600 disabled:opacity-50 transition-colors shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default CustomerAssistantModal;
