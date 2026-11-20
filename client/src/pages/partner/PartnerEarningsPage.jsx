// client/src/pages/partner/PartnerEarningsPage.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DollarSign, ShieldAlert, Banknote, ArrowDownRight, CheckCircle2 } from 'lucide-react';
import apiClient from '../../api/client';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';

export function PartnerEarningsPage() {
  const { t, i18n } = useTranslation();
  const isMr = i18n.language === 'mr';

  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cash Deposit Modal
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositAmountRs, setDepositAmountRs] = useState('');
  const [depositing, setDepositing] = useState(false);

  const fetchEarnings = async () => {
    try {
      const res = await apiClient.get('/partner/earnings');
      const data = res?.data || res;
      if (data) {
        setEarnings(data);
      }
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  const handleConfirmDeposit = async (e) => {
    e.preventDefault();
    const amountRs = parseInt(depositAmountRs, 10);
    if (!amountRs || amountRs <= 0) return;

    setDepositing(true);
    try {
      const res = await apiClient.post('/partner/cash-deposit', {
        amountPaise: amountRs * 100
      });
      if (res?.ok) {
        setDepositModalOpen(false);
        setDepositAmountRs('');
        fetchEarnings();
      }
    } catch (err) {
      alert(err.message || 'Deposit failed');
    } finally {
      setDepositing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto px-4 sm:px-8 py-10 space-y-4">
        <div className="h-8 w-48 bg-cream-2 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 bg-cream-2 rounded-card animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const totalEarningsRs = Math.round((earnings?.totalEarningsPaise || 0) / 100);
  const todayEarningsRs = Math.round((earnings?.todayEarningsPaise || 0) / 100);
  const cashToDepositRs = Math.round((earnings?.cashToDepositPaise || 0) / 100);
  const history = earnings?.history || earnings?.trips || [];

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink">
            {isMr ? 'डिलिव्हरी कमाई आणि रोख जमा' : 'Delivery Earnings & COD Cash'}
          </h1>

          {/* Decision S1: Simulated Settlement */}
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{t('seller.simulatedBadge', 'Simulated settlement')}</span>
          </span>
        </div>
        <p className="text-xs sm:text-sm text-ink-2 mt-1">
          {isMr
            ? 'प्रत्येक यशस्वी डिलिव्हरीची कमाई आणि ग्राहकांकडून गोळा केलेल्या COD रोख रकमेचा हिशोब.'
            : 'Trip payouts and COD cash collection tracking with simulated deposits.'}
        </p>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-surface border border-line rounded-card space-y-1">
          <span className="text-xs text-ink-2 font-medium">{isMr ? 'आजची कमाई' : "Today's Earnings"}</span>
          <p className="text-2xl sm:text-3xl font-bold font-serif text-emerald-700">₹{todayEarningsRs}</p>
          <span className="text-[11px] text-ink-2">{isMr ? 'आज पूर्ण झालेल्या ट्रिप्स' : 'Completed trips today'}</span>
        </div>

        <div className="p-5 bg-surface border border-line rounded-card space-y-1">
          <span className="text-xs text-ink-2 font-medium">{isMr ? 'एकूण कमाई (एकत्रित)' : 'Total Cumulative Earnings'}</span>
          <p className="text-2xl sm:text-3xl font-bold font-serif text-ink">₹{totalEarningsRs}</p>
          <span className="text-[11px] text-ink-2">{isMr ? 'प्लॅटफॉर्मवर मिळालेला परतावा' : 'Earned on NativeRise'}</span>
        </div>

        {/* Cash to Deposit Card (Correction C9) */}
        <div className="p-5 bg-amber-50 border-2 border-amber-200 rounded-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase">
              {isMr ? 'जमा करायची रोख (COD)' : 'COD Cash Held'}
            </span>
            <Banknote className="w-4 h-4 text-amber-700" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-serif text-amber-900">₹{cashToDepositRs}</p>
          {cashToDepositRs > 0 && (
            <button
              type="button"
              onClick={() => {
                setDepositAmountRs(cashToDepositRs.toString());
                setDepositModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-full bg-amber-200 text-amber-900 text-xs font-bold hover:bg-amber-300 transition-colors shadow-sm"
            >
              {isMr ? 'रोख जमा करा (सिम्युलेटेड)' : 'Deposit Cash Now'}
            </button>
          )}
        </div>
      </div>

      {/* Trips / Earnings List */}
      <div className="space-y-4">
        <h2 className="text-lg font-serif font-bold text-ink">
          {isMr ? 'अलीकडील डिलिव्हरी ट्रिप्स' : 'Recent Delivery Trips'}
        </h2>

        {history.length > 0 ? (
          <div className="bg-surface border border-line rounded-card divide-y divide-line overflow-hidden">
            {history.map((t, idx) => {
              const payoutRs = Math.round((t.partnerPayoutPaise || t.payoutPaise || 0) / 100);
              const codRs = Math.round((t.codCashCollectedPaise || 0) / 100);

              return (
                <div key={idx} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono text-sm text-ink">
                        #{t.orderNo || `DEL-${idx + 1}`}
                      </span>
                      <span className="text-xs text-ink-2">
                        · {new Date(t.deliveredAt || t.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Delivered
                      </span>
                    </div>
                    <p className="text-xs text-ink-2">
                      {t.distanceKm ? `${t.distanceKm.toFixed(1)} km · ` : ''}
                      {t.dropVillage || 'Customer Village'}
                      {codRs > 0 && <span className="text-amber-800 font-medium"> · 💵 COD Collected: ₹{codRs}</span>}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-ink-2 block">{isMr ? 'कमाई' : 'Payout'}</span>
                    <span className="text-base font-bold text-emerald-700">₹{payoutRs}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center bg-surface border border-line rounded-card space-y-2">
            <DollarSign className="w-8 h-8 mx-auto text-ink-2" />
            <p className="text-sm font-semibold text-ink">
              {isMr ? 'कोणतेही ट्रिप व्यवहार नाहीत.' : 'No completed delivery trips yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Cash Deposit Modal */}
      {depositModalOpen && (
        <Modal
          isOpen={depositModalOpen}
          onClose={() => setDepositModalOpen(false)}
          title={isMr ? 'कॅश ऑन डिलिव्हरी रक्कम जमा करा' : 'Deposit COD Cash (Simulated)'}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleConfirmDeposit} className="p-5 space-y-4">
            <p className="text-xs sm:text-sm text-ink-2">
              {isMr
                ? 'ग्राहकांकडून गोळा केलेली रोख रक्कम बँकेत किंवा संकलन केंद्रात जमा केल्याची नोंद करा.'
                : 'Enter the amount of collected COD cash to deposit and clear your pending liability.'}
            </p>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-ink-2 block mb-1">
                {isMr ? 'जमा करायची रक्कम (रुपये)' : 'Amount to Deposit (₹)'}
              </label>
              <input
                type="number"
                min="1"
                max={cashToDepositRs}
                value={depositAmountRs}
                onChange={(e) => setDepositAmountRs(e.target.value)}
                className="w-full h-12 px-3 bg-cream-2 border border-line rounded-xl text-lg font-bold font-mono text-ink focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setDepositModalOpen(false)}>
                {isMr ? 'रद्द करा' : 'Cancel'}
              </Button>
              <Button type="submit" variant="primary" loading={depositing}>
                {isMr ? 'रक्कम जमा करा' : 'Confirm Deposit'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default PartnerEarningsPage;
