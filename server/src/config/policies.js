// server/src/config/policies.js
// Bilingual platform policies and seller guides per Section 16.4

export const CUSTOMER_POLICIES = {
  cancellation: {
    en: 'You can cancel your order for free anytime while it is in PLACED or AWAITING_PAYMENT status before the seller begins packing it. Once packed or picked up, cancellation is not allowed.',
    mr: 'विक्रेत्याने ऑर्डर पॅक करण्यापूर्वी, म्हणजेच ऑर्डर PLACED किंवा AWAITING_PAYMENT स्थितीत असताना तुम्ही ती विनामूल्य रद्द करू शकता. एकदा पॅक किंवा पिकअप झाल्यावर ऑर्डर रद्द करता येत नाही.'
  },
  refunds: {
    en: 'If an online paid order is cancelled, rejected by the seller, or fails delivery, a 100% refund is initiated immediately to your original payment method in test mode.',
    mr: 'जर ऑनलाइन पैसे भरलेली ऑर्डर रद्द झाली, विक्रेत्याने नाकारली किंवा डिलिव्हरी अयशस्वी झाली, तर चाचणी मोडमध्ये तुमच्या मूळ पेमेंट पद्धतीवर १००% परतावा त्वरित सुरू केला जातो.'
  },
  delivery: {
    en: 'Delivery is handled by dedicated local delivery partners. Standard delivery takes 60 to 180 minutes depending on road distance and seller preparation time.',
    mr: 'स्थानिक डिलिव्हरी भागीदारांद्वारे डिलिव्हरी केली जाते. रस्त्यावरील अंतर आणि विक्रेत्याच्या तयारीच्या वेळेनुसार साधारण ६० ते १८० मिनिटे लागतात.'
  },
  deliveryCode: {
    en: 'Your order includes a private 4-digit delivery confirmation code shown on your order details page. Share this code with the delivery partner ONLY when you receive your package.',
    mr: 'तुमच्या ऑर्डर तपशील पृष्ठावर ४-अंकी डिलिव्हरी कोड दिसेल. तुमचे पार्सल मिळाल्यावरच हा कोड डिलिव्हरी पार्टनरला सांगा.'
  },
  cod: {
    en: 'Cash on Delivery (COD) is available for all eligible orders. Please pay the exact amount in cash to the delivery partner upon arrival.',
    mr: 'पात्र ऑर्डर्ससाठी कॅश ऑन डिलिव्हरी (COD) उपलब्ध आहे. पार्सल आल्यावर डिलिव्हरी पार्टनरला अचूक रक्कम रोख द्या.'
  },
  reviews: {
    en: 'You can rate and review products from orders that have been successfully delivered. Each product in an order can be reviewed once.',
    mr: 'यशस्वीरित्या पोहोचवलेल्या ऑर्डर्समधील उत्पादनांना तुम्ही रेटिंग आणि पुनरावलोकन देऊ शकता. एका ऑर्डरमधील प्रत्येक उत्पादनाचे एकदाच पुनरावलोकन करता येते.'
  },
  support: {
    en: 'If you have an issue with an order or product, you can raise a support ticket directly with the seller. The seller will reply within their working hours.',
    mr: 'ऑर्डर किंवा उत्पादनाबाबत काही अडचण असल्यास तुम्ही थेट विक्रेत्याकडे सपोर्ट तिकीट उघडू शकता. विक्रेता कामाच्या वेळेत उत्तर देईल.'
  },
  payments: {
    en: 'NativeRise supports Razorpay online test payments (UPI, Cards, Netbanking) and Cash on Delivery. No real money moves during test mode.',
    mr: 'NativeRise रेझरपे ऑनलाइन टेस्ट पेमेंट्स (UPI, कार्ड्स, नेटबँकिंग) आणि कॅश ऑन डिलिव्हरीला सपोर्ट करते. टेस्ट मोडमध्ये कोणतेही खरे पैसे कापले जात नाहीत.'
  }
};

export const SELLER_GUIDES = {
  add_product: {
    en: 'To add a product, go to Products -> Add Product. Enter product name, description in English and Marathi, price in rupees, quantity and stock. You can also use Snap & Sell or Voice to auto-draft listings.',
    mr: 'उत्पादन जोडण्यासाठी Products -> Add Product वर जा. इंग्रजी आणि मराठीत नाव, वर्णन, किंमत, प्रमाण आणि स्टॉक टाका. तुम्ही फोटो किंवा आवाजाद्वारेही उत्पादन जोडू शकता.'
  },
  handle_orders: {
    en: 'When a customer places an order, you have 6 hours to Accept or Reject it. After accepting, prepare the items and click Pack Order. A nearby delivery partner will then accept and pick it up.',
    mr: 'ग्राहकाने ऑर्डर दिल्यावर स्वीकारण्यासाठी किंवा नाकारण्यासाठी ६ तास असतात. स्वीकारल्यानंतर वस्तू तयार करून Pack Order वर क्लिक करा. त्यानंतर स्थानिक डिलिव्हरी पार्टनर ती पिकअप करेल.'
  },
  delivery_settings: {
    en: 'Under Shop Settings, choose Delivery Included (free delivery to customer, delivery cost deducted from your earnings) or Customer Pays. Set your service radius and prep time.',
    mr: 'दुकान सेटिंग्जमध्ये डिलिव्हरी पर्याय निवडा: Delivery Included (ग्राहकांसाठी मोफत, खर्च तुमच्या कमाईतून वजा) किंवा Customer Pays. डिलिव्हरी अंतर आणि तयारीची वेळ निश्चित करा.'
  },
  earnings: {
    en: 'Earnings are credited to your simulated shop ledger as soon as an order is delivered. You can view order breakdowns (items total, platform fee, delivery cost, and net).',
    mr: 'ऑर्डर पोहोचताच कमाई तुमच्या खात्यात जमा होते. तुम्ही प्रत्येक ऑर्डरचा तपशील (उत्पादन किंमत, प्लॅटफॉर्म फी, डिलिव्हरी खर्च आणि निव्वळ नफा) पाहू शकता.'
  },
  growth_coach: {
    en: 'The Growth Coach analyzes your past 8 weeks of sales, stock levels, and customer reviews to suggest what to produce more of and what to improve.',
    mr: 'ग्रोथ कोच तुमच्या गेल्या ८ आठवड्यांची विक्री, स्टॉक आणि ग्राहकांची पुनरावलोकने तपासून अधिक काय बनवावे आणि काय सुधारावे याचे मार्गदर्शन करतो.'
  },
  support_inbox: {
    en: 'Check the Support Inbox for customer questions or complaints. You can write your own replies or click Draft AI Reply to quickly generate a polite response.',
    mr: 'ग्राहकांचे प्रश्न पाहण्यासाठी सपोर्ट इनबॉक्स तपासा. तुम्ही स्वतः उत्तर लिहू शकता किंवा Draft AI Reply वर क्लिक करून झटपट उत्तर तयार करू शकता.'
  }
};
