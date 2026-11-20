import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export function useDocumentTitle(titleKey, params = {}) {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (!titleKey) return;
    const title = t(titleKey, params);
    if (typeof document !== "undefined") {
      document.title = `${title} | NativeRise`;
    }
  }, [titleKey, i18n.language, JSON.stringify(params), t]);
}
