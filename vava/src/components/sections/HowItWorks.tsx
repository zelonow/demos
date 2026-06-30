"use client";
import { useState } from "react";
import styles from "./HowItWorks.module.css";

export default function HowItWorks({ dict }: { dict: any }) {
  const [mode, setMode] = useState<"rental" | "lease">("rental");
  const steps = mode === "rental" ? dict.howItWorks.rentalSteps : dict.howItWorks.leaseSteps;

  return (
    <section className={styles.section} id="how-it-works" aria-labelledby="hiw-heading">
      <div className="container">
        <div className={styles.headerRow}>
          <div className={styles.header}>
            <p className={styles.eyebrow}>{dict.howItWorks.eyebrow}</p>
            <h2 id="hiw-heading" className={styles.title}>
              {dict.howItWorks.title1}<br />
              <span>{dict.howItWorks.title2}</span>
            </h2>
          </div>
          
          <div className={styles.toggleGroup}>
            <button 
              className={`${styles.toggleBtn} ${mode === "rental" ? styles.active : ""}`}
              onClick={() => setMode("rental")}
            >
              {dict.howItWorks.rentalTab}
            </button>
            <button 
              className={`${styles.toggleBtn} ${mode === "lease" ? styles.active : ""}`}
              onClick={() => setMode("lease")}
            >
              {dict.howItWorks.leaseTab}
            </button>
          </div>
        </div>

        <div className={styles.steps}>
          {steps.map((step: any, i: number) => (
            <div key={step.num + mode} className={styles.step}>
              <div className={styles.numWrap}>
                <span className={styles.num}>{step.num}</span>
                {i < steps.length - 1 && <span className={styles.connector} aria-hidden />}
              </div>
              <div className={styles.body}>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.cta}>
          <a href="#fleet" className={styles.ctaBtn}>
            {mode === "rental" ? dict.howItWorks.ctaRental : dict.howItWorks.ctaLease}
          </a>
        </div>
      </div>
    </section>
  );
}
