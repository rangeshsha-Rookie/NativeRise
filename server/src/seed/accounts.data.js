// server/src/seed/accounts.data.js
export const demoCustomers = [
  {
    email: 'rohan.customer@demo.nativerise.test',
    name: { en: 'Rohan Patil', mr: 'रोहन पाटील' },
    phone: '9000000001',
    preferredLang: 'en',
    addresses: [
      {
        label: 'Home',
        line: 'Shop 4, Shanti Nagar, Mira Road East',
        landmark: 'Near Railway Station',
        lat: 19.2813,
        lng: 72.8686,
        isDefault: true
      },
      {
        label: 'Office',
        line: 'Sector 5, Beverly Park, Mira Road East',
        landmark: 'Opposite Complex',
        lat: 19.289,
        lng: 72.871,
        isDefault: false
      }
    ]
  },
  {
    email: 'priya.customer@demo.nativerise.test',
    name: { en: 'Priya Deshmukh', mr: 'प्रिया देशमुख' },
    phone: '9000000002',
    preferredLang: 'en',
    addresses: [
      {
        label: 'Home',
        line: 'Flat 302, Sai Sagar, Vasai West',
        landmark: 'Behind Bus Depot',
        lat: 19.3644,
        lng: 72.8124,
        isDefault: true
      }
    ]
  },
  {
    email: 'amit.customer@demo.nativerise.test',
    name: { en: 'Amit Sharma', mr: 'अमित शर्मा' },
    phone: '9000000003',
    preferredLang: 'en',
    addresses: [
      {
        label: 'Home',
        line: 'Row House 12, Central Park, Nalasopara East',
        landmark: 'Near Municipal Ground',
        lat: 19.4167,
        lng: 72.825,
        isDefault: true
      }
    ]
  },
  {
    email: 'sneha.customer@demo.nativerise.test',
    name: { en: 'Sneha Kulkarni', mr: 'स्नेहा कुलकर्णी' },
    phone: '9000000004',
    preferredLang: 'en',
    addresses: [
      {
        label: 'Home',
        line: 'B-10, Yashwant Nagar, Virar West',
        landmark: 'Near Arnala Beach Road',
        lat: 19.4564,
        lng: 72.8028,
        isDefault: true
      }
    ]
  },
  {
    email: 'imran.customer@demo.nativerise.test',
    name: { en: 'Imran Sheikh', mr: 'इम्रान शेख' },
    phone: '9000000005',
    preferredLang: 'en',
    addresses: [
      {
        label: 'Home',
        line: 'Flat 101, Noor Manzil, Bhayander West',
        landmark: 'Near Old Police Station',
        lat: 19.3015,
        lng: 72.8482,
        isDefault: true
      }
    ]
  }
];

export const demoPartners = [
  {
    email: 'sanjay.partner@demo.nativerise.test',
    name: { en: 'Sanjay Jadhav', mr: 'संजय जाधव' },
    phone: '9000000006',
    vehicleType: 'BIKE',
    vehicleNumber: 'MH04AB1234',
    baseLocation: { lat: 19.2813, lng: 72.8686, line: 'Mira Road Station' },
    serviceRadiusKm: 30
  },
  {
    email: 'vikas.partner@demo.nativerise.test',
    name: { en: 'Vikas Rane', mr: 'विकास राणे' },
    phone: '9000000007',
    vehicleType: 'BIKE',
    vehicleNumber: 'MH04CD5678',
    baseLocation: { lat: 19.3644, lng: 72.8124, line: 'Vasai West Depot' },
    serviceRadiusKm: 30
  },
  {
    email: 'ajay.partner@demo.nativerise.test',
    name: { en: 'Ajay Pawar', mr: 'अजय पवार' },
    phone: '9000000008',
    vehicleType: 'BIKE',
    vehicleNumber: 'MH04EF9012',
    baseLocation: { lat: 19.4564, lng: 72.8028, line: 'Virar West Terminal' },
    serviceRadiusKm: 30
  }
];

export const demoSellers = [
  {
    sellerIndex: 1,
    email: 'sunita.seller@demo.nativerise.test',
    name: { en: 'Sunita Gawande', mr: 'सुनीता गावंडे' },
    phone: '9000000011',
    category: 'pickles-preserves',
    shopName: { en: "Sunita's Home Pickles", mr: 'सुनीताचे घरगुती लोणचे' },
    village: { en: 'Chinchoti', mr: 'चिंचोटी' },
    district: 'Palghar',
    state: 'Maharashtra',
    pincode: '401208',
    location: { lat: 19.3512, lng: 72.8845, line: 'Main Road, Chinchoti' },
    deliveryMode: 'INCLUDED',
    maxDeliveryKm: 40,
    minOrderPaise: 15000,
    prepTimeMins: 90,
    story: {
      en: "I started making pickles in my kitchen twenty years ago from my mother's recipes. Every jar is made by hand with sun-dried spices and no preservatives.",
      mr: 'वीस वर्षांपूर्वी मी आईच्या पाककृतींवरून स्वयंपाकघरात लोणची बनवायला सुरुवात केली. प्रत्येक बरणी हाताने, उन्हात वाळवलेल्या मसाल्यांनी आणि प्रिझर्वेटिव्हशिवाय तयार केली जाते.'
    }
  },
  {
    sellerIndex: 2,
    email: 'meena.seller@demo.nativerise.test',
    name: { en: 'Meena Bhoir', mr: 'मीना भोईर' },
    phone: '9000000012',
    category: 'spices-masalas',
    shopName: { en: 'Bhoir Masale', mr: 'भोईर मसाले' },
    village: { en: 'Kaman', mr: 'कामन' },
    district: 'Palghar',
    state: 'Maharashtra',
    pincode: '401208',
    location: { lat: 19.3364, lng: 72.9348, line: 'Kaman Village Market' },
    deliveryMode: 'INCLUDED',
    maxDeliveryKm: 40,
    minOrderPaise: 15000,
    prepTimeMins: 60,
    story: {
      en: 'Our family grinds masalas on a stone mill the way my grandmother did. We buy chillies and turmeric directly from farmers and grind in small batches.',
      mr: 'आमचे कुटुंब आजीप्रमाणेच दगडी जात्यावर मसाले दळते. मिरच्या आणि हळद आम्ही थेट शेतकऱ्यांकडून घेतो आणि थोड्या थोड्या प्रमाणात दळतो.'
    }
  },
  {
    sellerIndex: 3,
    email: 'ramesh.seller@demo.nativerise.test',
    name: { en: 'Ramesh Patil', mr: 'रमेश पाटील' },
    phone: '9000000013',
    category: 'millets-grains',
    shopName: { en: 'Patil Natural Farm', mr: 'पाटील नैसर्गिक शेती' },
    village: { en: 'Padgha', mr: 'पडघा' },
    district: 'Thane',
    state: 'Maharashtra',
    pincode: '421101',
    location: { lat: 19.3486, lng: 73.1497, line: 'Patil Farm, Padgha' },
    deliveryMode: 'INCLUDED',
    maxDeliveryKm: 45,
    minOrderPaise: 20000,
    prepTimeMins: 120,
    story: {
      en: 'We grow ragi, jowar and bajra on our family land without chemical fertiliser. We mill the flour fresh so it keeps its taste and nutrition.',
      mr: 'आमच्या कुटुंबाच्या जमिनीत आम्ही रासायनिक खतांशिवाय नाचणी, ज्वारी आणि बाजरी पिकवतो. पीठ ताजे दळतो, त्यामुळे चव आणि पोषण टिकते.'
    }
  },
  {
    sellerIndex: 4,
    email: 'lata.seller@demo.nativerise.test',
    name: { en: 'Lata Shinde', mr: 'लता शिंदे' },
    phone: '9000000014',
    category: 'handloom-textiles',
    shopName: { en: 'Lata Handloom', mr: 'लता हातमाग' },
    village: { en: 'Titwala', mr: 'टिटवाळा' },
    district: 'Thane',
    state: 'Maharashtra',
    pincode: '421605',
    location: { lat: 19.3006, lng: 73.2081, line: 'Station Road, Titwala' },
    deliveryMode: 'INCLUDED',
    maxDeliveryKm: 45,
    minOrderPaise: 30000,
    prepTimeMins: 240,
    story: {
      en: 'Five women in our village weave cotton cloth on wooden handlooms. Each saree or towel takes days of careful work and supports our families.',
      mr: 'आमच्या गावातील पाच महिला लाकडी हातमागावर सुती कापड विणतात. प्रत्येक साडी किंवा टॉवेल तयार व्हायला अनेक दिवसांचे काळजीपूर्वक काम लागते आणि त्यातून आमच्या कुटुंबांना आधार मिळतो.'
    }
  },
  {
    sellerIndex: 5,
    email: 'prakash.seller@demo.nativerise.test',
    name: { en: 'Prakash Kumbhar', mr: 'प्रकाश कुंभार' },
    phone: '9000000015',
    category: 'pottery-terracotta',
    shopName: { en: 'Kumbhar Mati Kala', mr: 'कुंभार माती कला' },
    village: { en: 'Agashi', mr: 'आगाशी' },
    district: 'Palghar',
    state: 'Maharashtra',
    pincode: '401301',
    location: { lat: 19.482, lng: 72.775, line: 'Kumbhar Ali, Agashi' },
    deliveryMode: 'INCLUDED',
    maxDeliveryKm: 35,
    minOrderPaise: 25000,
    prepTimeMins: 180,
    story: {
      en: 'My family has shaped clay for four generations. We use local red clay and fire every pot in a traditional kiln.',
      mr: 'माझ्या कुटुंबात चार पिढ्यांपासून मातीकाम चालते. आम्ही स्थानिक लाल माती वापरतो आणि प्रत्येक भांडे पारंपरिक भट्टीत भाजतो.'
    }
  },
  {
    sellerIndex: 6,
    email: 'gopal.seller@demo.nativerise.test',
    name: { en: 'Gopal Wagh', mr: 'गोपाळ वाघ' },
    phone: '9000000016',
    category: 'bamboo-cane-craft',
    shopName: { en: 'Wagh Bamboo Works', mr: 'वाघ बांबू हस्तकला' },
    village: { en: 'Vajreshwari', mr: 'वज्रेश्वरी' },
    district: 'Thane',
    state: 'Maharashtra',
    pincode: '401206',
    location: { lat: 19.4895, lng: 73.0234, line: 'Mandir Road, Vajreshwari' },
    deliveryMode: 'CUSTOMER_PAYS',
    maxDeliveryKm: 60,
    minOrderPaise: 20000,
    prepTimeMins: 300,
    story: {
      en: 'We cut bamboo from our own grove and weave baskets, trays and lamps by hand. Every piece is strong, light and made to last for years.',
      mr: 'आम्ही स्वतःच्या बांबूच्या बनातून बांबू तोडतो आणि टोपल्या, ट्रे व दिवे हाताने विणतो. प्रत्येक वस्तू मजबूत, हलकी आणि वर्षानुवर्षे टिकणारी असते.'
    }
  },
  {
    sellerIndex: 7,
    email: 'savita.seller@demo.nativerise.test',
    name: { en: 'Savita More', mr: 'सविता मोरे' },
    phone: '9000000017',
    category: 'jaggery-sweets',
    shopName: { en: 'More Gul Udyog', mr: 'मोरे गूळ उद्योग' },
    village: { en: 'Manor', mr: 'मनोर' },
    district: 'Palghar',
    state: 'Maharashtra',
    pincode: '401403',
    location: { lat: 19.7423, lng: 72.9126, line: 'NH48 Junction, Manor' },
    deliveryMode: 'INCLUDED',
    maxDeliveryKm: 35,
    minOrderPaise: 25000,
    prepTimeMins: 120,
    story: {
      en: 'We press sugarcane and boil jaggery in open pans without chemicals. Our laddus and chikki are made with the same pure jaggery.',
      mr: 'आम्ही ऊस गाळतो आणि रसायनांशिवाय उघड्या कढईत गूळ तयार करतो. आमचे लाडू आणि चिक्की याच शुद्ध गुळापासून बनवली जाते.'
    }
  },
  {
    sellerIndex: 8,
    email: 'dilip.seller@demo.nativerise.test',
    name: { en: 'Dilip Raut', mr: 'दिलीप राऊत' },
    phone: '9000000018',
    category: 'honey-oils',
    shopName: { en: 'Raut Ghani Oils & Honey', mr: 'राऊत घाणा तेल आणि मध' },
    village: { en: 'Kelva', mr: 'केळवे' },
    district: 'Palghar',
    state: 'Maharashtra',
    pincode: '401401',
    location: { lat: 19.6192, lng: 72.7303, line: 'Beach Road, Kelva' },
    deliveryMode: 'CUSTOMER_PAYS',
    maxDeliveryKm: 60,
    minOrderPaise: 30000,
    prepTimeMins: 180,
    story: {
      en: 'We press oils slowly in a wooden ghani so nothing is burnt or refined. The honey comes from wild hives collected by families in our village.',
      mr: 'आम्ही लाकडी घाण्यात तेल हळूहळू काढतो, त्यामुळे ते जळत नाही आणि रिफाइन्ड होत नाही. मध आमच्या गावातील कुटुंबे जंगलातील पोळ्यांमधून गोळा करतात.'
    }
  }
];
