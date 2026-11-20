// client/src/pages/customer/SupportPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LifeBuoy, Plus, MessageSquare, ChevronRight, Clock, AlertCircle } from 'lucide-react';
import apiClient from '../../api/client';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import clsx from 'clsx';

const CATEGORIES = [
  { value: 'ORDER_STATUS', en: 'Order Status & Tracking', mr: 'ऑर्डर स्थिती व ट्रॅकिंग' },
  { value: 'DELIVERY_DELAY', en: 'Delivery Delay', mr: 'डिलिव्हरीला उशीर' },
  { value: 'PRODUCT_QUALITY', en: 'Product Quality / Damage', mr: 'उत्पादनाचा दर्जा किंवा नुकसान' },
  { value: 'PAYMENT_ISSUE', en: 'Payment & Billing', mr: 'पेमेंट व बिलिंग समस्या' },
  { value: 'GENERAL', en: 'General Question', mr: 'सर्वसाधारण चौकशी' }
];

export function SupportPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isMr = i18n.language === 'mr';

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // New Ticket Form State
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('ORDER_STATUS');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchTickets = async () => {
    try {
      const res = await apiClient.get('/support/tickets');
      if (res?.ok && res.data) {
        setTickets(res.data.tickets || res.data || []);
      }
    } catch (err) {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreate = async () => {
    if (!subject.trim() || !description.trim()) return;
    setCreating(true);
    try {
      const res = await apiClient.post('/support/tickets', {
        subject: subject.trim(),
        category,
        description: description.trim()
      });
      if (res?.ok && res.data) {
        setCreateModalOpen(false);
        const ticketId = res.data.ticket?._id || res.data._id;
        navigate(`/support/${ticketId}`);
      }
    } catch (err) {
      alert(err.message || 'Failed to create support ticket');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink">
            {isMr ? 'ग्राहक साहाय्य केंद्र' : 'Customer Support & Help'}
          </h1>
          <p className="text-xs sm:text-sm text-ink-2 mt-1">
            {isMr
              ? 'ऑर्डर, उत्पादने किंवा डिलिव्हरी संदर्भात थेट मदत मिळवा.'
              : 'Direct communication with village sellers and platform support.'}
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>{isMr ? 'नवीन तक्रार / प्रश्न' : 'New Ticket'}</span>
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-24 bg-cream-2 rounded-card animate-pulse" />
          ))}
        </div>
      ) : tickets.length > 0 ? (
        <div className="space-y-4">
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
                to={`/support/${ticketId}`}
                className="p-5 bg-surface border border-line rounded-card flex items-center justify-between gap-4 hover:border-ink hover:shadow-sm transition-all block"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
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
        <div className="p-16 text-center bg-surface border border-line rounded-card space-y-4">
          <LifeBuoy className="w-12 h-12 mx-auto text-ink-2" />
          <p className="text-base font-semibold text-ink">
            {isMr ? 'तुमची कोणतीही प्रलंबित तक्रार किंवा प्रश्न नाही.' : 'No support tickets yet.'}
          </p>
          <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
            {isMr ? 'मदत किंवा प्रश्न विचारा' : 'Raise a Support Request'}
          </Button>
        </div>
      )}

      {/* Create Ticket Modal */}
      {createModalOpen && (
        <Modal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title={isMr ? 'नवीन तक्रार किंवा प्रश्न नोंदवा' : 'Raise Support Inquiry'}
          maxWidth="max-w-lg"
        >
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-ink-2 block mb-1">
                {isMr ? 'विभाग / वर्गवारी' : 'Category'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-11 px-3 bg-cream-2 border border-line rounded-xl text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-600 font-medium"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {isMr ? c.mr : c.en}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-ink-2 block mb-1">
                {isMr ? 'विषय' : 'Subject'}
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={isMr ? 'उदा. ऑर्डर पोहचण्यास उशीर झाला आहे' : 'e.g. Delivery status question'}
                className="w-full h-11 px-3 bg-cream-2 border border-line rounded-xl text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-ink-2 block mb-1">
                {isMr ? 'सविस्तर माहिती' : 'Detailed Description'}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder={isMr ? 'तुमच्या समस्येचे संपूर्ण वर्णन करा...' : 'Describe what happened and how we can assist you...'}
                className="w-full p-3 bg-cream-2 border border-line rounded-xl text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setCreateModalOpen(false)}>
                {isMr ? 'रद्द करा' : 'Cancel'}
              </Button>
              <Button
                variant="primary"
                loading={creating}
                onClick={handleCreate}
                disabled={!subject.trim() || !description.trim()}
              >
                {isMr ? 'तिकीट पाठवा' : 'Submit Ticket'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default SupportPage;
