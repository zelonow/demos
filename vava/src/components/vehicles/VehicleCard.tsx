import Image from "next/image";
import Link from "next/link";
import type { Vehicle } from "@/types";
import { formatRwf, vehicleClassLabel } from "@/lib/utils";
import styles from "./VehicleCard.module.css";

export default function VehicleCard({ vehicle, dict }: { vehicle: Vehicle; dict: any }) {
  const classLabels = dict.catalog.classes as Record<string, string>;

  return (
    <Link href={`/vehicles/${vehicle.id}`} className={styles.card}>
      <div className={styles.imgWrap}>
        <Image
          src={vehicle.heroImage || vehicle.photoUrl}
          alt={`${vehicle.make} ${vehicle.model}`}
          fill
          className={styles.img}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <span className={styles.badge}>
          {classLabels[vehicle.vehicleClass] || vehicleClassLabel(vehicle.vehicleClass)}
        </span>
        <div className={styles.tags}>
          {vehicle.selfDriveEnabled && <span className={styles.tag}>{dict.card.tags.selfDrive}</span>}
          {vehicle.chauffeuredEnabled && <span className={styles.tag}>{dict.card.tags.chauffeured}</span>}
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.nameRow}>
          <div>
            <p className={styles.make}>{vehicle.make}</p>
            <h3 className={styles.model}>{vehicle.model}</h3>
          </div>
          <span className={styles.year}>{vehicle.year}</span>
        </div>

        <ul className={styles.specs}>
          <li>
            <SvgSeat />
            {vehicle.seats} {dict.card.specs.seats}
          </li>
          <li>
            <SvgTransmission />
            {vehicle.transmission === "automatic" ? dict.card.specs.auto : dict.card.specs.manual}
          </li>
          <li>
            <SvgFuel />
            {dict.card.specs[vehicle.fuelType] || (vehicle.fuelType.charAt(0).toUpperCase() + vehicle.fuelType.slice(1))}
          </li>
        </ul>

        <div className={styles.pricing}>
          <span className={styles.priceIntro}>Estimate from</span>
          <div className={styles.dailyRate}>
            <span className={styles.rateValue}>{formatRwf(vehicle.dailyRateRwf)}</span>
            <span className={styles.rateLabel}>/ {dict.card.rates.day}</span>
          </div>
          <div className={styles.secRates}>
            <span>{formatRwf(vehicle.hourlyRateRwf)} / {dict.card.rates.hr}</span>
            <span className={styles.dot}>·</span>
            <span>{formatRwf(vehicle.weeklyRateRwf)} / {dict.card.rates.wk}</span>
          </div>
        </div>

        <div className={styles.deposit}>
          <span className={styles.depositLabel}>{dict.card.deposit}</span>
          <span className={styles.depositValue}>No payment now</span>
        </div>

        <div className={styles.cta}>
          <span>{dict.card.viewDetails}</span>
          <span className={styles.arrow} aria-hidden>→</span>
        </div>
      </div>
    </Link>
  );
}

function SvgSeat() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3"/>
      <rect x="2" y="9" width="20" height="6" rx="2"/>
      <path d="M4 15v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>
    </svg>
  );
}

function SvgTransmission() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
      <path d="M6 9v6M18 9v3a3 3 0 0 1-3 3H6"/>
    </svg>
  );
}

function SvgFuel() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 22V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/>
      <path d="M3 12h12M19 10l1 1-1 1M15 7h4a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1h-1"/>
    </svg>
  );
}
