import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SITE } from "@/config/site";
import { getDictionary } from "@/i18n/getDictionary";
import { verifyRequestAccessToken } from "@/lib/request-access";
import { formatDate, serviceTypeLabel } from "@/lib/utils";
import styles from "./page.module.css";

interface Props {
  params: Promise<{ lang: string; token: string }>;
}

export default async function RequestStatusPage({ params }: Props) {
  const { lang, token } = await params;
  const dict = getDictionary(lang);
  const request = verifyRequestAccessToken(token);

  if (!request) notFound();

  const documentsRequested = request.status === "documents_required";

  return (
    <>
      <Header dict={dict} lang={lang} />
      <main className={styles.main}>
        <div className={`container ${styles.layout}`}>
          <section className={styles.hero}>
            <p className={styles.eyebrow}>Private request link</p>
            <h1 className={styles.title}>Request status</h1>
            <p className={styles.subtitle}>
              This page is available only through the secure link sent to the requester.
              Use it to follow status updates and see whether Vava needs extra details.
            </p>
          </section>

          <section className={styles.statusCard}>
            <div>
              <span className={styles.label}>Current status</span>
              <strong className={styles.status}>{request.status.replace(/_/g, " ")}</strong>
            </div>
            <div>
              <span className={styles.label}>Request ID</span>
              <code className={styles.code}>{request.requestId}</code>
            </div>
            <div>
              <span className={styles.label}>Session</span>
              <code className={styles.code}>{request.sessionId}</code>
            </div>
          </section>

          <section className={styles.grid}>
            <div className={styles.panel}>
              <h2>Trip summary</h2>
              <dl className={styles.rows}>
                <div><dt>Requester</dt><dd>{request.customerName}</dd></div>
                <div><dt>Vehicle</dt><dd>{request.vehicleLabel}</dd></div>
                <div><dt>Service</dt><dd>{serviceTypeLabel(request.serviceType)}</dd></div>
                <div><dt>Pickup date</dt><dd>{formatDate(request.startsAt)}</dd></div>
                <div><dt>Return date</dt><dd>{formatDate(request.endsAt)}</dd></div>
                <div><dt>Pickup</dt><dd>{request.pickupLocation}</dd></div>
                <div><dt>Destination</dt><dd>{request.dropoffLocation}</dd></div>
              </dl>
            </div>

            <div className={styles.panel}>
              <h2>Documents & details</h2>
              {documentsRequested ? (
                <div className={styles.documentBox}>
                  <p>Vava has requested extra details for this trip.</p>
                  <ul>
                    <li>Requester identification</li>
                    <li>Driver details if this becomes self-drive</li>
                    <li>Passenger or protocol notes if needed</li>
                  </ul>
                  <a className={styles.primaryBtn} href={`mailto:${SITE.email}?subject=Documents for ${request.requestId}`}>
                    Send documents to Vava
                  </a>
                </div>
              ) : (
                <div className={styles.documentBox}>
                  <p>No documents are required right now.</p>
                  <p className={styles.muted}>
                    If the operator needs passenger, driver, or protocol details, this page will show the request and the email will link back here.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className={styles.nextSteps}>
            <h2>What happens next</h2>
            <ol>
              <li>Vava operations reviews route, vehicle fit, and timing.</li>
              <li>The requester receives a call, WhatsApp message, or email update.</li>
              <li>If more details are needed, this private page becomes the collection point.</li>
            </ol>
          </section>

          <div className={styles.actions}>
            <Link href={`/${lang}/#fleet`} className={styles.secondaryBtn}>Browse fleet</Link>
            <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className={styles.primaryBtn}>Call Vava</a>
          </div>
        </div>
      </main>
      <Footer dict={dict} />
    </>
  );
}
