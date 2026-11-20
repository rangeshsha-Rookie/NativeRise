// client/src/pages/seller/AddEditProductPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Camera,
  Mic,
  Sparkles,
  ArrowLeft,
  Save,
  Upload,
  AlertCircle,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import apiClient from '../../api/client';
import Button from '../../components/ui/Button';
import clsx from 'clsx';

const CATEGORIES = [
  { slug: 'pickles', en: 'Pickles', mr: 'लोणची' },
  { slug: 'masalas', en: 'Spices & Masalas', mr: 'मसाले' },
  { slug: 'sweets_snacks', en: 'Sweets & Snacks', mr: 'फराळ व मिठाई' },
  { slug: 'grains_flours', en: 'Grains & Flours', mr: 'धान्य व पिठे' },
  { slug: 'honey_preserves', en: 'Honey & Preserves', mr: 'मध व जॅम' },
  { slug: 'dairy_ghee', en: 'Village Ghee & Dairy', mr: 'साजुक तूप व दुग्धजन्य' },
  { slug: 'handicrafts', en: 'Handicrafts', mr: 'हस्तकला' },
  { slug: 'personal_care', en: 'Personal Care', mr: 'नैसर्गिक सौंदर्यप्रसाधने' }
];

// Normalize Devanagari numbers to Latin (Correction C17)
function normalizeDevanagariDigits(str) {
  if (!str) return '';
  const devanagari = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return str.toString().replace(/[०-९]/g, (w) => devanagari.indexOf(w));
}

export function AddEditProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isMr = i18n.language === 'mr';

  const isEditing = Boolean(id && id !== 'new');

  // Form State
  const [nameEn, setNameEn] = useState('');
  const [nameMr, setNameMr] = useState('');
  const [category, setCategory] = useState('pickles');
  const [priceRs, setPriceRs] = useState('');
  const [quantityValue, setQuantityValue] = useState('500');
  const [quantityUnit, setQuantityUnit] = useState('g');
  const [stock, setStock] = useState('10');
  const [descEn, setDescEn] = useState('');
  const [descMr, setDescMr] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // AI Feature States
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [showVoiceBox, setShowVoiceBox] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  // Load existing product if editing, or prefill if passed via state from WhatToSell
  useEffect(() => {
    if (isEditing) {
      apiClient
        .get(`/seller/products/${id}`)
        .then((res) => {
          if (res?.ok && res.data) {
            const p = res.data.product || res.data;
            setNameEn(p.name?.en || '');
            setNameMr(p.name?.mr || '');
            setCategory(p.category || 'pickles');
            setPriceRs(Math.round((p.pricePaise || 0) / 100).toString());
            setQuantityValue(p.quantityValue?.toString() || '500');
            setQuantityUnit(p.quantityUnit || 'g');
            setStock(p.stock?.toString() || '10');
            setDescEn(p.description?.en || '');
            setDescMr(p.description?.mr || '');
            setImageUrl(p.images?.[0] || '');
          }
        })
        .finally(() => setLoading(false));
    } else if (location.state?.prefill) {
      const pf = location.state.prefill;
      if (pf.nameEn) setNameEn(pf.nameEn);
      if (pf.nameMr) setNameMr(pf.nameMr);
      if (pf.category) setCategory(pf.category);
      if (pf.priceRs) setPriceRs(pf.priceRs.toString());
      if (pf.descEn) setDescEn(pf.descEn);
      if (pf.descMr) setDescMr(pf.descMr);
    }
  }, [id, isEditing, location.state]);

  // AI Feature: Snap & Sell (F2)
  const handleSnapAndSell = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAiLoading(true);
    setAiMessage(isMr ? 'AI फोटोचे विश्लेषण करत आहे...' : 'AI analyzing photo & drafting listing...');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result;
        try {
          const res = await apiClient.post('/ai/snap-sell', {
            image: base64Data,
            notes: file.name
          });

          if (res?.ok && res.data) {
            const parsed = res.data;
            if (parsed.name?.en) setNameEn(parsed.name.en);
            if (parsed.name?.mr) setNameMr(parsed.name.mr);
            if (parsed.category) setCategory(parsed.category);
            if (parsed.pricePaise) setPriceRs(Math.round(parsed.pricePaise / 100).toString());
            if (parsed.description?.en) setDescEn(parsed.description.en);
            if (parsed.description?.mr) setDescMr(parsed.description.mr);
            if (parsed.quantityUnit) setQuantityUnit(parsed.quantityUnit);
            if (parsed.quantityValue) setQuantityValue(parsed.quantityValue.toString());
            setImageUrl(
              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'
            );
            setAiMessage(isMr ? 'उत्पादन तपशील यशस्वीपणे भरले गेले!' : 'Listing details auto-filled by Snap & Sell AI!');
          }
        } catch (err) {
          alert(err.message || 'Snap & Sell failed');
        } finally {
          setAiLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setAiLoading(false);
    }
  };

  // AI Feature: Voice to Listing (F2)
  const handleVoiceListing = async () => {
    if (!voiceTranscript.trim()) return;
    setAiLoading(true);
    setAiMessage(isMr ? 'AI आवाजाचे विश्लेषण करत आहे...' : 'AI processing spoken audio/text...');

    try {
      const res = await apiClient.post('/ai/voice-listing', {
        transcript: voiceTranscript.trim()
      });

      if (res?.ok && res.data) {
        const parsed = res.data;
        if (parsed.name?.en) setNameEn(parsed.name.en);
        if (parsed.name?.mr) setNameMr(parsed.name.mr);
        if (parsed.category) setCategory(parsed.category);
        if (parsed.pricePaise) setPriceRs(Math.round(parsed.pricePaise / 100).toString());
        if (parsed.stock) setStock(parsed.stock.toString());
        if (parsed.description?.en) setDescEn(parsed.description.en);
        if (parsed.description?.mr) setDescMr(parsed.description.mr);
        if (parsed.quantityUnit) setQuantityUnit(parsed.quantityUnit);
        if (parsed.quantityValue) setQuantityValue(parsed.quantityValue.toString());
        setShowVoiceBox(false);
        setVoiceTranscript('');
        setAiMessage(isMr ? 'आवाजावरून माहिती भरली गेली!' : 'Extracted product details from voice transcript!');
      }
    } catch (err) {
      alert(err.message || 'Voice listing failed');
    } finally {
      setAiLoading(false);
    }
  };

  // AI Feature: Describe Product
  const handleAiDescribe = async () => {
    const currentName = nameMr || nameEn;
    if (!currentName.trim()) {
      alert(isMr ? 'कृपया आधी उत्पादनाचे नाव प्रविष्ट करा.' : 'Please enter a product title first.');
      return;
    }

    setAiLoading(true);
    setAiMessage(isMr ? 'AI सविस्तर वर्णन तयार करत आहे...' : 'AI crafting authentic village description...');

    try {
      const res = await apiClient.post('/ai/describe-product', {
        name: currentName,
        category
      });

      if (res?.ok && res.data) {
        if (res.data.description?.en) setDescEn(res.data.description.en);
        if (res.data.description?.mr) setDescMr(res.data.description.mr);
        setAiMessage(isMr ? 'वर्णन तयार झाले!' : 'Descriptions generated!');
      }
    } catch (err) {
      alert(err.message || 'Failed to generate description');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const normalizedPrice = parseInt(normalizeDevanagariDigits(priceRs), 10) || 0;
    const normalizedStock = parseInt(normalizeDevanagariDigits(stock), 10) || 0;
    const normalizedQtyVal = parseFloat(normalizeDevanagariDigits(quantityValue)) || 1;

    if (!nameEn.trim() && !nameMr.trim()) {
      alert(isMr ? 'कृपया उत्पादनाचे नाव भरा.' : 'Please provide product name.');
      return;
    }

    if (normalizedPrice <= 0) {
      alert(isMr ? 'किंमत वैध असावी.' : 'Please enter a valid price.');
      return;
    }

    // Must satisfy minimum length >= 20 chars per schema
    const finalDescEn =
      descEn.trim().length >= 20
        ? descEn.trim()
        : `${nameEn || nameMr} - 100% authentic village sourced product made with traditional natural ingredients.`;
    const finalDescMr =
      descMr.trim().length >= 20
        ? descMr.trim()
        : `${nameMr || nameEn} - १००% अस्सल गावरान आणि पारंपरिक पद्धतीने तयार केलेले ताजे उत्पादन.`;

    const payload = {
      category,
      name: {
        en: nameEn.trim() || nameMr.trim(),
        mr: nameMr.trim() || nameEn.trim()
      },
      description: {
        en: finalDescEn,
        mr: finalDescMr
      },
      pricePaise: normalizedPrice * 100,
      quantityValue: normalizedQtyVal,
      quantityUnit: quantityUnit.trim() || 'piece',
      stock: normalizedStock,
      images: imageUrl ? [imageUrl] : ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80']
    };

    setSaving(true);
    try {
      if (isEditing) {
        await apiClient.put(`/seller/products/${id}`, payload);
      } else {
        await apiClient.post('/seller/products', payload);
      }
      navigate('/seller/products');
    } catch (err) {
      alert(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[800px] mx-auto px-4 py-12">
        <div className="h-8 w-48 bg-cream-2 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <Link
          to="/seller/products"
          className="inline-flex items-center gap-1 text-xs text-ink-2 hover:text-ink mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isMr ? 'उत्पादने सूचीकडे परत' : 'Back to Products'}</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink">
          {isEditing
            ? isMr
              ? 'उत्पादन संपादित करा'
              : 'Edit Product'
            : isMr
            ? 'नवीन उत्पादन जोडा'
            : 'Add New Product'}
        </h1>
        <p className="text-xs sm:text-sm text-ink-2 mt-1">
          {isMr
            ? 'फोटो काढून (Snap & Sell) किंवा आवाजात बोलून (Voice Listing) सेकंदात उत्पादन जोडा.'
            : 'Use Snap & Sell camera or speak in Marathi to auto-fill listing details instantly.'}
        </p>
      </div>

      {/* AI Assistance Buttons Banner (Feature F2) */}
      {!isEditing && (
        <div className="p-6 bg-gradient-to-r from-primary/20 via-amber-100/30 to-cream-2 border border-line rounded-card space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-clay" />
            <h2 className="text-sm sm:text-base font-bold text-ink">
              {isMr ? 'AI सह जलद उत्पादन नोंदणी' : 'AI Quick Listing Tools (Feature F2)'}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Snap & Sell */}
            <label className="h-11 px-5 rounded-full bg-surface border border-line hover:border-ink cursor-pointer font-semibold text-xs sm:text-sm text-ink flex items-center gap-2 transition-all shadow-sm">
              <Camera className="w-4 h-4 text-clay" />
              <span>{isMr ? 'फोटो अपलोड करा (Snap & Sell)' : 'Snap & Sell (Upload Photo)'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleSnapAndSell}
                className="hidden"
                disabled={aiLoading}
              />
            </label>

            {/* Voice Listing */}
            <button
              type="button"
              onClick={() => setShowVoiceBox(!showVoiceBox)}
              className="h-11 px-5 rounded-full bg-surface border border-line hover:border-ink font-semibold text-xs sm:text-sm text-ink flex items-center gap-2 transition-all shadow-sm"
            >
              <Mic className="w-4 h-4 text-emerald-700" />
              <span>{isMr ? 'आवाजाने सांगा (Voice Listing)' : 'Voice to Listing (Speak)'}</span>
            </button>
          </div>

          {/* Voice input drawer if opened */}
          {showVoiceBox && (
            <div className="p-4 bg-surface border border-line rounded-2xl space-y-3">
              <label className="text-xs font-bold text-ink block">
                {isMr
                  ? 'मराठी किंवा इंग्रजीत बोला / लिहा (उदा. "माझ्याकडे ५ किलो आंबा लोणचे आहे, किंमत २५० रुपये किलो"):'
                  : 'Speak or type what you are selling (e.g., "5 kg homemade raw mango pickle, 250 rupees per kg"): '}
              </label>
              <textarea
                value={voiceTranscript}
                onChange={(e) => setVoiceTranscript(e.target.value)}
                rows={2}
                placeholder={
                  isMr
                    ? 'उदा. ५ किलो अस्सल गावरान आंबा लोणचे, किंमत २५० रुपये...'
                    : 'e.g. 5 kg mango pickle, 250 rs per kg...'
                }
                className="w-full p-3 bg-cream-2 border border-line rounded-xl text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowVoiceBox(false);
                    setVoiceTranscript('');
                  }}
                >
                  {isMr ? 'रद्द' : 'Cancel'}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  loading={aiLoading}
                  onClick={handleVoiceListing}
                  disabled={!voiceTranscript.trim()}
                >
                  {isMr ? 'AI विश्लेषण करा' : 'Parse with Voice AI'}
                </Button>
              </div>
            </div>
          )}

          {aiMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{aiMessage}</span>
            </div>
          )}
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 bg-surface border border-line rounded-card space-y-6">
        {/* Category */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-ink-2 block mb-1">
            {isMr ? 'विभाग (Category)' : 'Category'} *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full h-11 px-3 bg-cream-2 border border-line rounded-xl text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-600 font-semibold"
          >
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {isMr ? c.mr : c.en}
              </option>
            ))}
          </select>
        </div>

        {/* Bilingual Product Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-ink-2 block mb-1">
              {isMr ? 'उत्पादनाचे नाव (मराठीत)' : 'Product Name (Marathi)'} *
            </label>
            <input
              type="text"
              value={nameMr}
              onChange={(e) => setNameMr(e.target.value)}
              placeholder="उदा. अस्सल गावरान आंबा लोणचे"
              className="w-full h-11 px-3 bg-cream-2 border border-line rounded-xl text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-600 font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-ink-2 block mb-1">
              {isMr ? 'उत्पादनाचे नाव (इंग्रजीत)' : 'Product Name (English)'} *
            </label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="e.g. Homemade Raw Mango Pickle"
              className="w-full h-11 px-3 bg-cream-2 border border-line rounded-xl text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-600 font-medium"
            />
          </div>
        </div>

        {/* Pricing, Unit, and Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Price */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-ink-2 block mb-1">
              {isMr ? 'किंमत (रुपये)' : 'Price (₹)'} *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-ink-2 font-bold text-sm">₹</span>
              <input
                type="text"
                value={priceRs}
                onChange={(e) => setPriceRs(e.target.value)}
                placeholder="250"
                className="w-full h-11 pl-8 pr-3 bg-cream-2 border border-line rounded-xl text-xs sm:text-sm text-ink font-bold focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
          </div>

          {/* Quantity value & unit */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-ink-2 block mb-1">
              {isMr ? 'प्रमाण व एकक' : 'Unit (e.g. 500 g)'} *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={quantityValue}
                onChange={(e) => setQuantityValue(e.target.value)}
                placeholder="500"
                className="w-1/2 h-11 px-3 bg-cream-2 border border-line rounded-xl text-xs sm:text-sm text-ink font-bold focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
              <select
                value={quantityUnit}
                onChange={(e) => setQuantityUnit(e.target.value)}
                className="w-1/2 h-11 px-2 bg-cream-2 border border-line rounded-xl text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-600 font-semibold"
              >
                <option value="g">g (ग्रॅम)</option>
                <option value="kg">kg (किलो)</option>
                <option value="ml">ml (मि.ली.)</option>
                <option value="L">L (लिटर)</option>
                <option value="piece">piece (नग)</option>
                <option value="pack">pack (पॅक)</option>
              </select>
            </div>
          </div>

          {/* Stock */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-ink-2 block mb-1">
              {isMr ? 'उपलब्ध स्टॉक' : 'Stock Quantity'} *
            </label>
            <input
              type="text"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="10"
              className="w-full h-11 px-3 bg-cream-2 border border-line rounded-xl text-xs sm:text-sm text-ink font-bold focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
        </div>

        {/* Image URL / Photo */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-ink-2 block mb-1">
            {isMr ? 'उत्पादन फोटो लिंक (URL)' : 'Product Image URL'}
          </label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
            className="w-full h-11 px-3 bg-cream-2 border border-line rounded-xl text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
        </div>

        {/* AI Describe Trigger */}
        <div className="flex items-center justify-between border-t border-line pt-4">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-2">
            {isMr ? 'उत्पादन वर्णन' : 'Product Description'}
          </span>
          <button
            type="button"
            disabled={aiLoading}
            onClick={handleAiDescribe}
            className="text-xs font-semibold text-clay hover:underline flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isMr ? 'AI वर्णन तयार करा' : 'Draft Description with AI'}</span>
          </button>
        </div>

        {/* Bilingual Description */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-ink-2 block mb-1">
              {isMr ? 'वर्णन (मराठी)' : 'Description (Marathi)'}
            </label>
            <textarea
              value={descMr}
              onChange={(e) => setDescMr(e.target.value)}
              rows={3}
              placeholder="पारंपरिक गावरान रेसिपी आणि नैसर्गिक घटकांचा वापर करून घरगुती पद्धतीने बनवलेले..."
              className="w-full p-3 bg-cream-2 border border-line rounded-xl text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-600 leading-relaxed"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-ink-2 block mb-1">
              {isMr ? 'वर्णन (इंग्रजी)' : 'Description (English)'}
            </label>
            <textarea
              value={descEn}
              onChange={(e) => setDescEn(e.target.value)}
              rows={3}
              placeholder="Authentic rural recipe handcrafted with natural farm-fresh ingredients..."
              className="w-full p-3 bg-cream-2 border border-line rounded-xl text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-600 leading-relaxed"
            />
          </div>
        </div>

        {/* Submit button */}
        <div className="pt-4 border-t border-line flex items-center justify-end gap-3">
          <Link
            to="/seller/products"
            className="px-5 py-2.5 rounded-full border border-line text-xs sm:text-sm font-semibold text-ink hover:bg-cream-2"
          >
            {isMr ? 'रद्द करा' : 'Cancel'}
          </Link>
          <Button type="submit" variant="primary" loading={saving}>
            <Save className="w-4 h-4 mr-1.5" />
            <span>{isMr ? 'उत्पादन जतन करा' : 'Save Product'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}

export default AddEditProductPage;
