import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getAttVehicle } from "@/lib/fleetx-inventory";
import { formatRwf, vehicleClassLabel, serviceTypeLabel } from "@/lib/utils";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getDictionary } from "@/i18n/getDictionary";
import { SITE } from "@/config/site";
import styles from "./page.module.css";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ lang: string; id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const vehicle = await getAttVehicle(id);
  if (!vehicle) return {};
  return {
    title: vehicle.listingTitle,
    description: vehicle.listingDescription,
  };
}

export default async function VehicleDetailPage({ params }: Props) {
  const { lang, id } = await params;
  const dict = getDictionary(lang);
  const vehicle = await getAttVehicle(id);

  if (!vehicle) notFound();
  const classLabels = dict.catalog.classes as Record<string, string>;

  return (
    <>
      <Header dict={dict} lang={lang} />
      <main className={styles.main}>
        <div className="container">
          {/* Breadcrumb */}
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href={`/${lang}`}>{dict.detail.breadcrumbHome}</Link>
            <span>/</span>
            <Link href={`/${lang}/#fleet`}>{dict.detail.breadcrumbFleet}</Link>
            <span>/</span>
            <span>{vehicle.make} {vehicle.model}</span>
          </nav>

          <div className={styles.layout}>
            {/* Left: Gallery */}
            <div className={styles.gallery}>
              <div className={styles.mainPhoto}>
                <Image
                  src={vehicle.photoUrl}
                  alt={`${vehicle.make} ${vehicle.model} ${vehicle.year}`}
                  fill
                  priority
                  className={styles.mainImg}
                  sizes="(max-width: 768px) 100vw, 55vw"
                />
                <span className={styles.classBadge}>
                  {classLabels[vehicle.vehicleClass] || vehicleClassLabel(vehicle.vehicleClass)}
                </span>
              </div>
              {/* Thumbnails (same photo for mock — real impl would cycle listingPhotos) */}
              {vehicle.listingPhotos.slice(0, 4).map((photo, i) => (
                <div key={i} className={styles.thumb}>
                  <Image src={photo} alt={`Photo ${i + 1}`} fill className={styles.thumbImg} />
                </div>
              ))}
            </div>

            {/* Right: Details */}
            <div className={styles.details}>
              <div className={styles.nameBadge}>
                <p className={styles.make}>{vehicle.make}</p>
                <div className={styles.tags}>
                  {vehicle.selfDriveEnabled && <span className={styles.tag}>{dict.card.tags.selfDrive}</span>}
                  {vehicle.chauffeuredEnabled && <span className={styles.tag}>{dict.card.tags.chauffeured}</span>}
                </div>
              </div>

              <h1 className={styles.model}>{vehicle.model}</h1>
              <p className={styles.year}>{vehicle.year}</p>

              <p className={styles.description}>{vehicle.listingDescription}</p>

              {/* Specs grid */}
              <div className={styles.specs}>
                {[
                  { label: dict.detail.specs.seats, value: `${vehicle.seats} ${dict.detail.specs.passengers}` },
                  { label: dict.detail.specs.transmission, value: vehicle.transmission === "automatic" ? dict.card.specs.auto : dict.card.specs.manual },
                  { label: dict.detail.specs.fuel, value: dict.card.specs[vehicle.fuelType] || (vehicle.fuelType.charAt(0).toUpperCase() + vehicle.fuelType.slice(1)) },
                  { label: dict.detail.specs.limit, value: `${vehicle.mileageLimitKm.toLocaleString()} km / ${dict.card.rates.day}` },
                  { label: dict.detail.specs.extra, value: `${formatRwf(vehicle.extraMileageFeeRwf)} / km` },
                  { label: dict.detail.specs.late, value: `${formatRwf(vehicle.lateReturnFeeRwf)} / ${dict.card.rates.hr}` },
                ].map((spec) => (
                  <div key={spec.label} className={styles.spec}>
                    <span className={styles.specLabel}>{spec.label}</span>
                    <span className={styles.specValue}>{spec.value}</span>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className={styles.pricing}>
                <div className={styles.rate}>
                  <span className={styles.rateVal}>{formatRwf(vehicle.dailyRateRwf)}</span>
                  <span className={styles.ratePer}>/ {dict.card.rates.day}</span>
                </div>
                <div className={styles.secRates}>
                  <span>{formatRwf(vehicle.hourlyRateRwf)} / {dict.card.rates.hr}</span>
                  <span>·</span>
                  <span>{formatRwf(vehicle.weeklyRateRwf)} / {dict.card.rates.wk}</span>
                </div>
                <div className={styles.deposit}>
                  <span>{dict.detail.pricing.deposit}</span>
                  <strong>{formatRwf(vehicle.depositAmountRwf)}</strong>
                </div>
              </div>

              {/* Book CTA */}
              <Link href={`/${lang}/book/${vehicle.id}`} className={styles.bookCta}>
                {dict.detail.pricing.bookCTA}
              </Link>

              <p className={styles.callCta}>
                {dict.detail.pricing.preferTalk}{" "}
                <a href={`tel:${SITE.phone.replace(/\s/g, "")}`}>{dict.detail.pricing.callCTA}</a>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer dict={dict} />
    </>
  );
}
