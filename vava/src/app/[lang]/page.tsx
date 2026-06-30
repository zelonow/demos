import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import Assistant from "@/components/sections/Assistant";
import VehicleCatalog from "@/components/vehicles/VehicleCatalog";
import HowItWorks from "@/components/sections/HowItWorks";
import TrustBar from "@/components/sections/TrustBar";
import { getDictionary } from "@/i18n/getDictionary";

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = getDictionary(lang);

  return (
    <>
      <Header dict={dict} lang={lang} />
      <main>
        <Hero dict={dict} />
        <VehicleCatalog dict={dict} />
        <Services dict={dict} />
        <Assistant />
        <HowItWorks dict={dict} />
        <TrustBar />
      </main>
      <Footer dict={dict} />
    </>
  );
}
