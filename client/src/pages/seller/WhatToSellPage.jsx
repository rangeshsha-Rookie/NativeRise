// client/src/pages/seller/WhatToSellPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Lightbulb,
  Sparkles,
  CheckCircle,
  TrendingUp,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  CheckSquare,
  Square
} from 'lucide-react';
import apiClient from '../../api/client';
import Button from '../../components/ui/Button';

const RESOURCE_OPTIONS = [
  { id: 'farm_land', en: 'Farm land / Fruit trees (Mango, Lemon, Amla)', mr: 'शेती / फळबागा (आंबा, लिंबू, आवळा)' },
  { id: 'kitchen_setup', en: 'Kitchen with stone grinder / large utensils', mr: 'घरगुती स्वयंपाकघर / पाटा-वरवंटा / मोठी भांडी' },
  { id: 'dairy_animals', en: 'Cows / Buffaloes (Fresh milk, Desi ghee)', mr: 'गायी-म्हशी (ताजे दूध, गावरान तूप)' },
  { id: 'bee_boxes', en: 'Honey bee boxes / Forest access', mr: 'मधमाश्यांच्या पेट्या / वनसंपदा' },
  { id: 'craft_tools', en: 'Handicraft / Stitching / Bamboo tools', mr: 'हस्तकला / शिलाई मशीन / बांबू साहित्य' }
];

const BUDGET_BANDS = [
  { id: 'LOW', en: 'Under ₹5,000 (Low investment)', mr: '₹५,००० च्या आत (कमी भांडवल)' },
  { id: 'MEDIUM', en: '₹5,000 - ₹20,000 (Medium)', mr: '₹५,००० ते ₹२०,००० (मध्यम)' },
  { id: 'HIGH', en: '₹20,000+ (High investment)', mr: '₹२०,००० पेक्षा जास्त' }
];

export function WhatToSellPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isMr = i18n.language === 'mr';

  const [selectedResources, setSelectedResources] = useState(['kitchen_setup', 'farm_land']);
  const [budgetBand, setBudgetBand] = useState('LOW');
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Auto-generate on first load with defaults
  useEffect(() => {
    handleGenerateIdeas();
  }, []);

  const toggleResource = (id) => {
    setSelectedResources((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleGenerateIdeas = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post('/ai/what-to-sell', {
        resources: selectedResources,
        budgetBand
      });

      if (res?.ok && res.data) {
        setIdeas(res.data.ideas || res.data || []);
        setHasGenerated(true);
      }
    } catch (err) {
      alert(err.message || 'Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleListProduct = (idea) => {
    const prefill = {
      nameEn: idea.name?.en || idea.title?.en || idea.name || '',
      nameMr: idea.name?.mr || idea.title?.mr || idea.name || '',
      category: idea.category || 'pickles',
      priceRs: idea.estimatedPriceRs || Math.round((idea.suggestedPricePaise || 25000) / 100),
      descEn: idea.description?.en || idea.reason || '',
      descMr: idea.description?.mr || idea.reason || ''
    };
    navigate('/seller/products/new', { state: { prefill } });
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-10">
      <div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
          <Lightbulb className="w-4 h-4" />
          <span>{isMr ? 'बाजारपेठ मागणी विश्लेषण (AI)' : 'Market Signal Intelligence (F1)'}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-serif font-bold text-ink">
          {isMr ? 'काय विकावे? — हुशार व्यवसाय सल्लागार' : 'What to Sell — Grounded AI Product Ideas'}
        </h1>
        <p className="text-xs sm:text-base text-ink-2 mt-2 max-w-2xl leading-relaxed">
          {isMr
            ? 'प्लॅटफॉर्मवरील ग्राहकांच्या अपूर्ण शोध, कमी स्पर्धा असलेल्या श्रेणी आणि तुमच्याकडील उपलब्ध साधनसामग्रीनुसार ४ खात्रीशीर उत्पादन कल्पना.'
            : 'AI recommendations powered by real unmet search misses, low-competition categories, and your available farm/kitchen resources.'}
        </p>
      </div>

      {/* Input Form Box */}
      <div className="p-6 sm:p-8 bg-surface border border-line rounded-card space-y-6">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-ink mb-3">
            {isMr ? '१. तुमच्याकडे कोणती साधनसामग्री उपलब्ध आहे?' : '1. What resources do you have available?'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {RESOURCE_OPTIONS.map((opt) => {
              const isChecked = selectedResources.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleResource(opt.id)}
                  className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    isChecked
                      ? 'bg-cream-2 border-clay shadow-sm'
                      : 'bg-cream border-line hover:border-ink'
                  }`}
                >
                  {isChecked ? (
                    <CheckSquare className="w-5 h-5 text-clay shrink-0 mt-0.5" />
                  ) : (
                    <Square className="w-5 h-5 text-ink-2 shrink-0 mt-0.5" />
                  )}
                  <span className="text-xs sm:text-sm font-semibold text-ink">
                    {isMr ? opt.mr : opt.en}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-ink mb-3">
            {isMr ? '२. अंदाजे भांडवल मर्यादा' : '2. Estimated Investment Budget'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {BUDGET_BANDS.map((b) => (
              <label
                key={b.id}
                className={`p-3.5 rounded-xl border cursor-pointer text-center font-semibold text-xs sm:text-sm transition-all ${
                  budgetBand === b.id
                    ? 'bg-clay text-cream border-clay shadow-sm'
                    : 'bg-cream border-line text-ink hover:bg-cream-2'
                }`}
              >
                <input
                  type="radio"
                  name="budget"
                  checked={budgetBand === b.id}
                  onChange={() => setBudgetBand(b.id)}
                  className="hidden"
                />
                <span>{isMr ? b.mr : b.en}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button
            variant="primary"
            size="lg"
            loading={loading}
            onClick={handleGenerateIdeas}
            className="flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            <span>{isMr ? 'कल्पना तयार करा' : 'Generate Product Ideas'}</span>
          </Button>
        </div>
      </div>

      {/* Generated 4 Grounded Cards */}
      <div className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-ink">
          {isMr ? 'तुमच्यासाठी सुचवलेल्या उत्पादन कल्पना' : 'Recommended High-Demand Products'}
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-72 bg-cream-2 rounded-card animate-pulse" />
            ))}
          </div>
        ) : ideas.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ideas.map((idea, idx) => {
              const title =
                idea.name?.[isMr ? 'mr' : 'en'] ||
                idea.title?.[isMr ? 'mr' : 'en'] ||
                idea.name ||
                idea.title ||
                'Product Idea';
              const reason =
                idea.reason?.[isMr ? 'mr' : 'en'] ||
                idea.demandSignal ||
                idea.reason ||
                'High unmet search demand in your district';

              return (
                <div
                  key={idx}
                  className="bg-surface border border-line rounded-card p-6 flex flex-col justify-between hover:shadow-md transition-all space-y-4"
                >
                  <div className="space-y-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-clay/10 text-clay text-[11px] font-bold uppercase tracking-wider">
                      {idea.category || 'pickles'}
                    </span>
                    <h3 className="font-bold text-lg text-ink leading-tight">{title}</h3>

                    {/* Financial Estimates */}
                    <div className="p-3 bg-cream-2 rounded-xl text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-ink-2">{isMr ? 'अंदाजे किंमत' : 'Price Point:'}</span>
                        <span className="font-bold text-ink">
                          ₹{idea.estimatedPriceRs || Math.round((idea.suggestedPricePaise || 25000) / 100)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-2">{isMr ? 'अपेक्षित नफा' : 'Margin:'}</span>
                        <span className="font-bold text-emerald-700">{idea.estimatedMargin || '35-45%'}</span>
                      </div>
                    </div>

                    {/* Why this sells */}
                    <div className="text-xs text-ink-2 leading-relaxed">
                      <strong className="text-ink block mb-0.5">
                        {isMr ? 'का विकावे? (मागणी संकेत):' : 'Why this sells:'}
                      </strong>
                      <p>{reason}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleListProduct(idea)}
                    className="w-full h-11 rounded-full bg-primary text-ink text-xs sm:text-sm font-semibold hover:bg-primary-600 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>{isMr ? 'हे उत्पादन आत्ताच नोंदवा' : 'List This Product'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-ink-2 italic">
            {isMr ? 'कोणत्याही शिफारसी उपलब्ध नाहीत.' : 'No recommendations available.'}
          </p>
        )}
      </div>
    </div>
  );
}

export default WhatToSellPage;
