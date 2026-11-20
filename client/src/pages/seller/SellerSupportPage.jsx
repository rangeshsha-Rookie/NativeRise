// client/src/pages/seller/SellerSupportPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LifeBuoy, ChevronRight, MessageSquare, Clock } from 'lucide-react';
import apiClient from '../../api/client';
import clsx from 'clsx';

export function SellerSupportPage() {
  const { t, i18n } = useTranslation();
  const isMr = i18n.language === 'mr';

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get('/seller/support/tickets')
      .then((res) => {
        if (res?.ok && res.data) {
          setTickets(res.data.tickets || res.data || []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-[900px] mx-auto px-4 sm:px-8 py-10 space-y-4">
        <div className="h-8 w-48 bg-cream-2 rounded animate-pulse" />
        <div className="space-y-3">
          {[1, 2].map((n) => (
            <div key={n} className="h-24 bg-cream-2 rounded-card animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink">
          {isMr ? 'ग्राहक साहाय्य इनबॉक्स' : 'Customer Support Inbox'}
        </h1>
        <p className="text-xs sm:text-sm text-ink-2 mt-1">
          {isMr
            ? 'ग्राहकांचे प्रश्न व तक्रारींची उत्तरे AI सहाय्याने जलद द्या.'
            : 'Answer customer order questions with AI-drafted replies (Feature F10).'}
        </p>
      </div>

      {tickets.length > 0 ? (
        <div className="space-y-3">
          {tickets.map((t) => {
            const ticketId = t._id || t.id;
            const statusStyles = {
              OPEN: 'bg-blue-50 text-blue-700 border-blue-200',
              IN_PROGRESS: 'bg-amber-50 text-amber-800 border-amber-200',
              RESOLVED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
              CLOSED: 'bg-gray-100 text-gray-700 border-gray-200'
            };

            return (
              <Link
                key={ticketId}
                to={`/seller/support/${ticketId}`}
                className="p-5 bg-surface border border-line rounded-card flex items-center justify-between gap-4 hover:border-ink hover:shadow-sm transition-all block"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={clsx(
                        'px-2.5 py-0.5 rounded-full text-[11px] font-bold border',
                        statusStyles[t.status] || 'bg-cream-2 text-ink-2'
                      )}
                    >
                      {t.status}
                    </span>
                    <span className="text-xs text-ink-2">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </span>
                    {t.order && (
                      <span className="text-xs font-mono text-clay">
                        #{t.order.orderNo || t.order}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-base text-ink">{t.subject}</h3>
                  <p className="text-xs text-ink-2 line-clamp-1">{t.description}</p>
                </div>

                <ChevronRight className="w-5 h-5 text-ink-2 shrink-0" />
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="p-16 text-center bg-surface border border-line rounded-card space-y-2">
          <LifeBuoy className="w-10 h-10 mx-auto text-ink-2" />
          <p className="text-sm font-semibold text-ink">
            {isMr ? 'कोणतेही प्रलंबित तिकीट नाही.' : 'No customer support queries found.'}
          </p>
        </div>
      )}
    </div>
  );
}

export default SellerSupportPage;
