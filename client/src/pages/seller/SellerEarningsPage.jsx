// client/src/pages/seller/SellerEarningsPage.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DollarSign, ShieldAlert, ArrowDownRight, Clock, CheckCircle2 } from 'lucide-react';
import apiClient from '../../api/client';

export function SellerEarningsPage() {
  const { t, i18n } = useTranslation();
  const isMr = i18n.language === 'mr';

  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get('/seller/earnings')
      .then((res) => {
        if (res?.ok && res.data) {
          setEarnings(res.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto px-4 sm:px-8 py-10 space-y-4">
        <div className="h-8 w-48 bg-cream-2 rounded animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 bg-cream-2 rounded-card animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const totalEarningsRs = Math.round((earnings?.totalEarningsPaise || 0) / 100);
  const pendingSettlementRs = Math.round((earnings?.pendingSettlementPaise || 0) / 100);
  const settledRs = Math.round((earnings?.settledPaise || 0) / 100);
  const ledger = earnings?.ledger || [];

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink">
            {isMr ? 'कमाई आणि हिशोब' : 'Earnings & Settlements'}
          </h1>

          {/* Decision S1: Simulated Settlement Badge */}
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{t('seller.simulatedBadge', 'Simulated settlement')}</span>
          </span>
        </div>
        <p className="text-xs sm:text-sm text-ink-2 mt-1">
          {isMr
            ? 'प्रत्येक ऑर्डरचा पारदर्शक हिशोब — प्लॅटफॉर्म फी आणि डिलिव्हरी खर्चाची वजावट.'
            : 'Transparent per-order ledger with items total, platform fee, and net earnings.'}
        </p>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-surface border border-line rounded-card space-y-1">
          <span className="text-xs text-ink-2 font-medium">{isMr ? 'एकूण निव्वळ कमाई' : 'Total Net Earnings'}</span>
          <p className="text-2xl sm:text-3xl font-bold font-serif text-emerald-700">₹{totalEarningsRs}</p>
          <span className="text-[11px] text-ink-2">{isMr ? 'सर्व पूर्ण झालेल्या ऑर्डर्स' : 'From completed orders'}</span>
        </div>

        <div className="p-5 bg-surface border border-line rounded-card space-y-1">
          <span className="text-xs text-ink-2 font-medium">{isMr ? 'जमा होणे बाकी' : 'Pending Settlement'}</span>
          <p className="text-2xl sm:text-3xl font-bold font-serif text-blue-700">₹{pendingSettlementRs}</p>
          <span className="text-[11px] text-ink-2">{isMr ? 'पुढील हिशोबात जमा होईल' : 'Next simulated cycle'}</span>
        </div>

        <div className="p-5 bg-surface border border-line rounded-card space-y-1">
          <span className="text-xs text-ink-2 font-medium">{isMr ? 'जमा झालेली रक्कम' : 'Settled Balance'}</span>
          <p className="text-2xl sm:text-3xl font-bold font-serif text-ink">₹{settledRs}</p>
          <span className="text-[11px] text-ink-2">{isMr ? 'खात्यात जमा (सिम्युलेटेड)' : 'Credited to account'}</span>
        </div>
      </div>

      {/* Ledger Table (Correction C18) */}
      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-serif font-bold text-ink">
          {isMr ? 'ऑर्डरनिहाय हिशोब नोंदवही (लेजर)' : 'Order-by-Order Transaction Ledger'}
        </h2>

        {ledger.length > 0 ? (
          <div className="bg-surface border border-line rounded-card divide-y divide-line overflow-hidden">
            {ledger.map((entry, idx) => {
              const amountRs = Math.round((entry.amountPaise || 0) / 100);
              const itemsTotalRs = Math.round((entry.itemsTotalPaise || entry.breakdown?.itemsTotalPaise || 0) / 100);
              const platformFeeRs = Math.round((entry.platformFeePaise || entry.breakdown?.platformFeePaise || 0) / 100);

              return (
                <div key={idx} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono text-sm text-ink">
                        #{entry.orderNo || `TX-${idx + 1}`}
                      </span>
                      <span className="text-xs text-ink-2">
                        · {new Date(entry.createdAt || entry.date || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-xs text-ink-2 flex flex-wrap gap-x-3">
                      <span>Items: ₹{itemsTotalRs || amountRs + platformFeeRs}</span>
                      <span>Platform fee (5%): -₹{platformFeeRs || Math.round(itemsTotalRs * 0.05)}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-ink-2 block">{isMr ? 'निव्वळ जमा' : 'Net Credited'}</span>
                    <span className="text-base font-bold text-emerald-700">₹{amountRs}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center bg-surface border border-line rounded-card space-y-2">
            <DollarSign className="w-8 h-8 mx-auto text-ink-2" />
            <p className="text-sm font-semibold text-ink">
              {isMr ? 'अद्याप कोणतेही व्यवहार नाहीत.' : 'No transactions recorded yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SellerEarningsPage;
