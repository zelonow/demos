// ─────────────────────────────────────────────────────────────────────────────
// SITE CONFIG — edit this file to re-skin the entire website
// ─────────────────────────────────────────────────────────────────────────────

export const SITE = {
  name: "Vava Transport and Logistics",
  nameShort: "Vava Transport",
  tagline: "Transport and logistics excellence delivered daily.",
  description:
    "Premium airport transfers, corporate event transport, tourism, and VVIP fleet operations in Rwanda.",
  city: "Kigali",
  country: "Rwanda",
  currency: "RWF",
  email: "info@vavatours.com",
  phone: "+250 788 557 701",
  whatsapp: "+250788557701",
  address: "KG 5 Avenue, Gate Number 73, Kacyiru, Kigali, Rwanda",
  hours: "Daily: 7:00 AM - 8:00 PM",

  // Back-office admin URL — staff login in footer
  adminUrl:
    process.env.NEXT_PUBLIC_ADMIN_URL ??
    "http://localhost:3012",

  // Backend API integration
  organizationId: process.env.NEXT_PUBLIC_ORG_ID ?? "mock",
  backendBase: process.env.BACKEND_BASE_URL ?? "",
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",

  // Social
  socialLinks: {
    instagram: "https://www.instagram.com/p/DKg3B-eIzj7/",
    twitter: "",
    facebook: "",
    linkedin: "",
  },

  // SEO
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://vavatransport.rw",
  ogImage: "/images/hero/hero-bg.png",
} as const;
