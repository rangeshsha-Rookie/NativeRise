import { useState, useEffect } from "react";

let razorpayScriptPromise = null;

function loadRazorpayScript() {
  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve) => {
      if (typeof window !== "undefined" && window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }
  return razorpayScriptPromise;
}

export function useRazorpay() {
  const [isLoaded, setIsLoaded] = useState(() => {
    return typeof window !== "undefined" && !!window.Razorpay;
  });

  useEffect(() => {
    if (!isLoaded) {
      loadRazorpayScript().then((loaded) => setIsLoaded(loaded));
    }
  }, [isLoaded]);

  return {
    isLoaded,
    Razorpay: typeof window !== "undefined" ? window.Razorpay : null,
  };
}
