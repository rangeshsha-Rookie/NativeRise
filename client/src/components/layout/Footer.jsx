// client/src/components/layout/Footer.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-bark text-on-bark mt-24 py-16 border-t border-bark">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          {/* Brand info */}
          <div className="max-w-md">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
              <span className="font-serif font-bold text-2xl tracking-tight text-on-bark">
                NativeRise
              </span>
            </div>
            <p className="text-on-bark/80 text-sm leading-relaxed mb-4">
              {t('footer.aboutText')}
            </p>
            <p className="text-xs text-on-bark/60 italic">
              {t('footer.disclaimer')}
            </p>
          </div>

          {/* Quick links & credits */}
          <div className="text-xs text-on-bark/70 flex flex-col items-center md:items-end gap-2">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <span>{t('footer.villageToDoorstep')}</span>
              <Heart className="w-4 h-4 text-clay fill-clay" />
            </div>
            <span>© {new Date().getFullYear()} NativeRise. {t('footer.copyright')}</span>
            <span>Map data © OpenStreetMap contributors</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
