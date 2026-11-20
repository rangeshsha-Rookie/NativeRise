// client/src/pages/seller/GrowthCoachPage.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp,
  ThumbsUp,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Package,
  RefreshCw,
  Lightbulb
} from 'lucide-react';
import apiClient from '../../api/client';
import Button from '../../components/ui/Button';

export function GrowthCoachPage() {
  const { t, i18n } = useTranslation();
  const isMr = i18n.language === 'mr';

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGrowthReport = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const res = await apiClient.get('/ai/growth-coach');
      const data = res?.data || res;
      if (data) {
        setReport(data.report || data);
      }
    } catch {
      // Handled
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGrowthReport();
  }, []);

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-10 space-y-6">
        <div className="h-10 w-48 bg-cream-2 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-cream-2 rounded-card animate-pulse" />
          <div className="h-64 bg-cream-2 rounded-card animate-pulse" />
        </div>
      </div>
    );
  }

  const reviewThemes = report?.reviewThemes || { praises: [], complaints: [] };
  const makeMore = report?.makeMore || [];
  const improve = report?.improve || [];
  const weeklyTips = report?.weeklyTips || [];

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-2">
            <TrendingUp className="w-4 h-4" />
            <span>{isMr ? 'ग्रोथ कोच बुद्धिमत्ता (AI)' : 'Growth Coach Intelligence (F3)'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-ink">
            {isMr ? 'व्यवसाय वाढीचा वैयक्तिक सल्लागार' : 'Growth Coach — Smart Sales Insights'}
          </h1>
          <p className="text-xs sm:text-base text-ink-2 mt-2 max-w-2xl leading-relaxed">
            {isMr
              ? 'ग्राहकांच्या अभिप्रायांचे विश्लेषण, सर्वाधिक विकली जाणारी उत्पादने आणि विक्री वाढवण्यासाठी कृतीशील मार्गदर्शन.'
              : 'AI review sentiment analyzer, demand velocity signals, and actionable rural weekly advice.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchGrowthReport(true)}
          className="px-4 py-2 rounded-full bg-surface border border-line text-ink text-xs font-semibold hover:bg-cream-2 transition-colors flex items-center gap-2 w-fit shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-clay' : ''}`} />
          <span>{isMr ? 'अद्ययावत करा' : 'Refresh Insights'}</span>
        </button>
      </div>

      {/* 1. Review Themes Sentiment Analyzer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Praises */}
        <div className="p-6 bg-surface border border-emerald-200 rounded-card space-y-4">
          <div className="flex items-center gap-2 text-emerald-800">
            <ThumbsUp className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-base sm:text-lg">
              {isMr ? 'ग्राहकांना काय आवडते (प्रशंसा)' : 'What Customers Love (Strengths)'}
            </h2>
          </div>

          <div className="space-y-2.5">
            {reviewThemes.praises?.length > 0 ? (
              reviewThemes.praises.map((item, idx) => (
                <div key={idx} className="p-3 bg-emerald-50 rounded-xl text-xs sm:text-sm text-emerald-900 flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{typeof item === 'object' ? item[isMr ? 'mr' : 'en'] || item.text : item}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-ink-2 italic">
                {isMr ? 'पारंपरिक अस्सल चव आणि घरगुती ताजेपणाला ग्राहकांची पसंती.' : 'Customers appreciate authentic homemade taste and fresh quality.'}
              </p>
            )}
          </div>
        </div>

        {/* Customer Complaints & Improvement Areas */}
        <div className="p-6 bg-surface border border-amber-200 rounded-card space-y-4">
          <div className="flex items-center gap-2 text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-700" />
            <h2 className="font-bold text-base sm:text-lg">
              {isMr ? 'सुधारणा आवश्यक बाबी (तक्रारी)' : 'Areas to Improve (Customer Feedback)'}
            </h2>
          </div>

          <div className="space-y-2.5">
            {reviewThemes.complaints?.length > 0 ? (
              reviewThemes.complaints.map((item, idx) => (
                <div key={idx} className="p-3 bg-amber-50 rounded-xl text-xs sm:text-sm text-amber-900 flex items-start gap-2">
                  <span className="text-amber-700 font-bold">!</span>
                  <span>{typeof item === 'object' ? item[isMr ? 'mr' : 'en'] || item.text : item}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-ink-2 italic">
                {isMr ? 'पॅकेजिंग गळती रोखण्यासाठी दुहेरी सील वापरण्याची विनंती.' : 'Requests for airtight double-seals to prevent oil leakages.'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 2. "Make More" & "Improve" Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Make More */}
        <div className="p-6 bg-surface border border-line rounded-card space-y-4">
          <div className="flex items-center gap-2 text-ink">
            <TrendingUp className="w-5 h-5 text-emerald-700" />
            <h2 className="font-bold text-base sm:text-lg">
              {isMr ? 'अधिक बनवा (उच्च मागणी)' : 'Make More (Top Velocity)'}
            </h2>
          </div>
          <p className="text-xs text-ink-2">
            {isMr
              ? 'ही उत्पादने वेगाने विकली जात आहेत किंवा उत्तम रेटिंग आहे. आगामी मागणीसाठी साठा वाढवा.'
              : 'High demand and strong ratings. Prepare extra batches to capture weekend demand.'}
          </p>

          <div className="space-y-3">
            {makeMore.length > 0 ? (
              makeMore.map((m, idx) => (
                <div key={idx} className="p-4 bg-cream-2 rounded-xl border border-line space-y-1">
                  <span className="font-bold text-sm text-ink block">
                    {m.title || m.productName || m.name || 'Top Product'}
                  </span>
                  <p className="text-xs text-ink-2">
                    {m.why ? `${m.why} ${m.action ? `Action: ${m.action}` : ''}` : m.advice || m.reason || (isMr ? 'दुप्पट साठा तयार ठेवा.' : 'Double current batch size.')}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-4 bg-cream-2 rounded-xl border border-line space-y-1">
                <span className="font-bold text-sm text-ink block">
                  {isMr ? 'अस्सल गावरान आंबा लोणचे' : 'Authentic Raw Mango Pickle'}
                </span>
                <p className="text-xs text-ink-2">
                  {isMr
                    ? 'ग्राहकांची सातत्याने मागणी आहे. ५०० ग्रॅम पॅकचा साठा किमान २० नगांवर ठेवा.'
                    : 'Consistently popular. Maintain stock above 20 units to avoid stockouts.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Improve / Optimize */}
        <div className="p-6 bg-surface border border-line rounded-card space-y-4">
          <div className="flex items-center gap-2 text-ink">
            <Package className="w-5 h-5 text-clay" />
            <h2 className="font-bold text-base sm:text-lg">
              {isMr ? 'सुधारणा करा (किंमत किंवा पॅकिंग)' : 'Optimize & Improve'}
            </h2>
          </div>
          <p className="text-xs text-ink-2">
            {isMr
              ? 'कमी विक्री होत असलेल्या उत्पादनांसाठी पॅक साइज किंवा किमतीमध्ये फेरबदल करा.'
              : 'Improve slower movers with smaller trial sizes or updated photography.'}
          </p>

          <div className="space-y-3">
            {improve.length > 0 ? (
              improve.map((m, idx) => (
                <div key={idx} className="p-4 bg-cream rounded-xl border border-line space-y-1">
                  <span className="font-bold text-sm text-ink block">
                    {m.title || m.productName || m.name || 'Product'}
                  </span>
                  <p className="text-xs text-ink-2">
                    {m.why ? `${m.why} ${m.action ? `Action: ${m.action}` : ''}` : m.advice || m.reason || (isMr ? '२५० ग्रॅम चाचणी पॅक सुरू करा.' : 'Introduce smaller 250g trial pack.')}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-4 bg-cream rounded-xl border border-line space-y-1">
                <span className="font-bold text-sm text-ink block">
                  {isMr ? 'कोल्हापुरी कांदा लसूण मसाला' : 'Kolhapuri Kanda Lasun Masala'}
                </span>
                <p className="text-xs text-ink-2">
                  {isMr
                    ? 'ग्राहकांना लहान १०० ग्रॅम नमुना पॅक हवा आहे. चाचणी पॅक उपलब्ध केल्यास विक्री वाढेल.'
                    : 'Customers are requesting a smaller 100g trial sachet alongside 500g.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Weekly Rural Entrepreneur Actionable Tips */}
      <div className="p-6 sm:p-8 bg-surface border border-line rounded-card space-y-4">
        <div className="flex items-center gap-2 text-ink">
          <Lightbulb className="w-5 h-5 text-amber-600" />
          <h2 className="font-bold text-base sm:text-lg">
            {isMr ? 'या आठवड्यातील उपयुक्त व्यवसाय सल्ले' : 'Actionable Weekly Tips for Rural Sellers'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(weeklyTips.length > 0
            ? weeklyTips
            : [
                {
                  en: 'Add a handwritten thank-you note or a small sample masala pouch with every order.',
                  mr: 'प्रत्येक पार्सलसोबत हाताने लिहिलेली आभाराची चिठ्ठी किंवा लहान नमुना मसाला पाकीट पाठवा.'
                },
                {
                  en: 'Take product photos during early morning natural sunlight on a clean rural wooden board.',
                  mr: 'सकाळच्या सूर्यप्रकाशात लाकडी पाटा किंवा स्वच्छ पृष्ठभागावर उत्पादनांचे स्पष्ट फोटो काढा.'
                },
                {
                  en: 'Ensure pickle bottle lids are sealed with tight cling-wrap before capping.',
                  mr: 'लोणच्याच्या बरणीवर झाकण लावण्यापूर्वी घट्ट प्लास्टिक किंवा सील लावा जेणेकरून तेल गळणार नाही.'
                }
              ]
          ).map((tip, idx) => (
            <div key={idx} className="p-4 bg-cream-2 rounded-xl border border-line space-y-2">
              <span className="w-6 h-6 rounded-full bg-clay text-cream flex items-center justify-center font-bold text-xs">
                {idx + 1}
              </span>
              <p className="text-xs sm:text-sm text-ink leading-relaxed">
                {typeof tip === 'object' ? tip[isMr ? 'mr' : 'en'] || tip.text : tip}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GrowthCoachPage;
