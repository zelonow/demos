import { notFound } from "next/navigation";
import { getAttVehicle } from "@/lib/fleetx-inventory";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BookingFlow from "@/components/booking/BookingFlow";
import { getDictionary } from "@/i18n/getDictionary";
import { SITE } from "@/config/site";
import styles from "./page.module.css";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ lang: string; vehicleId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { vehicleId } = await params;
  const vehicle = await getAttVehicle(vehicleId);
  if (!vehicle) return {};
  return {
    title: `Book ${vehicle.make} ${vehicle.model}`,
    description: `Reserve the ${vehicle.make} ${vehicle.model} with ${SITE.name}.`,
  };
}

export default async function BookPage({ params }: Props) {
  const { lang, vehicleId } = await params;
  const dict = getDictionary(lang);
  const vehicle = await getAttVehicle(vehicleId);
  if (!vehicle) notFound();

  return (
    <>
      <Header dict={dict} lang={lang} />
      <main className={styles.main}>
        <div className="container">
          <div className={styles.header}>
            <h1 className={styles.title}>
              Request: {vehicle.make} {vehicle.model}
            </h1>
            <p className={styles.sub}>
              Submit the trip details now. Vava will confirm availability, pricing, route fit, and any required details later.
            </p>
          </div>
          <BookingFlow vehicle={vehicle} lang={lang} />
        </div>
      </main>
      <Footer dict={dict} />
    </>
  );
}
