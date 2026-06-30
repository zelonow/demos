"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { SITE } from "@/config/site";
import type { Vehicle } from "@/types";
import styles from "./Header.module.css";

export default function Header({ dict, lang }: { dict: any; lang: string }) {
  const NAV_LINKS = [
    { label: dict.header.home, href: `/${lang}` },
    { label: dict.header.services, href: `/${lang}/#services` },
    { label: dict.header.fleet, href: `/${lang}/#fleet` },
    { label: dict.header.howItWorks, href: `/${lang}/#how-it-works` },
    { label: dict.header.contact, href: `/${lang}/#contact` },
  ];
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [featuredVehicles, setFeaturedVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const res = await fetch("/api/inventory");
        const data = await res.json();
        if (data.vehicles && data.vehicles.length > 0) {
          setFeaturedVehicles(data.vehicles.slice(0, 3));
        }
      } catch (err) {
        console.error("Failed to load featured vehicles", err);
      }
    }
    loadFeatured();
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
        <div className={`container ${styles.inner}`}>
          {/* Logo */}
          <Link href={`/${lang}`} className={styles.logo} aria-label={SITE.name}>
            <Logo width={260} height={54} className={styles.logoImg} variant="dark" />
          </Link>

          {/* Desktop nav */}
          <nav 
            className={styles.nav} 
            aria-label="Main navigation"
            onMouseLeave={() => setHoveredNav(null)}
          >
            {NAV_LINKS.map((link) => (
              <a 
                key={link.href} 
                href={link.href} 
                className={styles.navLink}
                onMouseEnter={() => {
                  if (link.label === dict.header.services || link.label === dict.header.fleet) {
                    setHoveredNav(link.label);
                  } else {
                    setHoveredNav(null);
                  }
                }}
              >
                {link.label}
              </a>
            ))}

            {/* Mega Menu Dropdown */}
            <div className={`${styles.megaMenu} ${hoveredNav ? styles.megaMenuOpen : ""}`}>
              <div className={`container ${styles.megaMenuInner}`}>
                <div className={styles.megaMenuCol}>
                  <h3 className={styles.megaMenuTitle}>{dict.header.services}</h3>
                  <ul className={styles.megaMenuList}>
                    <li><a href={`/${lang}/#fleet?service=airport_transfer`}>{dict.services.list.airport.title}</a></li>
                    <li><a href={`/${lang}/#fleet?service=wedding_event`}>{dict.services.list.wedding.title}</a></li>
                    <li><a href={`/${lang}/#fleet?service=corporate_longterm`}>{dict.services.list.corporate.title}</a></li>
                    <li><a href={`/${lang}/#fleet?service=vvip_transfer`}>VVIP Concierge Transfers</a></li>
                    <li><a href={`/${lang}/#fleet?service=tour_travel`}>{dict.services.list.leaseToOwn.title}</a></li>
                  </ul>
                </div>
                
                <div className={styles.megaMenuFeatured}>
                  <h3 className={styles.megaMenuTitle}>{dict.header.featuredFleet}</h3>
                  <div className={styles.megaMenuVehicles}>
                    {featuredVehicles.map(v => (
                      <a key={v.id} href={`/${lang}/vehicles/${v.id}`} className={styles.megaVehicle}>
                        <div className={styles.megaVehicleImg}>
                          <Image 
                            src={v.heroImage || v.photoUrl} 
                            alt={v.model}
                            fill
                            className={styles.megaImg}
                          />
                        </div>
                        <span className={styles.megaVehicleName}>{v.make} {v.model}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* Actions */}
          <div className={styles.actions}>
            <a href={SITE.adminUrl} className={styles.teamLogin} target="_blank" rel="noreferrer">
              <span className={styles.loginIcon} aria-hidden>
                <svg viewBox="0 0 24 24" focusable="false">
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M4.8 20c.8-4.1 3.3-6.1 7.2-6.1s6.4 2 7.2 6.1" />
                </svg>
              </span>
              {dict.header.teamLogin}
            </a>
            {/* Hamburger */}
            <button
              className={styles.hamburger}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              <span className={`${styles.bar} ${menuOpen ? styles.barOpen1 : ""}`} />
              <span className={`${styles.bar} ${menuOpen ? styles.barOpen2 : ""}`} />
              <span className={`${styles.bar} ${menuOpen ? styles.barOpen3 : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ""}`}
        aria-hidden={!menuOpen}
      >
        <nav className={styles.drawerNav}>
          {NAV_LINKS.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              className={styles.drawerLink}
              style={{ animationDelay: `${i * 60}ms` }}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            href={`/${lang}/#fleet`}
            className={styles.drawerCta}
            onClick={() => setMenuOpen(false)}
          >
            {dict.header.bookNow}
          </a>
        </nav>
        <div className={styles.drawerFooter}>
          <a href={SITE.adminUrl} className={styles.drawerTeamLogin} target="_blank" rel="noreferrer">
            {dict.header.teamLogin}
          </a>
          <p>{SITE.phone}</p>
          <p>{SITE.email}</p>
        </div>
      </div>

      {/* Overlay */}
      {menuOpen && (
        <div
          className={styles.overlay}
          onClick={() => setMenuOpen(false)}
          aria-hidden
        />
      )}
    </>
  );
}
