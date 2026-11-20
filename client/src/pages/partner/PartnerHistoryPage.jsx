// client/src/pages/partner/PartnerHistoryPage.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Truck, CheckCircle2, DollarSign, Calendar, MapPin } from 'lucide-react';
import apiClient from '../../api/client';

export function PartnerHistoryPage() {
  const { t, i18n } = useTranslation();
  const isMr = i18n.language === 'mr';

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get('/partner/history')
      .then((res) => {
        if (res?.ok && res.data) {
          setHistory(res.data.history || res.data || []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto px-4 sm:px-8 py-10 space-y-4">
        <div className="h-8 w-48 bg-cream-2 rounded animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-24 bg-cream-2 rounded-card animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink">
          {isMr ? 'डिलिव्हरी इतिहास' : 'Delivery Trip History'}
        </h1>
        <p className="text-xs sm:text-sm text-ink-2 mt-1">
          {isMr ? 'मागील सर्व पूर्ण झालेल्या डिलिव्हरी ट्रिप्स.' : 'All completed and delivered orders.'}
        </p>
      </div>

      {history.length > 0 ? (
        <div className="bg-surface border border-line rounded-card divide-y divide-line overflow-hidden">
          {history.map((item, idx) => {
            const payoutRs = Math.round((item.partnerPayoutPaise || 0) / 100);
            return (
              <div key={idx} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono text-sm text-ink">#{item.orderNo}</span>
                    <span className="text-xs text-ink-2">
                      · {new Date(item.deliveredAt || item.createdAt).toLocaleDateString()}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Delivered
                    </span>
                  </div>
                  <p className="text-xs text-ink-2">
                    {item.roadDistanceKm ? `${item.roadDistanceKm.toFixed(1)} km · ` : ''}
                    {item.dropVillage || 'Customer Village'}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-ink-2 block">{isMr ? 'मिळालेली रक्कम' : 'Payout'}</span>
                  <span className="text-base font-bold text-emerald-700">₹{payoutRs}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-16 text-center bg-surface border border-line rounded-card space-y-2">
          <Truck className="w-8 h-8 mx-auto text-ink-2" />
          <p className="text-sm font-semibold text-ink">
            {isMr ? 'कोणताही डिलिव्हरी इतिहास नाही.' : 'No delivery trip history yet.'}
          </p>
        </div>
      )}
    </div>
  );
}

export default PartnerHistoryPage;
