// client/src/utils/productImages.js
// High-resolution curated photography library for rural marketplace products, categories, and artisans

export const CATEGORY_IMAGES = {
  farming: '/mockup-assets/cat-farming.png',
  handicrafts: '/mockup-assets/cat-handicrafts.png',
  textiles: '/mockup-assets/cat-textiles.png',
  food_honey: '/mockup-assets/cat-food-honey.png',
  home_decor: '/mockup-assets/cat-home-decor.png',
  jewellery: '/mockup-assets/cat-jewellery.png',
  eco_friendly: '/mockup-assets/cat-eco-friendly.png',
  organic_produce: '/mockup-assets/cat-organic-produce.png',

  // Fallbacks for standard category slugs
  pickles: '/mockup-assets/prod-homemade-pickle.png',
  masalas: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=80',
  sweets_snacks: '/mockup-assets/prod-village-honey.png',
  grains_flours: '/mockup-assets/cat-farming.png',
  honey_preserves: '/mockup-assets/prod-village-honey.png',
  dairy_ghee: 'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?w=500&auto=format&fit=crop&q=80',
  personal_care: '/mockup-assets/prod-ayurvedic-herbs.png'
};

export const ARTISAN_PORTRAITS = {
  sunita: {
    name: 'Sunita Devi',
    nameMr: 'सुनीता देवी',
    role: 'Traditional Crafts & Pickles',
    roleMr: 'हस्तकला व पारंपरिक लोणचे',
    location: 'Rajasthan / Chinchoti',
    locationMr: 'राजस्थान / चिंचोटी',
    image: '/mockup-assets/artisan-sunita-devi.png',
    quote: 'Handmade crafts for a better tomorrow.',
    quoteMr: 'हस्तनिर्मित कलेतून समृद्ध व आत्मनिर्भर उद्याची निर्मिती.'
  },
  ramesh: {
    name: 'Ramesh Kumar',
    nameMr: 'रमेश कुमार',
    role: 'Traditional Handloom Master',
    roleMr: 'पारंपरिक हातमाग विणकर',
    location: 'Uttar Pradesh / Kaman',
    locationMr: 'उत्तर प्रदेश / कामन',
    image: '/mockup-assets/artisan-ramesh-kumar.png',
    quote: 'Bringing traditional handloom to the world.',
    quoteMr: 'पारंपरिक हातमागाची कला आणि शुद्ध वस्त्रे जगभरात पोहोचवणे.'
  },
  meena: {
    name: 'Meena Sharma',
    nameMr: 'मीना शर्मा',
    role: 'Organic Cultivator',
    roleMr: 'सेंद्रिय शेतकरी',
    location: 'Madhya Pradesh / Padgha',
    locationMr: 'मध्य प्रदेश / पडघा',
    image: '/mockup-assets/artisan-meena-sharma.png',
    quote: 'Organic goodness from our farm.',
    quoteMr: 'आमच्या शेतातील थेट शुद्ध, सेंद्रिय आणि गावरान धान्य.'
  },
  suresh: {
    name: 'Suresh Patel',
    nameMr: 'सुरेश पटेल',
    role: 'Pure Honey & Natural Care',
    roleMr: 'नैसर्गिक मध व तेल उत्पादक',
    location: 'Gujarat / Titwala',
    locationMr: 'गुजरात / टिटवाळा',
    image: '/mockup-assets/artisan-suresh-patel.png',
    quote: 'Pure honey, natural care.',
    quoteMr: 'शुद्ध जंगलातील मध आणि नैसर्गिक आरोग्य काळजी.'
  }
};

// Exact photorealistic Mockup and Unsplash photography mapped by Catalog Code (P01 - P40)
export const CATALOG_CODE_PHOTOS = {
  // Pickles & Preserves (S1)
  P01: '/mockup-assets/prod-homemade-pickle.png', // Raw Mango Pickle
  P02: '/mockup-assets/prod-homemade-pickle.png', // Lemon Pickle
  P03: '/mockup-assets/prod-homemade-pickle.png', // Mixed Veg Pickle
  P04: '/mockup-assets/prod-homemade-pickle.png', // Garlic Pickle
  P05: '/mockup-assets/prod-ayurvedic-herbs.png',  // Amla Murabba

  // Spices & Masalas (S2)
  P06: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80', // Goda Masala
  P07: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80', // Misal Masala
  P08: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop&q=80', // Lavangi Red Chilli Powder
  P09: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80', // Turmeric Powder
  P10: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80', // Kala Masala

  // Millets & Grains (S3)
  P11: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80', // Ragi Flour
  P12: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80', // Jowar Flour
  P13: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80', // Bajra Flour
  P14: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80', // Indrayani Rice
  P15: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80', // Toor Dal

  // Handloom & Textiles (S4)
  P16: '/mockup-assets/prod-cotton-fabric.png', // Cotton Handloom Saree
  P17: '/mockup-assets/prod-cotton-fabric.png', // Handwoven Towel Set
  P18: '/mockup-assets/prod-cotton-fabric.png', // Cotton Dupatta
  P19: '/mockup-assets/prod-eco-mat.png',       // Woven Floor Mat Satranji
  P20: '/mockup-assets/prod-cotton-fabric.png', // Table Runner

  // Pottery & Terracotta (S5)
  P21: '/mockup-assets/prod-terracotta-pot.png', // Clay Water Pot Matka
  P22: '/mockup-assets/prod-terracotta-pot.png', // Clay Cooking Handi
  P23: '/mockup-assets/prod-terracotta-pot.png', // Terracotta Diya Set
  P24: '/mockup-assets/prod-terracotta-pot.png', // Clay Tea Cup Kulhad
  P25: '/mockup-assets/prod-terracotta-pot.png', // Terracotta Planter

  // Bamboo & Cane Crafts (S6)
  P26: '/mockup-assets/prod-bamboo-basket.png', // Bamboo Basket
  P27: '/mockup-assets/prod-bamboo-basket.png', // Cane Storage Basket
  P28: '/mockup-assets/prod-bamboo-basket.png', // Bamboo Serving Tray
  P29: '/mockup-assets/prod-wooden-lamp.png',   // Bamboo Lamp Shade
  P30: '/mockup-assets/prod-wooden-lamp.png',   // Bamboo Pen Stand

  // Jaggery & Sweets (S7)
  P31: '/mockup-assets/prod-village-honey.png', // Organic Jaggery Block
  P32: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80', // Jaggery Powder
  P33: '/mockup-assets/prod-village-honey.png', // Til Gul Laddu
  P34: '/mockup-assets/prod-village-honey.png', // Peanut Chikki
  P35: '/mockup-assets/prod-village-honey.png', // Rava Laddu

  // Honey & Cold-pressed Oils (S8)
  P36: '/mockup-assets/prod-village-honey.png',  // Forest Honey
  P37: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80', // Groundnut Oil
  P38: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80', // Sesame Oil
  P39: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=600&auto=format&fit=crop&q=80', // Coconut Oil
  P40: '/mockup-assets/prod-ayurvedic-herbs.png'  // Ayurvedic Herbs
};

/**
 * Returns accurate high-res photorealistic image based on product code or name
 */
export function getProductPhoto(product) {
  if (!product) {
    return '/mockup-assets/prod-village-honey.png';
  }

  // 1. Check if first image is an active external HTTP(S) URL or mockup-asset
  const firstImage = product.images?.[0];
  if (firstImage && (firstImage.startsWith('http') || firstImage.startsWith('/mockup-assets/'))) {
    return firstImage;
  }

  // 2. Check catalog code (P01 - P40)
  const code = (product.code || '').toUpperCase();
  if (code && CATALOG_CODE_PHOTOS[code]) {
    return CATALOG_CODE_PHOTOS[code];
  }

  // Also check if images[0] is like '/seed-images/P01.svg'
  if (firstImage && firstImage.includes('/seed-images/P')) {
    const match = firstImage.match(/P\d{2}/i);
    if (match && CATALOG_CODE_PHOTOS[match[0].toUpperCase()]) {
      return CATALOG_CODE_PHOTOS[match[0].toUpperCase()];
    }
  }

  // 3. Name & Keyword based matching (English & Marathi)
  const nameEn = (typeof product.name === 'string' ? product.name : (product.name?.en || '')).toLowerCase();
  const nameMr = (typeof product.name === 'string' ? '' : (product.name?.mr || '')).toLowerCase();
  const name = `${nameEn} ${nameMr}`;

  // Honey / मध
  if (name.includes('honey') || name.includes('मध')) {
    return '/mockup-assets/prod-village-honey.png';
  }

  // Basket / बांबू / Bamboo
  if (name.includes('bamboo') || name.includes('cane') || name.includes('basket') || name.includes('टोपली')) {
    return '/mockup-assets/prod-bamboo-basket.png';
  }

  // Pot / Matka / माती / Clay
  if (name.includes('pot') || name.includes('matka') || name.includes('माती') || name.includes('handi') || name.includes('clay')) {
    return '/mockup-assets/prod-terracotta-pot.png';
  }

  // Lamp / दिवा / कंदील
  if (name.includes('lamp') || name.includes('कंदील') || name.includes('lantern')) {
    return '/mockup-assets/prod-wooden-lamp.png';
  }

  // Mat / Satranji / चटई
  if (name.includes('mat') || name.includes('chatai') || name.includes('चटई') || name.includes('satranji')) {
    return '/mockup-assets/prod-eco-mat.png';
  }

  // Handloom / Fabric / Saree / कापड
  if (name.includes('saree') || name.includes('fabric') || name.includes('handloom') || name.includes('कापड') || name.includes('साडी')) {
    return '/mockup-assets/prod-cotton-fabric.png';
  }

  // Herbs / Ayurvedic / आयुर्वेदिक
  if (name.includes('herb') || name.includes('ayurvedic') || name.includes('आयुर्वेदिक') || name.includes('औषधी')) {
    return '/mockup-assets/prod-ayurvedic-herbs.png';
  }

  // Pickles / लोणचे
  if (name.includes('mango') || name.includes('kairi') || name.includes('कैरी') || name.includes('garlic') || name.includes('लसूण') || name.includes('pickle') || name.includes('लोणचे')) {
    return '/mockup-assets/prod-homemade-pickle.png';
  }

  // Jaggery / गूळ
  if (name.includes('jaggery') || name.includes('gul') || name.includes('गुल') || name.includes('गूळ')) {
    return '/mockup-assets/prod-village-honey.png';
  }

  // Masalas / Spices / मसाले
  if (name.includes('masala') || name.includes('मसाला') || name.includes('chilli') || name.includes('मिर्ची') || name.includes('हळद') || name.includes('turmeric')) {
    return 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80';
  }

  // Default clean village product photo
  return '/mockup-assets/prod-village-honey.png';
}

export default {
  CATEGORY_IMAGES,
  ARTISAN_PORTRAITS,
  CATALOG_CODE_PHOTOS,
  getProductPhoto
};
