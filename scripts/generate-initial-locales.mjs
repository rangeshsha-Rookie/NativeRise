// scripts/generate-initial-locales.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const enDir = path.resolve(__dirname, '../client/src/i18n/locales/en');
const mrDir = path.resolve(__dirname, '../client/src/i18n/locales/mr');

fs.mkdirSync(enDir, { recursive: true });
fs.mkdirSync(mrDir, { recursive: true });

const namespaces = {
  common: {
    en: {
      appName: "NativeRise",
      tagline: "From the village to your doorstep.",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      confirm: "Confirm",
      close: "Close",
      back: "Back",
      next: "Next",
      submit: "Submit",
      apply: "Apply",
      clear: "Clear",
      clearAll: "Clear all",
      retry: "Try again",
      loading: "Loading...",
      search: "Search",
      filter: "Filter",
      sortBy: "Sort by",
      viewAll: "View all",
      seeMore: "See more",
      showLess: "Show less",
      explore: "Explore",
      details: "Details",
      actions: "Actions",
      statusLabel: "Status",
      date: "Date",
      time: "Time",
      total: "Total",
      price: "Price",
      quantity: "Quantity",
      stock: "Stock",
      address: "Address",
      phone: "Phone",
      email: "Email",
      name: "Name",
      village: "Village",
      shop: "Shop",
      offlineNotice: "You are currently offline. Please check your internet connection.",
      testModeBadge: "Test mode - no real money moves",
      simulatedSettlement: "Simulated settlement",
      verifiedBuyer: "Verified buyer",
      onlyNLeft: "Only {{count}} left",
      inStock: "In stock",
      outOfStock: "Out of stock",
      notAvailable: "Not available",
      day: "day",
      days: "days",
      today: "Today",
      yesterday: "Yesterday"
    },
    mr: {
      appName: "NativeRise",
      tagline: "गावापासून तुमच्या दारापर्यंत.",
      save: "साठवा",
      cancel: "रद्द करा",
      delete: "हटवा",
      edit: "बदला",
      confirm: "निश्चित करा",
      close: "बंद करा",
      back: "मागे",
      next: "पुढे",
      submit: "सादर करा",
      apply: "लागू करा",
      clear: "साफ करा",
      clearAll: "सर्व साफ करा",
      retry: "पुन्हा प्रयत्न करा",
      loading: "लोड होत आहे...",
      search: "शोधा",
      filter: "फिल्टर",
      sortBy: "क्रमाने लावा",
      viewAll: "सर्व पाहा",
      seeMore: "अधिक पाहा",
      showLess: "कमी दाखवा",
      explore: "शोधा आणि पाहा",
      details: "तपशील",
      actions: "कृती",
      statusLabel: "स्थिती",
      date: "तारीख",
      time: "वेळ",
      total: "एकूण",
      price: "किंमत",
      quantity: "प्रमाण",
      stock: "साठा",
      address: "पत्ता",
      phone: "फोन",
      email: "ईमेल",
      name: "नाव",
      village: "गाव",
      shop: "दुकान",
      offlineNotice: "आपण सध्या ऑफलाइन आहात. कृपया इंटरनेट कनेक्शन तपासा.",
      testModeBadge: "टेस्ट मोड - कोणतेही खरे पैसे जात नाहीत",
      simulatedSettlement: "सिम्युलेटेड सेटलमेंट (नमुना हिशेब)",
      verifiedBuyer: "पडताळलेला खरेदीदार",
      onlyNLeft: "फक्त {{count}} शिल्लक",
      inStock: "उपलब्ध आहे",
      outOfStock: "साठा संपला",
      notAvailable: "अनुपलब्ध",
      day: "दिवस",
      days: "दिवस",
      today: "आज",
      yesterday: "काल"
    }
  },

  nav: {
    en: {
      home: "Home",
      shop: "Shop",
      products: "Products",
      orders: "Orders",
      cart: "Cart",
      account: "Account",
      login: "Log in",
      register: "Register",
      logout: "Log out",
      dashboard: "Dashboard",
      myDashboard: "Go to my dashboard",
      sellerDashboard: "Seller Dashboard",
      partnerDashboard: "Partner Dashboard",
      whatToSell: "What to sell",
      growthCoach: "Growth Coach",
      earnings: "Earnings",
      reviews: "Reviews",
      support: "Support",
      assistant: "AI Assistant",
      shopSettings: "Shop settings",
      jobs: "Jobs",
      activeOrder: "Active",
      history: "History",
      profile: "Profile",
      more: "More",
      addresses: "Addresses"
    },
    mr: {
      home: "मुख्य पान",
      shop: "खरेदी",
      products: "उत्पादने",
      orders: "ऑर्डर्स",
      cart: "कार्ट",
      account: "खाते",
      login: "लॉगिन करा",
      register: "नोंदणी करा",
      logout: "बाहेर पडा",
      dashboard: "डॅशबोर्ड",
      myDashboard: "माझ्या डॅशबोर्डवर जा",
      sellerDashboard: "विक्रेता डॅशबोर्ड",
      partnerDashboard: "पार्टनर डॅशबोर्ड",
      whatToSell: "काय विकावे",
      growthCoach: "ग्रोथ कोच",
      earnings: "कमाई",
      reviews: "रिव्ह्यू",
      support: "मदत कक्ष",
      assistant: "एआय सहाय्यक",
      shopSettings: "दुकान सेटिंग्ज",
      jobs: "कामे",
      activeOrder: "चालू डिलिव्हरी",
      history: "इतिहास",
      profile: "प्रोफाइल",
      more: "अधिक",
      addresses: "पत्ते"
    }
  },

  footer: {
    en: {
      aboutText: "NativeRise connects rural creators, home cooks and artisans directly with customers everywhere.",
      disclaimer: "NativeRise is a project prototype. Payments run in test mode and no real money is charged.",
      copyright: "All rights reserved.",
      villageToDoorstep: "From the village to your doorstep."
    },
    mr: {
      aboutText: "नेटिव्हराईज ग्रामीण कारागीर, शेतकरी आणि गृहउद्योगांना थेट ग्राहकांशी जोडते.",
      disclaimer: "नेटिव्हराईज हा एक प्रकल्प प्रोटोटाइप आहे. पेमेंट टेस्ट मोडमध्ये चालते आणि कोणतेही खरे पैसे आकारले जात नाहीत.",
      copyright: "सर्व हक्क राखीव.",
      villageToDoorstep: "गावापासून तुमच्या दारापर्यंत."
    }
  },

  a11y: {
    en: {
      skipToContent: "Skip to main content",
      openMenu: "Open navigation menu",
      closeMenu: "Close navigation menu",
      selectLanguage: "Select language",
      productImage: "Photo of {{name}}",
      shopCover: "Shop cover banner",
      ratingStars: "{{rating}} out of 5 stars",
      deliveryPartnerMarker: "Delivery partner live location marker",
      pickupMarker: "Pickup point marker",
      dropMarker: "Delivery destination marker",
      decrementQty: "Decrease quantity",
      incrementQty: "Increase quantity",
      zoomIn: "Zoom in on map",
      zoomOut: "Zoom out on map"
    },
    mr: {
      skipToContent: "थेट मुख्य मजकुरावर जा",
      openMenu: "मेनू उघडा",
      closeMenu: "मेनू बंद करा",
      selectLanguage: "भाषा निवडा",
      productImage: "{{name}} चा फोटो",
      shopCover: "दुकानाचा कव्हर फोटो",
      ratingStars: "५ पैकी {{rating}} तारे",
      deliveryPartnerMarker: "डिलिव्हरी पार्टनरचे थेट स्थान दर्शक",
      pickupMarker: "पिकअप ठिकाण दर्शक",
      dropMarker: "डिलिव्हरी ठिकाण दर्शक",
      decrementQty: "प्रमाण कमी करा",
      incrementQty: "प्रमाण वाढवा",
      zoomIn: "नकाशा मोठा करा",
      zoomOut: "नकाशा लहान करा"
    }
  },

  validation: {
    en: {
      required: "This field is required",
      invalidEmail: "Please enter a valid email address",
      invalidPhone: "Please enter a valid 10-digit Indian phone number starting with 6-9",
      passwordMinLength: "Password must be at least 8 characters long with 1 letter and 1 number",
      passwordMismatch: "Passwords do not match",
      minValue: "Must be at least {{min}}",
      maxValue: "Must be at most {{max}}",
      textLengthRange: "Must be between {{min}} and {{max}} characters",
      invalidPin: "Pincode must be 6 digits",
      invalidNumber: "Please enter a valid number",
      selectOption: "Please select an option"
    },
    mr: {
      required: "ही माहिती भरणे आवश्यक आहे",
      invalidEmail: "कृपया वैध ईमेल पत्ता टाका",
      invalidPhone: "कृपया ६-९ ने सुरू होणारा वैध १० अंकी फोन नंबर टाका",
      passwordMinLength: "पासवर्ड किमान ८ अक्षरांचा असावा ज्यामध्ये किमान १ अक्षर आणि १ अंक असावा",
      passwordMismatch: "पासवर्ड जुळत नाहीत",
      minValue: "किमान मूल्य {{min}} असावे",
      maxValue: "कमाल मूल्य {{max}} असावे",
      textLengthRange: "{{min}} ते {{max}} अक्षरांच्या दरम्यान मजकूर असावा",
      invalidPin: "पिनकोड ६ अंकांचा असावा",
      invalidNumber: "कृपया वैध अंक टाका",
      selectOption: "कृपया एक पर्याय निवडा"
    }
  }
};

for (const [ns, translations] of Object.entries(namespaces)) {
  fs.writeFileSync(path.join(enDir, `${ns}.json`), JSON.stringify(translations.en, null, 2));
  fs.writeFileSync(path.join(mrDir, `${ns}.json`), JSON.stringify(translations.mr, null, 2));
}

console.log('Base common namespaces generated successfully.');
