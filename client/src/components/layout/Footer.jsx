// client/src/components/layout/Footer.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  Send,
  Check,
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  Twitter
} from 'lucide-react';
import { assetUrl } from '../../utils/productImages';

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
    <footer className="bg-[#201812] text-[#E5DDD0] pt-14 pb-8 border-t border-[#382B21] relative overflow-hidden">
      <div className="max-w-[1300px] mx-auto px-4 sm:px-8 relative z-10">
        {/* Top 4-Column Grid matching GrameenBazaar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-12 border-b border-[#382B21]/80">
          {/* Col 1: Brand & Mission */}
          <div className="lg:col-span-4 space-y-3.5">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-[#15803d] text-white flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-amber-200" />
              </div>
              <span className="font-serif font-black text-2xl tracking-tight text-white">
                NativeRise
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-[#BDB2A5] leading-relaxed max-w-sm">
              {isMr
                ? 'गावापासून तुमच्या दारापर्यंत — महाराष्ट्रातील ग्रामीण कारागीर, महिला बचत गट आणि शेतकऱ्यांना थेट तुमच्या घराशी जोडणारे डिजिटल व्यासपीठ.'
                : 'Together for a Self-Reliant India. Direct marketplace empowering rural artisans, women SHGs, and farmers straight to your doorstep.'}
            </p>

            <p className="text-[11px] text-[#8E8275] italic">
              {isMr
                ? 'सिम्युलेटेड टेस्ट मोड — चाचणी पेमेंट (Razorpay Test Mode)'
                : 'Simulated marketplace prototype — Live GPS & Verified Orders'}
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
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
                  {isMr ? 'खरेदी करा' : 'Shop'}
                </Link>
              </li>
              <li>
                <Link to="/shops" className="hover:text-emerald-400 transition-colors">
                  {isMr ? 'आमच्याबद्दल' : 'About Us'}
                </Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-emerald-400 transition-colors">
                  {isMr ? 'संपर्क साधा' : 'Contact'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Connect With Us (Social Pill Buttons) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {isMr ? 'सोशल मीडिया' : 'Connect With Us'}
            </h4>
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-[#2F241C] hover:bg-[#15803d] text-white flex items-center justify-center transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-[#2F241C] hover:bg-[#15803d] text-white flex items-center justify-center transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="w-8 h-8 rounded-full bg-[#2F241C] hover:bg-[#15803d] text-white flex items-center justify-center transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="X / Twitter"
                className="w-8 h-8 rounded-full bg-[#2F241C] hover:bg-[#15803d] text-white flex items-center justify-center transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-full bg-[#2F241C] hover:bg-[#15803d] text-white flex items-center justify-center transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 4: Newsletter Subscription */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {isMr ? 'न्यूजलेटर सदस्यता' : 'Subscribe to our Newsletter'}
            </h4>
            <p className="text-xs text-[#BDB2A5] leading-relaxed">
              {isMr
                ? 'नवीन उत्पादने, ताज्या ऑफर आणि गावातील ताज्या गोष्टी मिळवा.'
                : 'Get the latest products, seasonal harvests, and special artisan offers.'}
            </p>

            <form onSubmit={handleSubscribe} className="flex items-center gap-2 pt-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isMr ? 'तुमचा ईमेल टाका...' : 'Your email address...'}
                className="flex-1 h-10 px-3.5 rounded-xl bg-[#2D221A] border border-[#48372A] text-xs text-white placeholder-[#8E8275] focus:outline-none focus:ring-2 focus:ring-[#15803d]"
                required
              />
              <button
                type="submit"
                className="h-10 px-4 rounded-xl bg-[#15803d] hover:bg-[#166534] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                {subscribed ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{isMr ? 'नोंदवले!' : 'Joined!'}</span>
                  </>
                ) : (
                  <>
                    <span>{isMr ? 'सदस्य व्हा' : 'Subscribe'}</span>
                    <Send className="w-3 h-3" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Silhouette banner along the bottom */}
        <div className="w-full opacity-30 my-4 select-none pointer-events-none flex justify-center overflow-hidden">
          <img
            src={assetUrl('mockup-assets/footer-village-silhouette.png')}
            alt="Village Silhouette"
            className="w-full max-h-11 object-cover mix-blend-screen"
          />
        </div>

        {/* Bottom Credits & Copyright */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8E8275]">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} NativeRise. All rights reserved.</span>
            <span>•</span>
            <span>Map data © OpenStreetMap contributors</span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/support" className="hover:text-emerald-400">
              {isMr ? 'गोपनीयता धोरण' : 'Privacy Policy'}
            </Link>
            <span>|</span>
            <Link to="/support" className="hover:text-emerald-400">
              {isMr ? 'नियम व अटी' : 'Terms of Service'}
            </Link>
            <span>|</span>
            <Link to="/support" className="hover:text-emerald-400">
              {isMr ? 'मदत' : 'Help'}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
