"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { SITE } from "@/config/site";
import { getDictionary } from "@/i18n/getDictionary";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import styles from "./page.module.css";

function ConfirmationContent({ lang, dict }: { lang: string, dict: any }) {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session") ?? "—";
  const requestId = searchParams.get("ref") ?? "—";
  const status = searchParams.get("status") ?? "pending";
  const manageUrl = searchParams.get("manage");
  const emailMode = searchParams.get("email");
  const emailMessage =
    emailMode === "resend"
      ? "A confirmation email has been sent with your private status link."
      : emailMode === "mock"
        ? "Demo email preview generated. In production, the requester receives this private status link by email."
        : "A confirmation message can be sent with the private status link.";

  return (
    <main className={styles.main}>
      <div className={`container ${styles.center}`}>
        {/* Check icon */}
        <div className={styles.icon} aria-hidden>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="23" stroke="currentColor" strokeWidth="2"/>
            <path d="M14 24l7 7 13-14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h1 className={styles.title}>Request Received</h1>

        <p className={styles.message}>
          We've sent your transport request to the Vava operations team.
          You'll receive a confirmation call or message shortly.
        </p>

        <div className={styles.emailNotice}>
          <strong>Confirmation email</strong>
          <span>{emailMessage}</span>
        </div>

        {/* Reference box */}
        <div className={styles.refBox}>
          <div className={styles.refRow}>
            <span className={styles.refLabel}>Session Reference</span>
            <code className={styles.refVal}>{sessionId}</code>
          </div>
          <div className={styles.refRow}>
            <span className={styles.refLabel}>Request ID</span>
            <code className={styles.refVal}>{requestId}</code>
          </div>
          <div className={styles.refRow}>
            <span className={styles.refLabel}>Status</span>
            <span className={styles.statusBadge}>{status.replace(/_/g, " ")}</span>
          </div>
        </div>

        {manageUrl && (
          <div className={styles.secureLink}>
            <div>
              <h2>Private request link</h2>
              <p>
                Keep this link private. It lets the requester check status and see whether Vava needs extra trip details later.
              </p>
            </div>
            <Link href={manageUrl} className={styles.ctaPrimary}>View Status</Link>
          </div>
        )}

        {/* What happens next */}
        <div className={styles.nextSteps}>
          <h2 className={styles.nextTitle}>What Happens Next</h2>
          <ol className={styles.nextList}>
            <li>Our team reviews availability, routing, and vehicle fit</li>
            <li>We confirm timing, route details, and final price by phone or email</li>
            <li>You receive final pickup instructions and vehicle details</li>
            <li>Passenger, driver, or protocol details are collected later only if needed</li>
          </ol>
        </div>

        <div className={styles.contact}>
          <p>Questions? Contact us at</p>
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
          <span>or</span>
          <a href={`tel:${SITE.phone.replace(/\s/g, "")}`}>{SITE.phone}</a>
        </div>

        <div className={styles.ctas}>
          <Link href={`/${lang}/#fleet`} className={styles.ctaSecondary}>Browse More Vehicles</Link>
          <Link href={`/${lang}`} className={styles.ctaPrimary}>Back to Home</Link>
        </div>
      </div>
    </main>
  );
}

export default async function ConfirmationPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = getDictionary(lang);

  return (
    <>
      <Header dict={dict} lang={lang} />
      <Suspense fallback={<div className={styles.loading}>Loading…</div>}>
        <ConfirmationContent lang={lang} dict={dict} />
      </Suspense>
      <Footer dict={dict} />
    </>
  );
}
