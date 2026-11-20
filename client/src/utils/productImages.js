// client/src/utils/productImages.js
// High-resolution curated photography library for rural marketplace products, categories, and artisans

export const CATEGORY_IMAGES = {
  pickles: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80',
  masalas: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=80',
  sweets_snacks: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80',
  grains_flours: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80',
  honey_preserves: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&auto=format&fit=crop&q=80',
  dairy_ghee: 'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?w=500&auto=format&fit=crop&q=80',
  handicrafts: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=500&auto=format&fit=crop&q=80',
  personal_care: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop&q=80'
};

export const ARTISAN_PORTRAITS = {
  sunita: {
    name: 'Sunita Gawande',
    nameMr: 'सुनीता गावंडे',
    role: 'Traditional Pickles Master',
    roleMr: 'घरगुती लोणचे उत्पादक',
    location: 'Chinchoti, Palghar',
    locationMr: 'चिंचोटी, पालघर',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    quote: 'Handcrafted sun-dried pickles using my grandmother\'s 60-year secret spice recipe.',
    quoteMr: 'आजीच्या ६० वर्षे जुन्या पारंपारिक पद्धतीने उन्हात वाळवून बनवलेले गावरान लोणचे.'
  },
  ramesh: {
    name: 'Ramesh Bhoir',
    nameMr: 'रमेश भोईर',
    role: 'Agri-Spices Artisan',
    roleMr: 'मसाले उत्पादक',
    location: 'Kaman, Palghar',
    locationMr: 'कामन, पालघर',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    quote: 'Pounding whole dry chilies and whole spices on stone grinders for pure authentic aroma.',
    quoteMr: 'दगडी पाटा-वरवंट्यावर आणि खलबत्त्यात कुटलेले अस्सल चवीचे अस्सल मसाले.'
  },
  datta: {
    name: 'Dattatray Patil',
    nameMr: 'दत्तात्रय पाटील',
    role: 'Organic Grain Cultivator',
    roleMr: 'सेंद्रिय धान्य शेतकरी',
    location: 'Padgha, Thane',
    locationMr: 'पडघा, ठाणे',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    quote: 'Native indigenous millets grown with compost, zero synthetic chemicals or preservatives.',
    quoteMr: 'देशी वाणांची नाचणी व ज्वारी, कोणत्याही रासायनिक खतांशिवाय थेट शेतातून.'
  },
  lata: {
    name: 'Lata Tai',
    nameMr: 'लता ताई',
    role: 'Handloom & Weaving Mentor',
    roleMr: 'हातमाग कारागीर',
    location: 'Titwala, Thane',
    locationMr: 'टिटवाळा, ठाणे',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    quote: 'Empowering 25 village women weavers to keep Maharashtra\'s handloom legacy thriving.',
    quoteMr: '२५ ग्रामीण महिलांना हातमाग विणकामातून आत्मनिर्भर बनवणारा उपक्रम.'
  }
};

// Exact photorealistic Unsplash photography mapped by Catalog Code (P01 - P40)
export const CATALOG_CODE_PHOTOS = {
  // Pickles & Preserves (S1)
  P01: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80', // Raw Mango Pickle
  P02: 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=600&auto=format&fit=crop&q=80', // Lemon Pickle
  P03: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80', // Mixed Veg Pickle
  P04: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80', // Garlic Pickle
  P05: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&auto=format&fit=crop&q=80', // Amla Murabba

  // Spices & Masalas (S2)
  P06: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80', // Goda Masala
  P07: 'https://images.unsplash.com/photo-1505253758473-96b3015f240a?w=600&auto=format&fit=crop&q=80', // Misal Masala
  P08: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop&q=80', // Lavangi Red Chilli Powder
  P09: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80', // Turmeric Powder
  P10: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600&auto=format&fit=crop&q=80', // Kala Masala

  // Millets & Grains (S3)
  P11: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80', // Ragi Flour
  P12: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80', // Jowar Flour
  P13: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80', // Bajra Flour
  P14: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80', // Indrayani Rice
  P15: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80', // Toor Dal

  // Handloom & Textiles (S4)
  P16: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80', // Cotton Handloom Saree
  P17: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&auto=format&fit=crop&q=80', // Handwoven Towel Set
  P18: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600&auto=format&fit=crop&q=80', // Cotton Dupatta
  P19: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=600&auto=format&fit=crop&q=80', // Woven Floor Mat Satranji
  P20: 'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?w=600&auto=format&fit=crop&q=80', // Table Runner

  // Pottery & Terracotta (S5)
  P21: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&auto=format&fit=crop&q=80', // Clay Water Pot Matka
  P22: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&auto=format&fit=crop&q=80', // Clay Cooking Handi
  P23: 'https://images.unsplash.com/photo-1603555501671-8f96b3fce8e4?w=600&auto=format&fit=crop&q=80', // Terracotta Diya Set
  P24: 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=600&auto=format&fit=crop&q=80', // Clay Tea Cup Kulhad
  P25: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&auto=format&fit=crop&q=80', // Terracotta Planter

  // Bamboo & Cane Crafts (S6)
  P26: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=600&auto=format&fit=crop&q=80', // Bamboo Basket
  P27: 'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?w=600&auto=format&fit=crop&q=80', // Cane Storage Basket
  P28: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80', // Bamboo Serving Tray
  P29: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80', // Bamboo Lamp Shade
  P30: 'https://images.unsplash.com/photo-1585336261026-7789392211bb?w=600&auto=format&fit=crop&q=80', // Bamboo Pen Stand

  // Jaggery & Sweets (S7)
  P31: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80', // Organic Jaggery Block
  P32: 'https://images.unsplash.com/photo-1627993077395-e2f9c890f5b9?w=600&auto=format&fit=crop&q=80', // Jaggery Powder
  P33: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?w=600&auto=format&fit=crop&q=80', // Til Gul Laddu
  P34: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=600&auto=format&fit=crop&q=80', // Peanut Chikki
  P35: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=600&auto=format&fit=crop&q=80', // Rava Laddu

  // Honey & Cold-pressed Oils (S8)
  P36: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80', // Forest Honey
  P37: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80', // Groundnut Oil
  P38: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&auto=format&fit=crop&q=80', // Sesame Oil
  P39: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=600&auto=format&fit=crop&q=80', // Coconut Oil
  P40: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80'  // Mustard Oil
};

/**
 * Returns accurate high-res photorealistic image based on product code or name
 */
export function getProductPhoto(product) {
  if (!product) {
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
  }

  // 1. Check if first image is an active external HTTP(S) URL (e.g. Cloudinary or Unsplash)
  const firstImage = product.images?.[0];
  if (firstImage && firstImage.startsWith('http')) {
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
    return 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80';
  }

  // Ghee / Dairy / तूप
  if (name.includes('ghee') || name.includes('तूप') || name.includes('dairy') || name.includes('दुग्ध')) {
    return 'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?w=600&auto=format&fit=crop&q=80';
  }

  // Pickles / लोणचे
  if (name.includes('mango') || name.includes('kairi') || name.includes('कैरी')) {
    return 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('garlic') || name.includes('लसूण') || name.includes('lasun')) {
    return 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('lemon') || name.includes('lime') || name.includes('लिंबू')) {
    return 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('amla') || name.includes('awla') || name.includes('आवळा') || name.includes('murabba') || name.includes('मुरांबा')) {
    return 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('pickle') || name.includes('लोणचे')) {
    return 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80';
  }

  // Spices & Masalas / मसाले
  if (name.includes('turmeric') || name.includes('halad') || name.includes('हळद')) {
    return 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('chilli') || name.includes('chili') || name.includes('mirchi') || name.includes('मिरची') || name.includes('तिखट')) {
    return 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('misal') || name.includes('मिसळ')) {
    return 'https://images.unsplash.com/photo-1505253758473-96b3015f240a?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('masala') || name.includes('मसाला')) {
    return 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80';
  }

  // Flours & Grains / धान्य व पिठे
  if (name.includes('ragi') || name.includes('nachni') || name.includes('नाचणी')) {
    return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('jowar') || name.includes('jwari') || name.includes('ज्वारी')) {
    return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('bajra') || name.includes('bajri') || name.includes('बाजरी')) {
    return 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('rice') || name.includes('tandul') || name.includes('तांदूळ') || name.includes('indrayani')) {
    return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('dal') || name.includes('डाळ') || name.includes('pulse')) {
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('flour') || name.includes('पीठ') || name.includes('grain') || name.includes('धान्य')) {
    return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80';
  }

  // Pottery / मातीची भांडी
  if (name.includes('matka') || name.includes('माठ')) {
    return 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('handi') || name.includes('हंडी')) {
    return 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('diya') || name.includes('panati') || name.includes('पणती') || name.includes('पणत्या')) {
    return 'https://images.unsplash.com/photo-1603555501671-8f96b3fce8e4?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('kulhad') || name.includes('कुल्हड') || name.includes('cup') || name.includes('कप')) {
    return 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('planter') || name.includes('कुंडी') || name.includes('pot') || name.includes('clay') || name.includes('माती')) {
    return 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&auto=format&fit=crop&q=80';
  }

  // Bamboo / बांबू व वेत
  if (name.includes('lamp') || name.includes('shade') || name.includes('दिवा') || name.includes('कंदील')) {
    return 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('tray') || name.includes('ट्रे')) {
    return 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('pen') || name.includes('stand') || name.includes('स्टँड')) {
    return 'https://images.unsplash.com/photo-1585336261026-7789392211bb?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('basket') || name.includes('bamboo') || name.includes('cane') || name.includes('टोपली') || name.includes('करंडी') || name.includes('बांबू') || name.includes('वेत')) {
    return 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=600&auto=format&fit=crop&q=80';
  }

  // Textiles / हातमाग व साडी
  if (name.includes('saree') || name.includes('साडी')) {
    return 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('towel') || name.includes('gamcha') || name.includes('टॉवेल')) {
    return 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('dupatta') || name.includes('दुपट्टा') || name.includes('chunni')) {
    return 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('mat') || name.includes('satranji') || name.includes('chatai') || name.includes('सतरंजी')) {
    return 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('runner') || name.includes('रनर') || name.includes('cloth') || name.includes('cotton') || name.includes('handloom') || name.includes('कापड')) {
    return 'https://images.unsplash.com/photo-1544457070-4cd773b4d71e?w=600&auto=format&fit=crop&q=80';
  }

  // Jaggery & Sweets / गूळ व मिठाई
  if (name.includes('chikki') || name.includes('चिक्की')) {
    return 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('laddu') || name.includes('ladoo') || name.includes('लाडू') || name.includes('tilgul') || name.includes('तिळगूळ')) {
    return 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('powder') && (name.includes('jaggery') || name.includes('gul') || name.includes('गुळ'))) {
    return 'https://images.unsplash.com/photo-1627993077395-e2f9c890f5b9?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('jaggery') || name.includes('gul') || name.includes('गूळ')) {
    return 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80';
  }

  // Wood-pressed Oils / लाकडी घाण्याचे तेल
  if (name.includes('oil') || name.includes('तेल')) {
    if (name.includes('groundnut') || name.includes('shengdana') || name.includes('शेंगदाणा')) {
      return 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80';
    }
    if (name.includes('sesame') || name.includes('til') || name.includes('तीळ')) {
      return 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&auto=format&fit=crop&q=80';
    }
    if (name.includes('coconut') || name.includes('khobrel') || name.includes('खोबरेल')) {
      return 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=600&auto=format&fit=crop&q=80';
    }
    if (name.includes('mustard') || name.includes('mohari') || name.includes('मोहरी')) {
      return 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80';
    }
    return 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80';
  }

  // Fallback to Category image if available
  const catSlug = typeof product.category === 'string' ? product.category : product.category?.slug;
  if (catSlug && CATEGORY_IMAGES[catSlug]) {
    return CATEGORY_IMAGES[catSlug];
  }

  return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
}
