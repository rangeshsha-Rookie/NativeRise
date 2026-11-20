import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";

export function useGeolocation({ watch = false } = {}) {
  const { t } = useTranslation();
  const [position, setPosition] = useState(null);
  const [errorCode, setErrorCode] = useState(null);
  const [status, setStatus] = useState("idle"); // idle, loading, success, error

  const handleSuccess = useCallback((pos) => {
    setPosition({
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      heading: pos.coords.heading,
      speed: pos.coords.speed,
    });
    setErrorCode(null);
    setStatus("success");
  }, []);

  const handleError = useCallback((err) => {
    let code = "LOCATION_UNAVAILABLE";
    if (err.code === 1) code = "LOCATION_DENIED";
    if (err.code === 3) code = "LOCATION_TIMEOUT";
    setErrorCode(code);
    setStatus("error");
  }, []);

  const requestPosition = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setErrorCode("LOCATION_UNAVAILABLE");
      setStatus("error");
      return;
    }

    setStatus("loading");
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000,
    });
  }, [handleSuccess, handleError]);

  useEffect(() => {
    if (!watch || typeof navigator === "undefined" || !navigator.geolocation) return;

    setStatus("loading");
    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000,
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [watch, handleSuccess, handleError]);

  const error = errorCode ? t(`errors.${errorCode}`) : null;

  return {
    position,
    error,
    errorCode,
    status,
    requestPosition,
  };
}
