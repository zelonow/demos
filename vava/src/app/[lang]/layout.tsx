import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "car rental Kigali",
    "self-drive Rwanda",
    "chauffeured hire Kigali",
    "airport transfer Rwanda",
    "conference transport Rwanda",
    "corporate fleet Rwanda",
    "Vava Transport",
    "DMC Rwanda",
    "VVIP transfer Kigali",
  ],
  authors: [{ name: SITE.name }],
  openGraph: {
    type: "website",
    url: SITE.siteUrl,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: [{ url: SITE.ogImage, width: 1200, height: 630, alt: SITE.name }],
    siteName: SITE.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: [SITE.ogImage],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#ed6623",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return (
    <html lang={lang} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
