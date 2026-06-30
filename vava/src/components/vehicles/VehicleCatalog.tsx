"use client";
import { useState, useEffect, useMemo } from "react";
import type { Vehicle, VehicleClass, ServiceType } from "@/types";
import VehicleCard from "./VehicleCard";
import styles from "./VehicleCatalog.module.css";

export default function VehicleCatalog({ dict }: { dict: any }) {
  const CLASS_OPTIONS: { value: VehicleClass | "all"; label: string }[] = [
    { value: "all", label: dict.catalog.filters.allClasses },
    { value: "landcruiser", label: dict.catalog.classes.landcruiser },
    { value: "volkswagen", label: dict.catalog.classes.volkswagen },
    { value: "vans", label: dict.catalog.classes.vans },
    { value: "sedans", label: dict.catalog.classes.sedans },
    { value: "executive_bus", label: dict.catalog.classes.executive_bus },
  ];

  const SERVICE_OPTIONS: { value: ServiceType | "all"; label: string }[] = [
    { value: "all", label: dict.catalog.filters.allServices },
    { value: "airport_transfer", label: dict.services.list.airport.title },
    { value: "corporate_event", label: dict.services.list.wedding.title },
    { value: "corporate_longterm", label: dict.services.list.corporate.title },
    { value: "vvip_transfer", label: "VVIP Concierge Transfers" },
    { value: "tour_travel", label: "Tourism Services" },
    { value: "destination_management", label: "DMC Services" },
  ];

  const PRICE_OPTIONS: { value: string; label: string }[] = [
    { value: "all", label: "Any budget" },
    { value: "0-180000", label: "Standard" },
    { value: "180000-260000", label: "Premium" },
    { value: "260000-999999", label: "Executive" },
  ];
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterClass, setFilterClass] = useState<VehicleClass | "all">("all");
  const [filterService, setFilterService] = useState<ServiceType | "all">("all");
  const [filterPrice, setFilterPrice] = useState("all");

  useEffect(() => {
    fetch("/api/inventory")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load fleet");
        return r.json();
      })
      .then((data) => {
        setVehicles(data.vehicles ?? []);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      if (filterClass !== "all" && v.vehicleClass !== filterClass) return false;

      if (filterService === "self_drive_rental" && !v.selfDriveEnabled) return false;
      if (filterService === "chauffeured_rental" && !v.chauffeuredEnabled) return false;
      if (filterService === "airport_transfer" && !v.listingTags.includes("airport")) return false;
      if (filterService === "corporate_event" && !v.listingTags.includes("events") && !v.listingTags.includes("conference")) return false;
      if (filterService === "corporate_longterm" && !v.listingTags.includes("corporate")) return false;
      if (filterService === "vvip_transfer" && !v.listingTags.includes("vvip") && !v.listingTags.includes("vip")) return false;
      if (filterService === "tour_travel" && !v.listingTags.includes("tourism") && !v.listingTags.includes("safari")) return false;
      if (filterService === "destination_management" && !v.listingTags.includes("dmc") && !v.listingTags.includes("destination")) return false;

      if (filterPrice !== "all") {
        const [min, max] = filterPrice.split("-").map(Number);
        if (v.dailyRateRwf < min || v.dailyRateRwf > max) return false;
      }

      return true;
    });
  }, [vehicles, filterClass, filterService, filterPrice]);

  const resetFilters = () => {
    setFilterClass("all");
    setFilterService("all");
    setFilterPrice("all");
  };

  const hasActiveFilters = filterClass !== "all" || filterService !== "all" || filterPrice !== "all";
  const activeService = SERVICE_OPTIONS.find((option) => option.value === filterService)?.label ?? "All services";
  const activeClass = CLASS_OPTIONS.find((option) => option.value === filterClass)?.label ?? "All categories";
  const activePrice = PRICE_OPTIONS.find((option) => option.value === filterPrice)?.label ?? "Any budget";

  return (
    <section className={styles.section} id="fleet" aria-labelledby="fleet-heading">
      <div className="container">
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <p className={styles.eyebrow}>{dict.catalog.eyebrow}</p>
            <h2 id="fleet-heading" className={styles.title}>
              {dict.catalog.title1} <span>{dict.catalog.title2}</span>
            </h2>
          </div>
          <p className={styles.headerRight}>
            {dict.catalog.subtitle}
          </p>
        </div>

        <div className={styles.filters} role="group" aria-label="Vehicle filters">
          <div className={styles.filterSummary}>
            <strong>Current view</strong>
            <span>{activeService} / {activeClass} / {activePrice}</span>
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Need</label>
            <div className={styles.chips}>
              {SERVICE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`${styles.chip} ${filterService === opt.value ? styles.chipActive : ""}`}
                  onClick={() => setFilterService(opt.value as ServiceType | "all")}
                  aria-pressed={filterService === opt.value}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Vehicle</label>
              <div className={styles.chips}>
                {CLASS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className={`${styles.chip} ${filterClass === opt.value ? styles.chipActive : ""}`}
                    onClick={() => setFilterClass(opt.value as VehicleClass | "all")}
                    aria-pressed={filterClass === opt.value}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Budget</label>
              <div className={styles.chips}>
                {PRICE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className={`${styles.chip} ${filterPrice === opt.value ? styles.chipActive : ""}`}
                    onClick={() => setFilterPrice(opt.value)}
                    aria-pressed={filterPrice === opt.value}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {hasActiveFilters && (
              <button className={styles.reset} onClick={resetFilters}>
                {dict.catalog.filters.clear}
              </button>
            )}
          </div>
        </div>

        {!loading && !error && (
          <p className={styles.count}>
            {filtered.length} {filtered.length !== 1 ? "vehicles" : "vehicle"}{" "}
            {hasActiveFilters ? dict.catalog.results.match : dict.catalog.results.available}
          </p>
        )}

        {loading ? (
          <div className={styles.grid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard}>
                <div className={`skeleton ${styles.skeletonImg}`} />
                <div className={styles.skeletonBody}>
                  <div className={`skeleton ${styles.skeletonLine}`} style={{ width: "60%" }} />
                  <div className={`skeleton ${styles.skeletonLine}`} style={{ width: "40%" }} />
                  <div className={`skeleton ${styles.skeletonLine}`} style={{ width: "80%", height: "2rem" }} />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className={styles.error} role="alert">
            <p className={styles.errorTitle}>{dict.catalog.results.error}</p>
            <p className={styles.errorSub}>{error}</p>
            <button className={styles.retryBtn} onClick={() => window.location.reload()}>
              {dict.catalog.results.tryAgain}
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty} role="status">
            <p className={styles.emptyTitle}>{dict.catalog.results.noMatch}</p>
            <p className={styles.emptySub}>{dict.catalog.results.tryAdjusting}</p>
            <button className={styles.retryBtn} onClick={resetFilters}>
              {dict.catalog.filters.clear}
            </button>
          </div>
        ) : (
          <div className={styles.grid}>
            {filtered.map((vehicle) => (
              <div key={vehicle.id} id={`vehicle-${vehicle.id}`} className={styles.cardWrapper}>
                <VehicleCard vehicle={vehicle} dict={dict} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
