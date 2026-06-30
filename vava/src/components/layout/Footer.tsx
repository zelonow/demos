import Logo from "@/components/ui/Logo";
import { SITE } from "@/config/site";
import styles from "./Footer.module.css";

export default function Footer({ dict }: { dict: any }) {
  const FAQ = dict.footer.faq.items;

  return (
    <footer className={styles.footer} id="contact">
      {/* Main footer grid */}
      <div className={`container ${styles.grid}`}>
        {/* Brand column */}
        <div className={styles.brand}>
          <Logo width={280} height={70} className={styles.logo} variant="light" />
          <p className={styles.tagline}>{SITE.tagline}</p>
          <p className={styles.meta}>
            Premium transport, tourism, and event mobility in {SITE.city}, {SITE.country}.
          </p>

          {/* Social */}
          <div className={styles.social}>
            {SITE.socialLinks.instagram && (
              <a href={SITE.socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <SvgInstagram />
              </a>
            )}
            {SITE.socialLinks.facebook && (
              <a href={SITE.socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <SvgFacebook />
              </a>
            )}
            {SITE.socialLinks.twitter && (
              <a href={SITE.socialLinks.twitter} target="_blank" rel="noopener noreferrer" aria-label="X / Twitter">
                <SvgTwitter />
              </a>
            )}
          </div>
        </div>

        {/* Contact column */}
        <div className={styles.contact}>
          <h3 className={styles.colTitle}>{dict.header.contact}</h3>
          <ul className={styles.contactList}>
            <li>
              <span className={styles.contactLabel}>{dict.footer.contact.phone}</span>
              <a href={`tel:${SITE.phone.replace(/\s/g, "")}`}>{SITE.phone}</a>
            </li>
            <li>
              <span className={styles.contactLabel}>{dict.footer.contact.whatsapp}</span>
              <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener noreferrer">
                {dict.footer.contact.chat}
              </a>
            </li>
            <li>
              <span className={styles.contactLabel}>{dict.footer.contact.email}</span>
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </li>
            <li>
              <span className={styles.contactLabel}>{dict.footer.contact.address}</span>
              <span>{SITE.address}</span>
            </li>
            <li>
              <span className={styles.contactLabel}>{dict.footer.contact.hours}</span>
              <span>{SITE.hours}</span>
            </li>
          </ul>
        </div>

        {/* Quick links */}
        <div className={styles.links}>
          <h3 className={styles.colTitle}>Quick Links</h3>
          <ul className={styles.linkList}>
            <li><a href="/#fleet">{dict.header.fleet}</a></li>
            <li><a href="/#services">{dict.header.services}</a></li>
            <li><a href="/#how-it-works">{dict.header.howItWorks}</a></li>
            <li><a href="/#contact">{dict.header.contact}</a></li>
          </ul>
        </div>

        {/* FAQ column */}
        <div className={styles.faq}>
          <h3 className={styles.colTitle}>{dict.footer.faq.title}</h3>
          <div className={styles.faqList}>
            {FAQ.map((item: any, i: number) => (
              <details key={i} className={styles.faqItem}>
                <summary className={styles.faqQ}>{item.q}</summary>
                <p className={styles.faqA}>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className={`container ${styles.bottom}`}>
        <div className={styles.bottomLeft}>
          <p>
            © {new Date().getFullYear()} {SITE.name}. {dict.footer.rights}{" "}
            <span className={styles.taglineInline}>{SITE.tagline}</span>
          </p>
          <p className={styles.poweredBy}>
            Powered by Zelo FleetX{" "}
            <span style={{ margin: "0 8px", color: "var(--gray-600)" }}>|</span>{" "}
            {dict.footer.builtBy}{" "}
            <a
              href="https://theunscripted.xyz"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "underline", color: "var(--gray-300)" }}
            >
              Unscripted
            </a>
          </p>
        </div>
        <div className={styles.adminLinks}>
          <a
            href={SITE.adminUrl}
            className={styles.staffLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            Staff Login / FleetX demo →
          </a>
        </div>
      </div>
    </footer>
  );
}

function SvgInstagram() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
    </svg>
  );
}

function SvgFacebook() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}

function SvgTwitter() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}
