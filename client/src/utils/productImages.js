// client/src/utils/productImages.js
// High-resolution photography library for rural marketplace products, categories, and artisans

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

export function getProductPhoto(product) {
  if (!product) return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';

  // If product already has an external HTTP image, use it
  const firstImage = product.images?.[0];
  if (firstImage && firstImage.startsWith('http')) {
    return firstImage;
  }

  const name = (typeof product.name === 'string'
    ? product.name
    : (product.name?.en || product.name?.mr || '')
  ).toLowerCase();

  const code = (product.code || '').toUpperCase();

  // Match by code or keywords
  if (code === 'P01' || name.includes('mango') || name.includes('kairi') || name.includes('लोणचे')) {
    return 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80';
  }
  if (code === 'P02' || name.includes('garlic') || name.includes('लसूण')) {
    return 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80';
  }
  if (code === 'P03' || name.includes('chili') || name.includes('mirchi') || name.includes('मिरची')) {
    return 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80';
  }
  if (code === 'P04' || name.includes('lemon') || name.includes('lime') || name.includes('लिंबू')) {
    return 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('honey') || name.includes('मध')) {
    return 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('pot') || name.includes('clay') || name.includes('माती') || name.includes('terracotta') || name.includes('भांडी')) {
    return 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('basket') || name.includes('bamboo') || name.includes('टोपली') || name.includes('बांबू')) {
    return 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('fabric') || name.includes('cotton') || name.includes('handloom') || name.includes('कापड') || name.includes('साडी')) {
    return 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('lamp') || name.includes('wood') || name.includes('दिवा') || name.includes('लाकडी')) {
    return 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('mat') || name.includes('carpet') || name.includes('चटई')) {
    return 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('herb') || name.includes('neem') || name.includes('कडुनिंब') || name.includes('औषधी')) {
    return 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('jaggery') || name.includes('gul') || name.includes('गूळ')) {
    return 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('ghee') || name.includes('तूप') || name.includes('butter')) {
    return 'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('ragi') || name.includes('jowar') || name.includes('bajra') || name.includes('flour') || name.includes('पीठ') || name.includes('नाचणी')) {
    return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('oil') || name.includes('तेल')) {
    return 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('masala') || name.includes('spice') || name.includes('मसाला')) {
    return 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80';
  }

  // Category fallback
  const catSlug = typeof product.category === 'object' ? product.category?.slug : product.category;
  if (catSlug && CATEGORY_IMAGES[catSlug]) {
    return CATEGORY_IMAGES[catSlug];
  }

  return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
}
