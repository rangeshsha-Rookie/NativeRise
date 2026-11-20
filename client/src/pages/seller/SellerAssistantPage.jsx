// client/src/pages/seller/SellerAssistantPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Send, Bot, User, Sparkles } from 'lucide-react';
import apiClient from '../../api/client';
import clsx from 'clsx';

export function SellerAssistantPage() {
  const { t, i18n } = useTranslation();
  const isMr = i18n.language === 'mr';

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        isMr
          ? 'नमस्कार! मी तुमचा NativeRise व्यवसाय सहाय्यक आहे. मी तुम्हाला ऑर्डर्स ट्रॅक करण्यात, नवीन उत्पादने नोंदवण्यात किंवा ग्राहक अभिप्राय समजून घेण्यात मदत करू शकतो.'
          : 'Namaste! I am your NativeRise Seller AI Assistant. I can help analyze your weekly orders, guide you on listing products, or review customer feedback.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickPrompts = isMr
    ? [
        'या आठवड्यात किती ऑर्डर्स आल्या?',
        'ग्राहक अभिप्रायात काय तक्रारी आहेत?',
        'नवीन लोणचे उत्पादन कसे जोडावे?'
      ]
    : [
        'How many orders do I have this week?',
        'What are customers saying in reviews?',
        'How do I add a new pickle product?'
      ];

  const handleSend = async (customText) => {
    const query = (customText || input).trim();
    if (!query || loading) return;

    const newMsgs = [...messages, { role: 'user', content: query }];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);

    try {
      const history = newMsgs.map((m) => ({ role: m.role, content: m.content })).slice(-6);
      const res = await apiClient.post('/ai/assistant', {
        message: query,
        history
      });

      if (res?.ok && res.data) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: res.data.reply || '',
            cards: res.data.cards || []
          }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: isMr ? 'माफ करा, उत्तर मिळवता आले नाही.' : 'Sorry, could not process request.'
          }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: err.message || (isMr ? 'तांत्रिक त्रुटी.' : 'Error contacting assistant.')
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-clay/10 text-clay text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>{isMr ? 'विक्रेता सहाय्यक (AI)' : 'Seller Grounded AI Assistant (F4)'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink">
          {isMr ? 'व्यवसाय सहाय्यक संवाद' : 'Seller Business Assistant'}
        </h1>
        <p className="text-xs sm:text-sm text-ink-2 mt-1">
          {isMr
            ? 'ऑर्डर्स, ग्राहक पुनरावलोकने आणि दुकान मार्गदर्शनाविषयी मराठीत सहज प्रश्न विचारा.'
            : 'Ask questions about your live shop orders, customer feedback, and listing tips.'}
        </p>
      </div>

      {/* Messages Feed */}
      <div className="bg-surface border border-line rounded-card p-4 sm:p-6 space-y-4 min-h-[400px] max-h-[550px] overflow-y-auto">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={clsx(
              'flex flex-col',
              m.role === 'user' ? 'items-end' : 'items-start'
            )}
          >
            <div
              className={clsx(
                'max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-sm space-y-1',
                m.role === 'user'
                  ? 'bg-primary text-ink rounded-tr-none font-medium'
                  : 'bg-cream text-ink border border-line rounded-tl-none'
              )}
            >
              <p className="whitespace-pre-line leading-relaxed">{m.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-ink-2 text-xs p-2.5 bg-cream-2 rounded-xl w-fit border border-line">
            <Bot className="w-4 h-4 animate-spin text-clay" />
            <span>{isMr ? 'माहिती शोधत आहे...' : 'Analyzing shop data...'}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(p)}
            className="px-3 py-1.5 rounded-full bg-cream-2 border border-line text-ink hover:border-ink shrink-0 font-medium"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isMr ? 'येथे प्रश्न विचारा...' : 'Ask assistant anything about your shop...'}
          className="flex-1 h-12 px-4 bg-surface border border-line rounded-full text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-600"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="w-12 h-12 rounded-full bg-primary text-ink flex items-center justify-center hover:bg-primary-600 disabled:opacity-50 transition-colors shrink-0 shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

export default SellerAssistantPage;
