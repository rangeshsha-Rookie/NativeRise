// server/src/seed/products.data.js
export const productsData = [
  // S1 pickles-preserves
  {
    code: 'P01',
    sellerIndex: 1,
    category: 'pickles-preserves',
    name: { en: 'Raw Mango Pickle', mr: 'कैरीचे लोणचे' },
    description: {
      en: 'Tangy raw mango pieces in sesame oil with hand-ground spices.',
      mr: 'तिळाच्या तेलात, हाताने वाटलेल्या मसाल्यांसह मुरवलेल्या आंबटतिखट कैरीच्या फोडी.'
    },
    pricePaise: 18000,
    quantityValue: 500,
    quantityUnit: 'g',
    stock: 40,
    images: ['/seed-images/P01.svg'],
    searchKeywords: ['mango', 'pickle', 'lonche', 'raw mango', 'kairi', 'कैरी', 'लोणचे']
  },
  {
    code: 'P02',
    sellerIndex: 1,
    category: 'pickles-preserves',
    name: { en: 'Lemon Pickle', mr: 'लिंबाचे लोणचे' },
    description: {
      en: 'Sun-cured lemons aged for three weeks with rock salt and mild spice.',
      mr: 'खडेमीठ आणि सौम्य मसाल्यासह तीन आठवडे उन्हात मुरवलेले लिंबाचे लोणचे.'
    },
    pricePaise: 15000,
    quantityValue: 400,
    quantityUnit: 'g',
    stock: 35,
    images: ['/seed-images/P02.svg'],
    searchKeywords: ['lemon', 'pickle', 'limbu', 'लोणचे', 'लिंबू']
  },
  {
    code: 'P03',
    sellerIndex: 1,
    category: 'pickles-preserves',
    name: { en: 'Mixed Vegetable Pickle', mr: 'मिश्र भाज्यांचे लोणचे' },
    description: {
      en: 'Carrot, cauliflower and turnip in a mustard-oil masala, crunchy and tangy.',
      mr: 'गाजर, फ्लॉवर आणि सलगम मोहरीच्या तेलातील मसाल्यात, कुरकुरीत आणि आंबटतिखट.'
    },
    pricePaise: 17000,
    quantityValue: 500,
    quantityUnit: 'g',
    stock: 30,
    images: ['/seed-images/P03.svg'],
    searchKeywords: ['mix vegetable', 'veg pickle', 'gajar', 'लोणचे', 'भाज्यांचे लोणचे']
  },
  {
    code: 'P04',
    sellerIndex: 1,
    category: 'pickles-preserves',
    name: { en: 'Garlic Pickle', mr: 'लसणाचे लोणचे' },
    description: {
      en: 'Whole garlic cloves in a spicy red masala, strong flavour, great with bhakri.',
      mr: 'तिखट लाल मसाल्यातील लसणाच्या पाकळ्या, तीव्र चव, भाकरीसोबत उत्तम.'
    },
    pricePaise: 19000,
    quantityValue: 300,
    quantityUnit: 'g',
    stock: 25,
    images: ['/seed-images/P04.svg'],
    searchKeywords: ['garlic', 'lasun', 'spicy', 'लसूण', 'लोणचे']
  },
  {
    code: 'P05',
    sellerIndex: 1,
    category: 'pickles-preserves',
    name: { en: 'Amla Murabba', mr: 'आवळ्याचा मुरांबा' },
    description: {
      en: 'Gooseberries slow-cooked in sugar syrup with cardamom, rich in vitamin C.',
      mr: 'वेलचीसह साखरेच्या पाकात हळूहळू शिजवलेला आवळा, क जीवनसत्त्वाने समृद्ध.'
    },
    pricePaise: 22000,
    quantityValue: 500,
    quantityUnit: 'g',
    stock: 20,
    images: ['/seed-images/P05.svg'],
    searchKeywords: ['amla', 'murabba', 'awla', 'आवळा', 'मुरांबा']
  },

  // S2 spices-masalas
  {
    code: 'P06',
    sellerIndex: 2,
    category: 'spices-masalas',
    name: { en: 'Goda Masala', mr: 'गोडा मसाला' },
    description: {
      en: 'Traditional Maharashtrian goda masala with coconut and stone flower, for dals and vegetables.',
      mr: 'खोबरे आणि दगडफूल घातलेला पारंपरिक महाराष्ट्रीयन गोडा मसाला, आमटी व भाज्यांसाठी.'
    },
    pricePaise: 16000,
    quantityValue: 250,
    quantityUnit: 'g',
    stock: 50,
    images: ['/seed-images/P06.svg'],
    searchKeywords: ['goda masala', 'kala masala', 'spices', 'मसाला', 'गोडा मसाला']
  },
  {
    code: 'P07',
    sellerIndex: 2,
    category: 'spices-masalas',
    name: { en: 'Misal Masala', mr: 'मिसळ मसाला' },
    description: {
      en: 'Fiery masala for misal and usal, ground fresh in small batches.',
      mr: 'मिसळ आणि उसळीसाठी झणझणीत मसाला, थोड्या प्रमाणात ताजा दळलेला.'
    },
    pricePaise: 14000,
    quantityValue: 200,
    quantityUnit: 'g',
    stock: 45,
    images: ['/seed-images/P07.svg'],
    searchKeywords: ['misal masala', 'usal', 'spicy', 'मिसळ', 'मसाला']
  },
  {
    code: 'P08',
    sellerIndex: 2,
    category: 'spices-masalas',
    name: { en: 'Lavangi Red Chilli Powder', mr: 'लवंगी लाल मिरची पूड' },
    description: {
      en: 'Hot, bright red Lavangi chilli powder from farm-dried chillies.',
      mr: 'शेतात वाळवलेल्या मिरच्यांची तिखट, गडद लाल लवंगी मिरची पूड.'
    },
    pricePaise: 13000,
    quantityValue: 250,
    quantityUnit: 'g',
    stock: 60,
    images: ['/seed-images/P08.svg'],
    searchKeywords: ['chilli', 'mirchi', 'lavangi', 'मिरची', 'लाल तिखट']
  },
  {
    code: 'P09',
    sellerIndex: 2,
    category: 'spices-masalas',
    name: { en: 'Turmeric Powder', mr: 'हळद पावडर' },
    description: {
      en: 'Deep yellow turmeric powder, stone-ground from farm-boiled fingers.',
      mr: 'शेतात उकळलेल्या हळकुंडांपासून दगडी जात्यावर दळलेली गडद पिवळी हळद.'
    },
    pricePaise: 12000,
    quantityValue: 250,
    quantityUnit: 'g',
    stock: 55,
    images: ['/seed-images/P09.svg'],
    searchKeywords: ['turmeric', 'halad', 'organic', 'हळद', 'हळद पावडर']
  },
  {
    code: 'P10',
    sellerIndex: 2,
    category: 'spices-masalas',
    name: { en: 'Kala Masala', mr: 'काळा मसाला' },
    description: {
      en: 'Dark, smoky masala for bharli vangi and rassa, roasted before grinding.',
      mr: 'भरली वांगी आणि रस्स्यासाठी भाजून दळलेला गडद, खमंग काळा मसाला.'
    },
    pricePaise: 17000,
    quantityValue: 250,
    quantityUnit: 'g',
    stock: 40,
    images: ['/seed-images/P10.svg'],
    searchKeywords: ['kala masala', 'rassa', 'vangi', 'काळा मसाला']
  },

  // S3 millets-grains
  {
    code: 'P11',
    sellerIndex: 3,
    category: 'millets-grains',
    name: { en: 'Ragi Flour', mr: 'नाचणीचे पीठ' },
    description: {
      en: 'Fresh stone-milled ragi flour for bhakri, ambil and porridge.',
      mr: 'भाकरी, आंबिल आणि लापशीसाठी ताजे दळलेले नाचणीचे पीठ.'
    },
    pricePaise: 9000,
    quantityValue: 500,
    quantityUnit: 'g',
    stock: 70,
    images: ['/seed-images/P11.svg'],
    searchKeywords: ['ragi', 'nachni', 'flour', 'नाचणी', 'पीठ']
  },
  {
    code: 'P12',
    sellerIndex: 3,
    category: 'millets-grains',
    name: { en: 'Jowar Flour', mr: 'ज्वारीचे पीठ' },
    description: {
      en: 'Soft jowar flour for bhakri that stays fluffy, milled from local grain.',
      mr: 'स्थानिक धान्यापासून दळलेले, मऊ भाकरीसाठी ज्वारीचे पीठ.'
    },
    pricePaise: 7000,
    quantityValue: 1,
    quantityUnit: 'kg',
    stock: 80,
    images: ['/seed-images/P12.svg'],
    searchKeywords: ['jowar', 'jwari', 'bhakri', 'ज्वारी', 'पीठ']
  },
  {
    code: 'P13',
    sellerIndex: 3,
    category: 'millets-grains',
    name: { en: 'Bajra Flour', mr: 'बाजरीचे पीठ' },
    description: {
      en: 'Warm, earthy bajra flour, ideal for winter bhakri.',
      mr: 'हिवाळ्यातील भाकरीसाठी उत्तम, खमंग बाजरीचे पीठ.'
    },
    pricePaise: 6500,
    quantityValue: 1,
    quantityUnit: 'kg',
    stock: 75,
    images: ['/seed-images/P13.svg'],
    searchKeywords: ['bajra', 'bajri', 'flour', 'बाजरी', 'पीठ']
  },
  {
    code: 'P14',
    sellerIndex: 3,
    category: 'millets-grains',
    name: { en: 'Indrayani Rice', mr: 'इंद्रायणी तांदूळ' },
    description: {
      en: 'Fragrant, soft Indrayani rice grown in our fields.',
      mr: 'आमच्या शेतात पिकवलेला सुगंधी, मऊ इंद्रायणी तांदूळ.'
    },
    pricePaise: 11000,
    quantityValue: 1,
    quantityUnit: 'kg',
    stock: 90,
    images: ['/seed-images/P14.svg'],
    searchKeywords: ['rice', 'indrayani', 'tandul', 'इंद्रायणी', 'तांदूळ']
  },
  {
    code: 'P15',
    sellerIndex: 3,
    category: 'millets-grains',
    name: { en: 'Toor Dal', mr: 'तूर डाळ' },
    description: {
      en: 'Hand-cleaned, unpolished toor dal that cooks soft and tastes sweet.',
      mr: 'हाताने निवडलेली, पॉलिश न केलेली तूर डाळ, छान शिजते आणि गोडसर लागते.'
    },
    pricePaise: 16000,
    quantityValue: 1,
    quantityUnit: 'kg',
    stock: 60,
    images: ['/seed-images/P15.svg'],
    searchKeywords: ['dal', 'toor dal', 'unpolished', 'तूर डाळ', 'डाळ']
  },

  // S4 handloom-textiles
  {
    code: 'P16',
    sellerIndex: 4,
    category: 'handloom-textiles',
    name: { en: 'Cotton Handloom Saree', mr: 'हातमागाची सुती साडी' },
    description: {
      en: 'Soft cotton handloom saree with a simple woven border, 5.5 metres.',
      mr: 'साध्या विणलेल्या काठासह मऊ सुती हातमागाची साडी, ५.५ मीटर.'
    },
    pricePaise: 145000,
    quantityValue: 1,
    quantityUnit: 'piece',
    stock: 12,
    images: ['/seed-images/P16.svg'],
    searchKeywords: ['saree', 'cotton saree', 'handloom', 'साडी', 'सुती साडी']
  },
  {
    code: 'P17',
    sellerIndex: 4,
    category: 'handloom-textiles',
    name: { en: 'Handwoven Towel Set', mr: 'हातविणीचे टॉवेल संच' },
    description: {
      en: 'Set of three absorbent handwoven cotton towels.',
      mr: 'तीन शोषक हातविणीच्या सुती टॉवेलचा संच.'
    },
    pricePaise: 42000,
    quantityValue: 1,
    quantityUnit: 'set',
    stock: 25,
    images: ['/seed-images/P17.svg'],
    searchKeywords: ['towel', 'cotton towel', 'gamcha', 'टॉवेल', 'कापड']
  },
  {
    code: 'P18',
    sellerIndex: 4,
    category: 'handloom-textiles',
    name: { en: 'Cotton Dupatta', mr: 'सुती दुपट्टा' },
    description: {
      en: 'Lightweight cotton dupatta woven on a wooden handloom.',
      mr: 'लाकडी हातमागावर विणलेला हलका सुती दुपट्टा.'
    },
    pricePaise: 52000,
    quantityValue: 1,
    quantityUnit: 'piece',
    stock: 20,
    images: ['/seed-images/P18.svg'],
    searchKeywords: ['dupatta', 'chunni', 'cotton', 'दुपट्टा']
  },
  {
    code: 'P19',
    sellerIndex: 4,
    category: 'handloom-textiles',
    name: { en: 'Woven Floor Mat (Satranji)', mr: 'सतरंजी' },
    description: {
      en: 'Hand-woven cotton floor mat in striped colours, 4 x 6 feet.',
      mr: 'पट्टेदार रंगांतील हाताने विणलेली सुती सतरंजी, ४ x ६ फूट.'
    },
    pricePaise: 65000,
    quantityValue: 1,
    quantityUnit: 'piece',
    stock: 15,
    images: ['/seed-images/P19.svg'],
    searchKeywords: ['mat', 'satranji', 'chatai', 'सतरंजी', 'जाजमी']
  },
  {
    code: 'P20',
    sellerIndex: 4,
    category: 'handloom-textiles',
    name: { en: 'Table Runner', mr: 'टेबल रनर' },
    description: {
      en: 'Handloom cotton table runner with a traditional pattern.',
      mr: 'पारंपरिक नक्षीचा हातमागाचा सुती टेबल रनर.'
    },
    pricePaise: 38000,
    quantityValue: 1,
    quantityUnit: 'piece',
    stock: 22,
    images: ['/seed-images/P20.svg'],
    searchKeywords: ['runner', 'table runner', 'decor', 'टेबल रनर']
  },

  // S5 pottery-terracotta
  {
    code: 'P21',
    sellerIndex: 5,
    category: 'pottery-terracotta',
    name: { en: 'Clay Water Pot (Matka)', mr: 'मातीचा माठ' },
    description: {
      en: 'Hand-thrown clay water pot that keeps water naturally cool, 10 litres.',
      mr: 'पाणी नैसर्गिकरीत्या थंड ठेवणारा हाताने घडवलेला मातीचा माठ, १० लिटर.'
    },
    pricePaise: 38000,
    quantityValue: 1,
    quantityUnit: 'piece',
    stock: 20,
    images: ['/seed-images/P21.svg'],
    searchKeywords: ['matka', 'pot', 'clay pot', 'माठ', 'मातीचा माठ']
  },
  {
    code: 'P22',
    sellerIndex: 5,
    category: 'pottery-terracotta',
    name: { en: 'Clay Cooking Pot (Handi)', mr: 'मातीची हंडी' },
    description: {
      en: 'Clay cooking pot with lid for slow-cooked dals and curries.',
      mr: 'आमटी आणि कालवणासाठी झाकणासह मातीची हंडी.'
    },
    pricePaise: 32000,
    quantityValue: 1,
    quantityUnit: 'piece',
    stock: 18,
    images: ['/seed-images/P22.svg'],
    searchKeywords: ['handi', 'clay handi', 'cooking pot', 'हंडी', 'मातीची हंडी']
  },
  {
    code: 'P23',
    sellerIndex: 5,
    category: 'pottery-terracotta',
    name: { en: 'Terracotta Diya Set', mr: 'मातीच्या पणत्यांचा संच' },
    description: {
      en: 'Set of 12 hand-painted terracotta diyas for festivals.',
      mr: 'सणांसाठी १२ हाताने रंगवलेल्या मातीच्या पणत्यांचा संच.'
    },
    pricePaise: 15000,
    quantityValue: 1,
    quantityUnit: 'set',
    stock: 60,
    images: ['/seed-images/P23.svg'],
    searchKeywords: ['diya', 'panati', 'terracotta', 'पणती', 'पणत्या']
  },
  {
    code: 'P24',
    sellerIndex: 5,
    category: 'pottery-terracotta',
    name: { en: 'Clay Tea Cup Set (Kulhad)', mr: 'मातीच्या कुल्हड कपांचा संच' },
    description: {
      en: 'Set of 6 unglazed clay tea cups that give chai an earthy aroma.',
      mr: 'चहाला मातीचा सुगंध देणारे, चकाकी न दिलेले ६ मातीच्या कपांचे संच.'
    },
    pricePaise: 24000,
    quantityValue: 1,
    quantityUnit: 'set',
    stock: 35,
    images: ['/seed-images/P24.svg'],
    searchKeywords: ['kulhad', 'tea cup', 'clay cup', 'कुल्हड', 'कप']
  },
  {
    code: 'P25',
    sellerIndex: 5,
    category: 'pottery-terracotta',
    name: { en: 'Terracotta Planter', mr: 'मातीची कुंडी' },
    description: {
      en: 'Sturdy terracotta planter with a drainage hole, 8 inch.',
      mr: 'निचऱ्यासाठी छिद्र असलेली मजबूत मातीची कुंडी, ८ इंच.'
    },
    pricePaise: 26000,
    quantityValue: 1,
    quantityUnit: 'piece',
    stock: 28,
    images: ['/seed-images/P25.svg'],
    searchKeywords: ['planter', 'pot', 'garden', 'कुंडी', 'मातीची कुंडी']
  },

  // S6 bamboo-cane-craft
  {
    code: 'P26',
    sellerIndex: 6,
    category: 'bamboo-cane-craft',
    name: { en: 'Bamboo Basket', mr: 'बांबूची टोपली' },
    description: {
      en: 'Handwoven bamboo basket for fruit, flowers or storage.',
      mr: 'फळे, फुले किंवा साठवणुकीसाठी हाताने विणलेली बांबूची टोपली.'
    },
    pricePaise: 35000,
    quantityValue: 1,
    quantityUnit: 'piece',
    stock: 20,
    images: ['/seed-images/P26.svg'],
    searchKeywords: ['basket', 'bamboo basket', 'topli', 'टोपली', 'बांबू']
  },
  {
    code: 'P27',
    sellerIndex: 6,
    category: 'bamboo-cane-craft',
    name: { en: 'Cane Storage Basket with Lid', mr: 'झाकणाची वेताची करंडी' },
    description: {
      en: 'Cane storage basket with lid for clothes and household items.',
      mr: 'कपडे आणि घरगुती वस्तूंसाठी झाकणासह वेताची करंडी.'
    },
    pricePaise: 52000,
    quantityValue: 1,
    quantityUnit: 'piece',
    stock: 14,
    images: ['/seed-images/P27.svg'],
    searchKeywords: ['cane basket', 'karandi', 'storage', 'करंडी', 'वेताची करंडी']
  },
  {
    code: 'P28',
    sellerIndex: 6,
    category: 'bamboo-cane-craft',
    name: { en: 'Bamboo Serving Tray', mr: 'बांबूचा ट्रे' },
    description: {
      en: 'Light bamboo tray with raised edges for serving snacks.',
      mr: 'नाश्ता वाढण्यासाठी कडा असलेला हलका बांबूचा ट्रे.'
    },
    pricePaise: 28000,
    quantityValue: 1,
    quantityUnit: 'piece',
    stock: 24,
    images: ['/seed-images/P28.svg'],
    searchKeywords: ['tray', 'bamboo tray', 'serving', 'ट्रे', 'बांबू']
  },
  {
    code: 'P29',
    sellerIndex: 6,
    category: 'bamboo-cane-craft',
    name: { en: 'Bamboo Lamp Shade', mr: 'बांबूचा दिव्याचा शेड' },
    description: {
      en: 'Woven bamboo lamp shade that gives a warm, patterned glow.',
      mr: 'उबदार, नक्षीदार प्रकाश देणारा विणलेला बांबूचा दिव्याचा शेड.'
    },
    pricePaise: 64000,
    quantityValue: 1,
    quantityUnit: 'piece',
    stock: 10,
    images: ['/seed-images/P29.svg'],
    searchKeywords: ['lamp', 'shade', 'decor', 'दिवा', 'बांबूचा दिवा']
  },
  {
    code: 'P30',
    sellerIndex: 6,
    category: 'bamboo-cane-craft',
    name: { en: 'Bamboo Pen Stand', mr: 'बांबूचे पेन स्टँड' },
    description: {
      en: 'Neat bamboo pen and desk organiser, polished by hand.',
      mr: 'हाताने घासलेले, नीटनेटके बांबूचे पेन व डेस्क स्टँड.'
    },
    pricePaise: 16000,
    quantityValue: 1,
    quantityUnit: 'piece',
    stock: 40,
    images: ['/seed-images/P30.svg'],
    searchKeywords: ['pen stand', 'desk', 'organizer', 'पेन स्टँड']
  },

  // S7 jaggery-sweets
  {
    code: 'P31',
    sellerIndex: 7,
    category: 'jaggery-sweets',
    name: { en: 'Organic Jaggery Block', mr: 'सेंद्रिय गूळ' },
    description: {
      en: 'Chemical-free sugarcane jaggery block, golden brown and soft.',
      mr: 'रसायनमुक्त, सोनेरी-तपकिरी आणि मऊ ऊसाच्या गुळाची ढेप.'
    },
    pricePaise: 9000,
    quantityValue: 500,
    quantityUnit: 'g',
    stock: 80,
    images: ['/seed-images/P31.svg'],
    searchKeywords: ['jaggery', 'gul', 'organic', 'गूळ', 'सेंद्रिय गूळ']
  },
  {
    code: 'P32',
    sellerIndex: 7,
    category: 'jaggery-sweets',
    name: { en: 'Jaggery Powder', mr: 'गुळाची पावडर' },
    description: {
      en: 'Fine jaggery powder that dissolves easily in tea and sweets.',
      mr: 'चहा आणि गोड पदार्थांत सहज विरघळणारी बारीक गुळाची पावडर.'
    },
    pricePaise: 11000,
    quantityValue: 500,
    quantityUnit: 'g',
    stock: 60,
    images: ['/seed-images/P32.svg'],
    searchKeywords: ['jaggery powder', 'gul powder', 'sugar substitute', 'गुळाची पावडर']
  },
  {
    code: 'P33',
    sellerIndex: 7,
    category: 'jaggery-sweets',
    name: { en: 'Til Gul Laddu', mr: 'तिळगुळाचे लाडू' },
    description: {
      en: 'Sesame and jaggery laddus, soft and rich, made fresh.',
      mr: 'ताजे बनवलेले मऊ आणि पौष्टिक तिळगुळाचे लाडू.'
    },
    pricePaise: 20000,
    quantityValue: 250,
    quantityUnit: 'g',
    stock: 40,
    images: ['/seed-images/P33.svg'],
    searchKeywords: ['til gul', 'laddu', 'tilgul', 'तिळगूळ', 'लाडू']
  },
  {
    code: 'P34',
    sellerIndex: 7,
    category: 'jaggery-sweets',
    name: { en: 'Peanut Chikki', mr: 'शेंगदाणा चिक्की' },
    description: {
      en: 'Crunchy peanut chikki set in pure jaggery.',
      mr: 'शुद्ध गुळात बनवलेली कुरकुरीत शेंगदाणा चिक्की.'
    },
    pricePaise: 14000,
    quantityValue: 250,
    quantityUnit: 'g',
    stock: 50,
    images: ['/seed-images/P34.svg'],
    searchKeywords: ['chikki', 'peanut chikki', 'shengdana', 'चिक्की', 'शेंगदाणा']
  },
  {
    code: 'P35',
    sellerIndex: 7,
    category: 'jaggery-sweets',
    name: { en: 'Rava Laddu', mr: 'रव्याचे लाडू' },
    description: {
      en: 'Rava and coconut laddus with ghee and cardamom.',
      mr: 'तूप आणि वेलची घातलेले रवा-खोबऱ्याचे लाडू.'
    },
    pricePaise: 22000,
    quantityValue: 300,
    quantityUnit: 'g',
    stock: 30,
    images: ['/seed-images/P35.svg'],
    searchKeywords: ['rava laddu', 'sweet', 'mithai', 'लाडू', 'रवा लाडू']
  },

  // S8 honey-oils
  {
    code: 'P36',
    sellerIndex: 8,
    category: 'honey-oils',
    name: { en: 'Forest Honey', mr: 'जंगली मध' },
    description: {
      en: 'Raw, unheated honey collected from wild hives, thick and aromatic.',
      mr: 'जंगलातील पोळ्यांतून गोळा केलेला, न तापवलेला घट्ट आणि सुगंधी मध.'
    },
    pricePaise: 42000,
    quantityValue: 500,
    quantityUnit: 'g',
    stock: 25,
    images: ['/seed-images/P36.svg'],
    searchKeywords: ['honey', 'wild honey', 'madh', 'मध', 'जंगली मध']
  },
  {
    code: 'P37',
    sellerIndex: 8,
    category: 'honey-oils',
    name: { en: 'Groundnut Oil (Wood-pressed)', mr: 'घाण्याचे शेंगदाणा तेल' },
    description: {
      en: 'Wood-pressed groundnut oil with a nutty aroma.',
      mr: 'खमंग सुगंधाचे लाकडी घाण्यावर काढलेले शेंगदाणा तेल.'
    },
    pricePaise: 36000,
    quantityValue: 1,
    quantityUnit: 'l',
    stock: 30,
    images: ['/seed-images/P37.svg'],
    searchKeywords: ['groundnut oil', 'wood pressed', 'ghana tel', 'शेंगदाणा तेल', 'तेल']
  },
  {
    code: 'P38',
    sellerIndex: 8,
    category: 'honey-oils',
    name: { en: 'Sesame Oil (Wood-pressed)', mr: 'घाण्याचे तीळ तेल' },
    description: {
      en: 'Wood-pressed sesame oil for cooking and oil massage.',
      mr: 'स्वयंपाक आणि मालिशसाठी लाकडी घाण्यावर काढलेले तीळ तेल.'
    },
    pricePaise: 52000,
    quantityValue: 1,
    quantityUnit: 'l',
    stock: 22,
    images: ['/seed-images/P38.svg'],
    searchKeywords: ['sesame oil', 'til tel', 'wood pressed', 'तीळ तेल', 'तेल']
  },
  {
    code: 'P39',
    sellerIndex: 8,
    category: 'honey-oils',
    name: { en: 'Coconut Oil (Wood-pressed)', mr: 'घाण्याचे खोबरेल तेल' },
    description: {
      en: 'Pure wood-pressed coconut oil for cooking and hair care.',
      mr: 'स्वयंपाक आणि केसांसाठी शुद्ध, लाकडी घाण्यावर काढलेले खोबरेल तेल.'
    },
    pricePaise: 48000,
    quantityValue: 1,
    quantityUnit: 'l',
    stock: 28,
    images: ['/seed-images/P39.svg'],
    searchKeywords: ['coconut oil', 'khobrel tel', 'hair oil', 'खोबरेल तेल', 'तेल']
  },
  {
    code: 'P40',
    sellerIndex: 8,
    category: 'honey-oils',
    name: { en: 'Mustard Oil (Wood-pressed)', mr: 'घाण्याचे मोहरीचे तेल' },
    description: {
      en: 'Strong, pungent wood-pressed mustard oil for pickles and frying.',
      mr: 'लोणची आणि तळण्यासाठी तीव्र, झणझणीत लाकडी घाण्यावर काढलेले मोहरीचे तेल.'
    },
    pricePaise: 40000,
    quantityValue: 1,
    quantityUnit: 'l',
    stock: 26,
    images: ['/seed-images/P40.svg'],
    searchKeywords: ['mustard oil', 'mohari tel', 'kachi ghani', 'मोहरीचे तेल', 'तेल']
  }
];

export default productsData;
