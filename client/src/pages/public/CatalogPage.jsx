// client/src/pages/public/CatalogPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import apiClient from '../../api/client';
import ProductCard from '../../components/ui/ProductCard';

const CATEGORIES = [
  { slug: '', en: 'All Categories', mr: 'सर्व विभाग' },
  { slug: 'pickles', en: 'Pickles', mr: 'लोणची' },
  { slug: 'masalas', en: 'Spices & Masalas', mr: 'मसाले' },
  { slug: 'sweets_snacks', en: 'Sweets & Snacks', mr: 'फराळ व मिठाई' },
  { slug: 'grains_flours', en: 'Grains & Flours', mr: 'धान्य व पिठे' },
  { slug: 'honey_preserves', en: 'Honey & Preserves', mr: 'मध व जॅम' },
  { slug: 'dairy_ghee', en: 'Village Ghee & Dairy', mr: 'साजुक तूप व दुग्धजन्य' },
  { slug: 'handicrafts', en: 'Handicrafts', mr: 'हस्तकला' },
  { slug: 'personal_care', en: 'Personal Care', mr: 'नैसर्गिक सौंदर्यप्रसाधने' }
];

export function CatalogPage() {
  const { t, i18n } = useTranslation();
  const isMr = i18n.language === 'mr';
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCategory = searchParams.get('category') || '';
  const initialQuery = searchParams.get('q') || '';
  const initialSort = searchParams.get('sort') || 'popular';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sort, setSort] = useState(initialSort);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory) params.set('category', selectedCategory);
        if (searchQuery.trim()) params.set('q', searchQuery.trim());
        if (sort) params.set('sort', sort);
        if (inStockOnly) params.set('inStock', 'true');
        params.set('limit', '40');

        const res = await apiClient.get(`/products?${params.toString()}`);
        if (mounted) {
          const list = res?.items || res?.data?.items || res?.data?.products || (Array.isArray(res) ? res : []);
          setProducts(list);
          setTotalCount(res?.meta?.total ?? list.length);
        }
      } catch (err) {
        if (mounted) setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchCatalog();
    return () => {
      mounted = false;
    };
  }, [selectedCategory, searchQuery, sort, inStockOnly]);

  const handleCategoryClick = (catSlug) => {
    const next = new URLSearchParams(searchParams);
    if (catSlug) {
      next.set('category', catSlug);
    } else {
      next.delete('category');
    }
    setSearchParams(next);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (searchQuery.trim()) {
      next.set('q', searchQuery.trim());
    } else {
      next.delete('q');
    }
    setSearchParams(next);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSort('popular');
    setInStockOnly(false);
    setSearchParams({});
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-8">
      {/* Search & Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink">
            {selectedCategory
              ? CATEGORIES.find((c) => c.slug === selectedCategory)?.[isMr ? 'mr' : 'en'] ||
                selectedCategory
              : isMr
              ? 'सर्व ग्रामीण उत्पादने'
              : 'All Village Products'}
          </h1>
          <p className="text-xs sm:text-sm text-ink-2 mt-1">
            {t('catalog.showingCount', 'Showing {{count}} authentic items', { count: totalCount })}
          </p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isMr ? 'उत्पादन किंवा घटक शोधा...' : 'Search product or ingredient...'}
            className="w-full h-11 pl-10 pr-10 bg-surface border border-line rounded-full text-sm text-ink placeholder:text-ink-2 focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
          <Search className="w-4 h-4 text-ink-2 absolute left-3.5 top-3.5 pointer-events-none" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                const next = new URLSearchParams(searchParams);
                next.delete('q');
                setSearchParams(next);
              }}
              className="absolute right-3 top-3 text-ink-2 hover:text-ink"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>

      {/* Category Pills & Filters Bar */}
      <div className="space-y-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => handleCategoryClick(cat.slug)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold shrink-0 transition-all ${
                  isSelected
                    ? 'bg-clay text-cream shadow-sm'
                    : 'bg-surface border border-line text-ink hover:bg-cream-2'
                }`}
              >
                {isMr ? cat.mr : cat.en}
              </button>
            );
          })}
        </div>

        {/* Sorting & Stock Toggle Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-line text-xs sm:text-sm">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none text-ink font-medium">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded border-line text-clay focus:ring-primary-600"
              />
              <span>{isMr ? 'फक्त उपलब्ध (स्टॉकमध्ये)' : 'In Stock only'}</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-ink-2 font-medium">{isMr ? 'क्रमवारी:' : 'Sort by:'}</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-9 px-3 bg-surface border border-line rounded-lg text-ink text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-600"
            >
              <option value="popular">{isMr ? 'लोकप्रिय' : 'Most Popular'}</option>
              <option value="price_asc">{isMr ? 'किंमत: कमी ते जास्त' : 'Price: Low to High'}</option>
              <option value="price_desc">{isMr ? 'किंमत: जास्त ते कमी' : 'Price: High to Low'}</option>
              <option value="rating">{isMr ? 'रेटिंग' : 'Highest Rated'}</option>
              <option value="newest">{isMr ? 'नवीन' : 'Newest'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="h-72 bg-cream-2 rounded-card animate-pulse" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((prod) => (
            <ProductCard key={prod._id || prod.id} product={prod} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-surface border border-line rounded-card space-y-4">
          <p className="text-base text-ink font-semibold">
            {isMr ? 'कोणतीही उत्पादने सापडली नाहीत.' : 'No products found matching your filters.'}
          </p>
          <button
            type="button"
            onClick={handleClearFilters}
            className="px-5 py-2.5 rounded-full bg-primary text-ink text-sm font-semibold hover:bg-primary-600"
          >
            {isMr ? 'सर्व फिल्टर्स काढा' : 'Clear all filters'}
          </button>
        </div>
      )}
    </div>
  );
}

export default CatalogPage;
