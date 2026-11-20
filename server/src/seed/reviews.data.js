// server/src/seed/reviews.data.js
export const reviewTemplates = {
  positive: [
    {
      code: 'P-taste-1',
      en: 'Tastes just like homemade. We finished it in a week.',
      mr: 'अगदी घरच्यासारखी चव. आठवड्यात संपले.',
      themes: ['taste'],
      sentiment: 'positive'
    },
    {
      code: 'P-taste-2',
      en: 'Great flavour, my family loved it.',
      mr: 'उत्कृष्ट चव, घरातल्या सर्वांना आवडले.',
      themes: ['taste'],
      sentiment: 'positive'
    },
    {
      code: 'P-taste-3',
      en: 'Authentic village taste, will order again.',
      mr: 'खरी गावाकडची चव, पुन्हा मागवणार.',
      themes: ['taste'],
      sentiment: 'positive'
    },
    {
      code: 'P-quality-1',
      en: 'Very good quality for the price.',
      mr: 'किमतीच्या मानाने दर्जा खूप चांगला.',
      themes: ['quality', 'price'],
      sentiment: 'positive'
    },
    {
      code: 'P-quality-2',
      en: 'You can feel it is handmade with care.',
      mr: 'हे काळजीपूर्वक हाताने बनवले आहे हे जाणवते.',
      themes: ['quality'],
      sentiment: 'positive'
    },
    {
      code: 'P-fresh-1',
      en: 'Fresh and clean, nothing artificial.',
      mr: 'ताजे आणि स्वच्छ, काहीही कृत्रिम नाही.',
      themes: ['freshness'],
      sentiment: 'positive'
    },
    {
      code: 'P-pack-1',
      en: 'Packed very well, nothing spilled.',
      mr: 'खूप व्यवस्थित पॅक केले होते, काहीही सांडले नाही.',
      themes: ['packaging'],
      sentiment: 'positive'
    },
    {
      code: 'P-deliv-1',
      en: 'Delivered on time and the delivery person was polite.',
      mr: 'वेळेवर पोहोचले आणि डिलिव्हरी करणारे विनम्र होते.',
      themes: ['delivery'],
      sentiment: 'positive'
    },
    {
      code: 'P-serv-1',
      en: 'Seller answered my question quickly.',
      mr: 'विक्रेत्याने माझ्या प्रश्नाला लगेच उत्तर दिले.',
      themes: ['service'],
      sentiment: 'positive'
    },
    {
      code: 'P-price-1',
      en: 'Good value, fair price for a handmade product.',
      mr: 'हस्तनिर्मित वस्तूसाठी योग्य किंमत, पैसे वसूल.',
      themes: ['price'],
      sentiment: 'positive'
    }
  ],
  neutral: [
    {
      code: 'N-deliv-1',
      en: 'Good product but delivery took longer than expected.',
      mr: 'वस्तू चांगली आहे पण डिलिव्हरीला अपेक्षेपेक्षा जास्त वेळ लागला.',
      themes: ['delivery'],
      sentiment: 'neutral'
    },
    {
      code: 'N-pack-1',
      en: 'Nice, but the packaging could be stronger.',
      mr: 'छान आहे, पण पॅकिंग अजून मजबूत हवे होते.',
      themes: ['packaging'],
      sentiment: 'neutral'
    },
    {
      code: 'N-qty-1',
      en: 'Taste is good, a little less quantity than I expected.',
      mr: 'चव चांगली आहे, पण प्रमाण अपेक्षेपेक्षा थोडे कमी वाटले.',
      themes: ['quantity', 'taste'],
      sentiment: 'neutral'
    }
  ],
  negative: [
    {
      code: 'X-pack-1',
      en: 'The packet arrived slightly damaged and some leaked.',
      mr: 'पाकीट थोडे फुटलेले आले आणि थोडे गळले होते.',
      themes: ['packaging'],
      sentiment: 'negative'
    },
    {
      code: 'X-deliv-1',
      en: 'Delivery was late by almost a day.',
      mr: 'डिलिव्हरी जवळपास एक दिवस उशिरा झाली.',
      themes: ['delivery'],
      sentiment: 'negative'
    },
    {
      code: 'X-salt-1',
      en: 'Too salty for our taste.',
      mr: 'आमच्या चवीला खूप खारट वाटले.',
      themes: ['taste'],
      sentiment: 'negative'
    },
    {
      code: 'X-qty-1',
      en: 'Quantity was less than what was shown.',
      mr: 'दाखवलेल्या प्रमाणापेक्षा कमी मिळाले.',
      themes: ['quantity'],
      sentiment: 'negative'
    },
    {
      code: 'X-fin-1',
      en: 'Finishing could be better.',
      mr: 'फिनिशिंग अजून चांगले हवे होते.',
      themes: ['quality'],
      sentiment: 'negative'
    }
  ]
};

export default reviewTemplates;
