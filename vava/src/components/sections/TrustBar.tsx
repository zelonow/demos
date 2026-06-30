import styles from "./TrustBar.module.css";

const PROOFS = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="m9 12 2 2 4-4"/>
      </svg>
    ),
    title: "Safety-led fleet operations",
    desc: "Vehicles are inspected, cleaned, and prepared before every airport, event, or tourism movement.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v10l5 3"/><circle cx="12" cy="12" r="10"/>
      </svg>
    ),
    title: "Clear operating terms",
    desc: "Daily rate, deposit, mileage limit, and service mode are visible before the request is sent.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m22 4-10 10-3-3"/>
      </svg>
    ),
    title: "FleetX-backed review",
    desc: "Requests can become FleetX rental sessions for review, confirmation, payment proof, and handover.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
      </svg>
    ),
    title: "Conference-ready logistics",
    desc: "Built for airport pickups, VVIP transfers, corporate events, tourism routes, and DMC coordination.",
  },
];

const TESTIMONIALS = [
  {
    quote: "Booked a Land Cruiser for a Rwanda tourism route. The vehicle was ready on time and the journey felt fully handled.",
    author: "Amara K.",
    location: "Nairobi, Kenya",
  },
  {
    quote: "Used Vava for a corporate client visit. Chauffeur was professional, punctual, and the vehicle was pristine.",
    author: "Jean-Baptiste M.",
    location: "Kigali, Rwanda",
  },
  {
    quote: "Airport pickup was smooth, the driver was waiting, and the transfer was easy after a long flight.",
    author: "Sarah T.",
    location: "London, UK",
  },
];

export default function TrustBar() {
  return (
    <section className={styles.section} aria-labelledby="trust-heading">
      <div className="container">
        {/* Proof points */}
        <div className={styles.header}>
          <p className={styles.eyebrow}>Why Vava</p>
          <h2 id="trust-heading" className={styles.title}>Built for reliable movement</h2>
        </div>

        <div className={styles.proofs}>
          {PROOFS.map((p) => (
            <div key={p.title} className={styles.proof}>
              <div className={styles.proofIcon}>{p.icon}</div>
              <h3 className={styles.proofTitle}>{p.title}</h3>
              <p className={styles.proofDesc}>{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className={styles.testimonials}>
          <p className={styles.testimonialsLabel}>What our clients say</p>
          <div className={styles.testimonialsGrid}>
            {TESTIMONIALS.map((t, i) => (
              <blockquote key={i} className={styles.testimonial}>
                <p className={styles.quote}>"{t.quote}"</p>
                <footer className={styles.testimonialMeta}>
                  <strong>{t.author}</strong>
                  <span>{t.location}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
