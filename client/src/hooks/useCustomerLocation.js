import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";

export function useCustomerLocation() {
  const { user, isAuthenticated } = useAuth();
  const isCustomer = !isAuthenticated || user?.role === "customer";

  const [guestLoc, setGuestLoc] = useState(() => {
    if (typeof localStorage !== "undefined") {
      const saved = localStorage.getItem("nr_guest_loc");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore
        }
      }
    }
    return null;
  });

  const { data: addresses = [] } = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      return await api.get("/me/addresses");
    },
    enabled: isAuthenticated && user?.role === "customer",
  });

  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0] || null;

  const setGuestLocation = useCallback((loc) => {
    if (!loc) {
      localStorage.removeItem("nr_guest_loc");
      setGuestLoc(null);
      return;
    }
    const val = {
      lat: Number(loc.lat),
      lng: Number(loc.lng),
      label: loc.label || loc.formatted || "Selected Location",
    };
    localStorage.setItem("nr_guest_loc", JSON.stringify(val));
    setGuestLoc(val);
  }, []);

  let lat = null;
  let lng = null;
  let label = "";
  let source = null;

  if (isAuthenticated && isCustomer && defaultAddress?.location?.coordinates) {
    const coords = defaultAddress.location.coordinates;
    lng = coords[0];
    lat = coords[1];
    label = defaultAddress.label || defaultAddress.village || defaultAddress.formatted || "Home";
    source = "address";
  } else if (guestLoc?.lat && guestLoc?.lng) {
    lat = guestLoc.lat;
    lng = guestLoc.lng;
    label = guestLoc.label || "Guest Location";
    source = "guest";
  }

  const needsLocation = lat === null || lng === null;

  return {
    lat,
    lng,
    label,
    source,
    setGuestLocation,
    needsLocation,
    addresses,
    defaultAddress,
  };
}
