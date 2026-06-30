"use client";

import { FormEvent, useState } from "react";
import type { Vehicle } from "@/types";
import { formatRwf } from "@/lib/utils";
import styles from "./Assistant.module.css";

type AssistantResponse = {
  answer: string;
  suggestedVehicles?: Vehicle[];
  nextAction?: {
    label?: string;
    vehicleId?: string;
  } | null;
};

export default function Assistant() {
  const [message, setMessage] = useState("I need an airport transfer SUV tomorrow morning.");
  const [response, setResponse] = useState<AssistantResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Assistant request failed");
      }
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Assistant request failed");
    } finally {
      setLoading(false);
    }
  }

  const vehicles = response?.suggestedVehicles?.slice(0, 3) ?? [];

  return (
    <section className={styles.section} id="assistant" aria-labelledby="assistant-heading">
      <div className={`container ${styles.shell}`}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Fleet assistant</p>
          <h2 id="assistant-heading" className={styles.title}>Find the right Vava vehicle faster</h2>
          <p className={styles.subtitle}>
            Ask for a route, group size, service type, or budget. The assistant only uses public fleet inventory and sends bookings through the normal booking flow.
          </p>
        </div>

        <div className={styles.panel}>
          <form className={styles.form} onSubmit={submit}>
            <textarea
              className={styles.input}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              aria-label="Assistant request"
            />
            <button className={styles.submit} type="submit" disabled={loading}>
              {loading ? "Checking..." : "Ask assistant"}
            </button>
          </form>

          {error ? <p className={styles.error}>{error}</p> : null}

          {response ? (
            <div className={styles.answer}>
              <p className={styles.answerText}>{response.answer}</p>
              {vehicles.length > 0 ? (
                <div className={styles.suggestions}>
                  {vehicles.map((vehicle) => (
                    <div className={styles.suggestion} key={vehicle.id}>
                      <p className={styles.vehicleName}>{vehicle.make} {vehicle.model}</p>
                      <p className={styles.vehicleMeta}>
                        {vehicle.seats} seats · {formatRwf(vehicle.dailyRateRwf)}/day
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
              {response.nextAction ? (
                <a className={styles.cta} href={response.nextAction.vehicleId ? `#vehicle-${response.nextAction.vehicleId}` : "#fleet"}>
                  {response.nextAction.label || "Continue to booking"}
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
