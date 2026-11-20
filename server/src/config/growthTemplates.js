// server/src/config/growthTemplates.js
// Fallback growth templates and practical rural tips

export const STATIC_TIPS = {
  en: [
    'Bundle related items together (like pickle with papad) to increase average order value.',
    'Mention local origin and traditional village preparation methods in your description to boost trust.',
    'Keep stock updated before weekends when regional orders peak by 25%.',
    'Double-check packaging seal for liquids and oily items to prevent delivery leakage complaints.',
    'Offer seasonal specials (e.g. raw mango during summer, amla in winter) to attract returning buyers.'
  ],
  mr: [
    'सरासरी ऑर्डर मूल्य वाढवण्यासाठी संबंधित वस्तूंचे कॉम्बो बनवा (उदा. लोणचे आणि पापड).',
    'ग्राहकांचा विश्वास वाढवण्यासाठी तुमच्या वर्णनात स्थानिक गावरान पद्धत आवर्जून सांगा.',
    'आठवड्याच्या शेवटी मागणी २५% वाढते, त्यामुळे वीकेंडपूर्वी पुरेसा स्टॉक तयार ठेवा.',
    'तेलाचे किंवा द्रवरूप पदार्थ फुटू नयेत म्हणून पॅकिंग सील व्यवस्थित तपासा.',
    'हंगामी उत्पादने (उदा. उन्हाळ्यात कैरी, हिवाळ्यात आवळा) दिल्यास जुने ग्राहक पुन्हा खरेदी करतात.'
  ]
};

export const DETERMINISTIC_FALLBACKS = {
  makeMore: {
    en: (name, sold, rating) => ({
      title: `Increase batch size for ${name}`,
      why: `High customer satisfaction with ${rating}★ rating and ${sold} units sold in last 4 weeks.`,
      action: `Prepare 20% additional units to prevent running out of stock.`
    }),
    mr: (name, sold, rating) => ({
      title: `${name} चे अधिक उत्पादन करा`,
      why: `गेल्या ४ आठवड्यांत ${sold} नग विक्री आणि उत्तम ${rating}★ रेटिंग मिळाले आहे.`,
      action: `स्टॉक संपू नये म्हणून उत्पादनात २०% वाढ करा.`
    })
  },
  improveReviewTheme: {
    en: (theme, count) => ({
      key: theme,
      title: `Improve ${theme} standards`,
      why: `Found ${count} recent customer review(s) mentioning concerns about ${theme}.`,
      action: `Review your preparation and packaging process to address ${theme} feedback.`
    }),
    mr: (theme, count) => ({
      key: theme,
      title: `${theme} च्या दर्जात सुधारणा करा`,
      why: `ग्राहकांच्या ${count} पुनरावलोकनांमध्ये ${theme} बाबत तक्रारी आढळल्या आहेत.`,
      action: `ग्राहकांच्या सूचनेनुसार ${theme} मध्ये आवश्यक बदल करा.`
    })
  },
  improveSlowMover: {
    en: (name, stock) => ({
      key: 'slow_mover',
      title: `Promote slow moving item: ${name}`,
      why: `High existing stock (${stock} units) with lower than average sales velocity.`,
      action: `Update photos and description or offer an introductory price.`
    }),
    mr: (name, stock) => ({
      key: 'slow_mover',
      title: `${name} च्या विक्रीस गती द्या`,
      why: `सध्या जास्त स्टॉक (${stock} नग) शिल्लक असून विक्रीचा वेग कमी आहे.`,
      action: `नवीन फोटो आणि माहिती अपडेट करा किंवा सवलत द्या.`
    })
  }
};
