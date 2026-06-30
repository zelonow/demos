"use client";

import Image from "next/image";
import { SITE } from "@/config/site";
import styles from "./Hero.module.css";

const categories = [
  { label: "Landcruiser", active: true },
  { label: "Volkswagen", active: false },
  { label: "Vans", active: false },
  { label: "Sedans", active: false },
  { label: "Executive buses", active: false },
] as const;

const highlights = [
  {
    title: "Airport transfers",
    copy: "On-time pickups and seamless arrivals.",
    icon: "plane",
  },
  {
    title: "Corporate events",
    copy: "Reliable mobility for teams and guests.",
    icon: "person",
  },
  {
    title: "Tourism & experiences",
    copy: "Discover Rwanda with comfort and style.",
    icon: "camera",
  },
  {
    title: "VVIP fleet operations",
    copy: "Discretion, safety, and world-class service.",
    icon: "shield",
  },
] as const;

export default function Hero({ dict }: { dict: any }) {
  return (
    <section className={styles.heroShell} aria-label="Vava Transport and Logistics">
      <div className={styles.heroStage}>
        <Image
          src="/vava-assets/hero-landcruiser.jpg"
          alt="Vava Transport black Land Cruisers in Kigali"
          fill
          priority
          sizes="100vw"
          className={styles.heroImage}
        />
        <div className={styles.heroShade} />
        <div className={styles.routeMark} aria-hidden>
          <span className={styles.pin}>
            <MapPinIcon />
          </span>
          <span>Kigali</span>
          <svg viewBox="0 0 280 52" className={styles.routeLine} focusable="false">
            <path d="M0 32 C36 4 58 54 91 25 C132 -10 156 32 198 21 C230 12 251 17 280 6" />
          </svg>
        </div>

        <div className={`container ${styles.heroContent}`}>
          <div className={styles.copyBlock}>
            <h1>{dict.hero.copy.default.title}</h1>
            <p>{dict.hero.copy.default.sub}</p>
            <div className={styles.ctas}>
              <a href="#fleet" className={styles.primary}>
                <span>{dict.header.bookNow}</span>
                <ArrowIcon />
              </a>
              <a href={SITE.adminUrl} className={styles.secondary} target="_blank" rel="noreferrer">
                {dict.header.fleetxDemo}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className={`container ${styles.bookingWrap}`}>
        <form className={styles.bookingPanel} action="#fleet">
          <div className={styles.categoryTabs} aria-label="Vava vehicle categories">
            {categories.map((category) => (
              <a
                key={category.label}
                href="#fleet"
                className={`${styles.categoryTab} ${category.active ? styles.categoryTabActive : ""}`}
              >
                <span>{category.label}</span>
              </a>
            ))}
          </div>

          <div className={styles.fieldGrid}>
            <label className={styles.field}>
              <span>Pickup location</span>
              <div className={styles.control}>
                <MapPinIcon />
                <input name="pickup" placeholder="Where should we pick you up?" />
              </div>
            </label>
            <label className={styles.field}>
              <span>Destination</span>
              <div className={styles.control}>
                <MapPinIcon />
                <input name="destination" placeholder="Where are you going?" />
              </div>
            </label>
            <label className={styles.field}>
              <span>Date</span>
              <div className={styles.control}>
                <CalendarIcon />
                <input name="date" type="text" placeholder="Select date" />
              </div>
            </label>
            <label className={styles.field}>
              <span>Service type</span>
              <div className={styles.control}>
                <select name="service" defaultValue="airport_transfer" aria-label="Service type">
                  <option value="airport_transfer">Airport Transfer</option>
                  <option value="corporate_event">Corporate Event</option>
                  <option value="vvip_transfer">VVIP Transfer</option>
                  <option value="tour_travel">Tourism Services</option>
                  <option value="destination_management">DMC Services</option>
                </select>
              </div>
            </label>
            <button type="submit" className={styles.continue}>
              <span>Continue</span>
              <ArrowIcon />
            </button>
          </div>

          <div className={styles.assurance}>
            <span><CheckIcon />24/7 Operations</span>
            <span>Professional Drivers</span>
            <span>On-time Guarantee</span>
          </div>
        </form>
      </div>

      <div className={`container ${styles.journeyIntro}`}>
        <div className={styles.introCopy}>
          <p>Rwanda. Our Home.</p>
          <h2>Premium transport for every journey</h2>
        </div>
        <div className={styles.highlights}>
          {highlights.map((item) => (
            <div className={styles.highlight} key={item.title}>
              <span className={styles.highlightIcon}>
                <ServiceIcon type={item.icon} />
              </span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceIcon({ type }: { type: string }) {
  if (type === "plane") {
    return <svg viewBox="0 0 24 24"><path d="M3 11.5 21 4l-7.5 17-3.2-7.3L3 11.5Z" /><path d="m10.3 13.7 4.8-4.8" /></svg>;
  }
  if (type === "person") {
    return <svg viewBox="0 0 24 24"><circle cx="12" cy="7" r="3.2" /><path d="M5 20c.9-4.4 3.2-6.5 7-6.5s6.1 2.1 7 6.5" /></svg>;
  }
  if (type === "camera") {
    return <svg viewBox="0 0 24 24"><path d="M4 8h4l1.6-2h4.8L16 8h4v11H4V8Z" /><circle cx="12" cy="13.5" r="3.2" /></svg>;
  }
  return <svg viewBox="0 0 24 24"><path d="M12 3 5 6v5.5c0 4.2 2.5 7.2 7 9.5 4.5-2.3 7-5.3 7-9.5V6l-7-3Z" /><path d="M12 8v5l3-1.5" /></svg>;
}

function MapPinIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden focusable="false"><path d="M12 22s7-5.2 7-12a7 7 0 1 0-14 0c0 6.8 7 12 7 12Z" /><circle cx="12" cy="10" r="2.3" /></svg>;
}

function CalendarIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden focusable="false"><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /></svg>;
}

function ArrowIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden focusable="false"><path d="M5 12h14M13 5l7 7-7 7" /></svg>;
}

function CheckIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden focusable="false"><path d="m5 12 4 4L19 6" /></svg>;
}
