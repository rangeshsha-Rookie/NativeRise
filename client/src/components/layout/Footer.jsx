// client/src/components/layout/Footer.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, Sparkles, Send, Check } from 'lucide-react';

export function Footer() {
  const { t, i18n } = useTranslation();
  const isMr = i18n.language === 'mr';
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#1E1510] text-[#E5DDD0] pt-16 pb-10 border-t border-[#38281E]">
      <div className="max-w-[1300px] mx-auto px-4 sm:px-8">
        {/* Top 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#38281E]/80">
          {/* Col 1: Brand & Mission */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-amber-200" />
              </div>
              <span className="font-serif font-black text-2xl tracking-tight text-white">
                NativeRise
              </span>
            </Link>

            <p className="text-sm text-[#BDB2A5] leading-relaxed max-w-sm">
              {isMr
                ? 'महाराष्ट्रातील ग्रामीण कारागीर, शेतकरी आणि महिला बचत गटांना थेट तुमच्या घराशी जोडणारे डिजिटल व्यासपीठ.'
                : 'Direct digital marketplace empowering rural Maharashtra artisans, women SHGs, and organic farmers straight to your doorstep.'}
            </p>

            <p className="text-xs text-[#8E8275] italic">
              {isMr
                ? 'गावापासून तुमच्या दारापर्यंत — चाचणी पद्धत (Razorpay Test Mode).'
                : 'From the village to your doorstep — Simulated prototype mode.'}
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              {isMr ? 'जलद दुवे' : 'Quick Links'}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#BDB2A5]">
              <li>
                <Link to="/" className="hover:text-emerald-400 transition-colors">
                  {isMr ? 'मुखपृष्ठ' : 'Home'}
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-emerald-400 transition-colors">
                  {isMr ? 'सर्व उत्पादने' : 'All Products'}
                </Link>
              </li>
              <li>
                <Link to="/shops" className="hover:text-emerald-400 transition-colors">
                  {isMr ? 'गावची दुकाने' : 'Village Shops'}
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-emerald-400 transition-colors">
                  {isMr ? 'माझ्या ऑर्डर्स' : 'Track Orders'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: For Partners & Sellers */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              {isMr ? 'भागीदारी' : 'Join Us'}
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#BDB2A5]">
              <li>
                <Link to="/register?role=seller" className="hover:text-emerald-400 transition-colors">
                  {isMr ? 'दुकान सुरू करा' : 'Register Shop'}
                </Link>
              </li>
              <li>
                <Link to="/register?role=partner" className="hover:text-emerald-400 transition-colors">
                  {isMr ? 'डिलिव्हरी पार्टनर व्हा' : 'Delivery Partner'}
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-400 transition-colors">
                  {isMr ? 'लॉगिन करा' : 'Portal Login'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter Subscription */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              {isMr ? 'नवीन उत्पादनांचे अपडेट्स' : 'Subscribe to Newsletter'}
            </h4>
            <p className="text-xs text-[#BDB2A5] leading-relaxed">
              {isMr
                ? 'गावातील ताज्या उत्पादनांची माहिती आणि विशेष सवलती मिळवा.'
                : 'Get the latest harvest arrivals, handmade specials, and rural stories.'}
            </p>

            <form onSubmit={handleSubscribe} className="flex items-center gap-2 pt-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isMr ? 'तुमचा ईमेल टाका...' : 'Your email address...'}
                className="flex-1 h-11 px-4 rounded-xl bg-[#2D2018] border border-[#4A372A] text-xs text-white placeholder-[#8E8275] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
              <button
                type="submit"
                className="h-11 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                {subscribed ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>{isMr ? 'नोंदवले!' : 'Joined!'}</span>
                  </>
                ) : (
                  <>
                    <span>{isMr ? 'सदस्य व्हा' : 'Subscribe'}</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Credits & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8E8275]">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} NativeRise. All rights reserved.</span>
            <span>•</span>
            <span>Map data © OpenStreetMap contributors</span>
          </div>

          <div className="flex items-center gap-1.5 font-medium text-[#BDB2A5]">
            <span>{isMr ? 'गावापासून तुमच्या दारापर्यंत' : 'From the village to your doorstep'}</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
