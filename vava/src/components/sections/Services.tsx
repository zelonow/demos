import styles from "./Services.module.css";

export default function Services({ dict }: { dict: any }) {
  const SERVICES = [
    {
      id: "self_drive_rental",
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="24" r="3"/><circle cx="24" cy="24" r="3"/>
          <path d="M5 24H2V16l4-8h18l3 8v8h-3M11 24h10M2 16h28"/>
          <circle cx="16" cy="12" r="2"/>
        </svg>
      ),
      title: dict.services.list.selfDrive.title,
      description: dict.services.list.selfDrive.desc,
      filter: "self_drive_rental",
    },
    {
      id: "chauffeured_rental",
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="16" cy="8" r="4"/>
          <path d="M8 28v-4a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v4"/>
          <path d="M4 28h24"/>
          <circle cx="7" cy="23" r="2"/><circle cx="25" cy="23" r="2"/>
          <path d="M9 23h14"/>
        </svg>
      ),
      title: dict.services.list.chauffeured.title,
      description: dict.services.list.chauffeured.desc,
      filter: "chauffeured_rental",
    },
    {
      id: "airport_transfer",
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 28h24M16 4v14M10 18l6 6 6-6M20 10l6-2-2 6"/>
        </svg>
      ),
      title: dict.services.list.airport.title,
      description: dict.services.list.airport.desc,
      filter: "airport_transfer",
    },
    {
      id: "corporate_event",
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 6l2 5h5l-4 3 1.5 5L16 16l-4.5 3 1.5-5-4-3h5z"/>
          <circle cx="16" cy="16" r="12"/>
        </svg>
      ),
      title: dict.services.list.wedding.title,
      description: dict.services.list.wedding.desc,
      filter: "corporate_event",
    },
    {
      id: "corporate_longterm",
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="10" width="24" height="18" rx="2"/>
          <path d="M10 10V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3"/>
          <path d="M4 18h24M12 18v6M20 18v6"/>
        </svg>
      ),
      title: dict.services.list.corporate.title,
      description: dict.services.list.corporate.desc,
      filter: "corporate_longterm",
    },
    {
      id: "destination_management",
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="m9 12 2 2 4-4"/>
        </svg>
      ),
      title: dict.services.list.leaseToOwn.title,
      description: dict.services.list.leaseToOwn.desc,
      filter: "destination_management",
    },
  ];

  return (
    <section className={styles.section} id="services" aria-labelledby="services-heading">
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <p className={styles.eyebrow}>{dict.services.eyebrow}</p>
          <h2 id="services-heading" className={styles.title}>
            {dict.services.title1}<br />
            <span>{dict.services.title2}</span>
          </h2>
          <p className={styles.subtitle}>
            {dict.services.subtitle}
          </p>
        </div>

        {/* Cards */}
        <div className={styles.grid}>
          {SERVICES.map((svc, i) => (
            <a
              key={svc.id}
              href={`/#fleet?service=${svc.filter}`}
              className={styles.card}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className={styles.icon}>{svc.icon}</div>
              <h3 className={styles.cardTitle}>{svc.title}</h3>
              <p className={styles.cardDesc}>{svc.description}</p>
              <span className={styles.cardLink}>
                {dict.services.browse} <span aria-hidden>→</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
