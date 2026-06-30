"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { ServiceType, Vehicle } from "@/types";
import { formatRwf, diffDays, calcTotalPrice, minBookingDate, serviceTypeLabel } from "@/lib/utils";
import { SITE } from "@/config/site";
import styles from "./BookingFlow.module.css";

declare global {
  interface Window {
    google?: any;
    __vavaGoogleMapsPromise?: Promise<any>;
  }
}

interface BookingState {
  serviceType: BookingServiceType | "";
  travelMode: "chauffeured_rental" | "self_drive_rental";
  startDate: string;
  endDate: string;
  pickupLocation: string;
  dropoffLocation: string;
  customerName: string;
  phone: string;
  email: string;
  organizationName: string;
  passengerCount: string;
  notes: string;
  acceptedRequestTerms: boolean;
}

const INITIAL_STATE: BookingState = {
  serviceType: "airport_transfer",
  travelMode: "chauffeured_rental",
  startDate: "",
  endDate: "",
  pickupLocation: "",
  dropoffLocation: "",
  customerName: "",
  phone: "",
  email: "",
  organizationName: "",
  passengerCount: "1",
  notes: "",
  acceptedRequestTerms: false,
};

const STEPS = ["Trip details", "Contact", "Review & submit"];

type BookingServiceType = Extract<
  ServiceType,
  "airport_transfer" | "corporate_event" | "corporate_longterm" | "vvip_transfer" | "tour_travel" | "destination_management"
>;

const SERVICE_OPTIONS: Array<{ value: BookingServiceType; title: string; desc: string }> = [
  { value: "airport_transfer", title: "Airport Transfer", desc: "Arrivals, departures, hotel transfers, and VIP meet-and-greet." },
  { value: "corporate_event", title: "Conference / Event", desc: "Delegation movement, summit shuttles, and guest transport." },
  { value: "corporate_longterm", title: "Corporate Fleet", desc: "Business mobility programs and recurring staff transport." },
  { value: "vvip_transfer", title: "VVIP Concierge", desc: "Discreet protocol transfers with premium vehicles and drivers." },
  { value: "tour_travel", title: "Tourism Services", desc: "Rwanda and Uganda tours, safari routes, and guided experiences." },
  { value: "destination_management", title: "DMC Services", desc: "Airport, hotel, venue, excursion, and route coordination." },
];

const ROUTE_FIELDS: Record<BookingServiceType, {
  intro: string;
  pickupLabel: string;
  pickupPlaceholder: string;
  pickupHint: string;
  dropoffLabel: string;
  dropoffPlaceholder: string;
  dropoffHint: string;
}> = {
  airport_transfer: {
    intro: "Airport transfers need a pickup point and final drop-off. Add flight details later in notes if available.",
    pickupLabel: "Pickup Location",
    pickupPlaceholder: "Airport, hotel, office, or home pickup",
    pickupHint: "Airport, hotel, office, or residence.",
    dropoffLabel: "Destination",
    dropoffPlaceholder: "Where should Vava drop the passenger?",
    dropoffHint: "Final destination for the transfer.",
  },
  corporate_event: {
    intro: "Conference and event requests need the dispatch base plus the venue, hotel, or movement route.",
    pickupLabel: "Dispatch / Pickup Point",
    pickupPlaceholder: "Hotel, office, airport, or staging point",
    pickupHint: "Where guests or vehicles should start from.",
    dropoffLabel: "Venue / Route",
    dropoffPlaceholder: "Venue, hotel circuit, or event route",
    dropoffHint: "Main venue or movement route for the event.",
  },
  corporate_longterm: {
    intro: "Corporate fleet requests need the operating base and primary coverage area for planning.",
    pickupLabel: "Operating Base",
    pickupPlaceholder: "Company office, staff pickup zone, or depot",
    pickupHint: "The normal starting point for the fleet program.",
    dropoffLabel: "Coverage Area",
    dropoffPlaceholder: "Office route, city zone, or recurring destination",
    dropoffHint: "Primary route, district, or destination pattern.",
  },
  vvip_transfer: {
    intro: "VVIP transfers need an exact pickup point and destination so operations can coordinate protocol and timing.",
    pickupLabel: "Protocol Pickup",
    pickupPlaceholder: "Airport VIP, hotel, residence, or meeting point",
    pickupHint: "Exact pickup point for protocol coordination.",
    dropoffLabel: "Protocol Destination",
    dropoffPlaceholder: "Hotel, venue, residence, or meeting location",
    dropoffHint: "Exact destination or movement route.",
  },
  tour_travel: {
    intro: "Tourism requests need a starting point and itinerary or destination area. Detailed stops can go in notes.",
    pickupLabel: "Tour Start Point",
    pickupPlaceholder: "Hotel, airport, lodge, or city pickup",
    pickupHint: "Where the tour starts.",
    dropoffLabel: "Itinerary / Destination",
    dropoffPlaceholder: "Akagera, Volcanoes, Nyungwe, city tour, etc.",
    dropoffHint: "Main destination, itinerary, or route summary.",
  },
  destination_management: {
    intro: "DMC requests need the guest arrival or coordination base plus the venue, hotel, or program route.",
    pickupLabel: "Arrival / Coordination Base",
    pickupPlaceholder: "Airport, hotel, venue, or DMC desk",
    pickupHint: "Where Vava should coordinate guest movement from.",
    dropoffLabel: "Program Route",
    dropoffPlaceholder: "Hotel block, venue, excursion, or route",
    dropoffHint: "Program destination, venue, or route summary.",
  },
};

function waitForGooglePlaces(resolve: (value: any) => void, reject: (reason: Error) => void, startedAt = Date.now()) {
  if (window.google?.maps?.places) {
    resolve(window.google);
    return;
  }

  if (Date.now() - startedAt > 15000) {
    reject(new Error("Google Places did not become available"));
    return;
  }

  window.setTimeout(() => waitForGooglePlaces(resolve, reject, startedAt), 100);
}

function loadGoogleMaps(apiKey: string) {
  if (typeof window === "undefined" || !apiKey) return Promise.resolve(null);
  if (window.google?.maps?.places) return Promise.resolve(window.google);
  if (window.__vavaGoogleMapsPromise) return window.__vavaGoogleMapsPromise;

  window.__vavaGoogleMapsPromise = new Promise((resolve, reject) => {
    const existingScript = Array.from(document.scripts).find((script) => script.src.includes("maps.googleapis.com/maps/api/js"));
    if (existingScript) {
      waitForGooglePlaces(resolve, reject);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => waitForGooglePlaces(resolve, reject);
    script.onerror = () => reject(new Error("Google Maps failed to load"));
    document.head.appendChild(script);
  });

  return window.__vavaGoogleMapsPromise;
}

function LocationInput({
  id,
  label,
  value,
  placeholder,
  helper,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  helper: string;
  onChange: (value: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  const [mapsReady, setMapsReady] = useState(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== value) {
      inputRef.current.value = value;
    }
  }, [value]);

  useEffect(() => {
    let listener: { remove?: () => void } | null = null;
    let cancelled = false;

    loadGoogleMaps(SITE.googleMapsApiKey)
      .then((google) => {
        if (cancelled || !google?.maps?.places || !inputRef.current) return;
        const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: ["rw"] },
          fields: ["formatted_address", "name", "place_id", "geometry"],
        });
        autocompleteRef.current = autocomplete;
        listener = autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          const nextValue = place.formatted_address || place.name || inputRef.current?.value || "";
          if (inputRef.current) inputRef.current.value = nextValue;
          onChangeRef.current(nextValue);
        });
        setMapsReady(true);
      })
      .catch(() => setMapsReady(false));

    return () => {
      cancelled = true;
      listener?.remove?.();
    };
  }, []);

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>{label}</label>
      <input
        ref={inputRef}
        id={id}
        type="text"
        className={styles.input}
        placeholder={placeholder}
        value={value}
        autoComplete="off"
        onBlur={(event) => {
          const selectedPlace = autocompleteRef.current?.getPlace?.();
          const nextValue = selectedPlace?.formatted_address || selectedPlace?.name || event.currentTarget.value;
          onChangeRef.current(nextValue);
        }}
        onChange={(event) => onChangeRef.current(event.target.value)}
      />
      <span className={styles.routeHint}>{helper}</span>
      <span className={styles.fieldHint}>
        {mapsReady ? "Google Places search active for Rwanda." : "Type the location manually. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable map search."}
      </span>
    </div>
  );
}

export default function BookingFlow({ vehicle, lang }: { vehicle: Vehicle; lang: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [state, setState] = useState<BookingState>(() => ({
    ...INITIAL_STATE,
    travelMode: vehicle.chauffeuredEnabled ? "chauffeured_rental" : "self_drive_rental",
  }));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (patch: Partial<BookingState>) => setState((prev) => ({ ...prev, ...patch }));

  const startD = state.startDate ? new Date(state.startDate) : null;
  const endD = state.endDate ? new Date(state.endDate) : null;
  const days = startD && endD ? diffDays(startD, endD) : 0;
  const totalPrice = days > 0 ? calcTotalPrice(vehicle.dailyRateRwf, startD!, endD!) : 0;
  const contactProvided = state.phone.trim().length > 6 || state.email.includes("@");
  const selectedService: BookingServiceType = state.serviceType || "airport_transfer";
  const routeFields = useMemo(() => ROUTE_FIELDS[selectedService], [selectedService]);

  const requestNotes = [
    state.organizationName.trim() ? `Organization: ${state.organizationName.trim()}` : "",
    state.passengerCount.trim() ? `Passengers: ${state.passengerCount.trim()}` : "",
    `Preferred mode: ${serviceTypeLabel(state.travelMode)}`,
    state.notes.trim(),
  ].filter(Boolean).join("\n");

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "enterprise_white_label",
          lang,
          serviceType: state.serviceType,
          vehicleId: vehicle.id,
          customerName: state.customerName,
          phone: state.phone,
          email: state.email,
          startsAt: new Date(state.startDate).toISOString(),
          endsAt: new Date(state.endDate).toISOString(),
          pickupLocation: state.pickupLocation,
          dropoffLocation: state.dropoffLocation,
          depositAmountRwf: 0,
          proofAmountRwf: 0,
          requireDepositProof: false,
          paymentMethod: "",
          paymentReference: "",
          payerPhone: "",
          proofFileUrl: "",
          proofFileName: "",
          proofStorageKey: "",
          proofViewUrl: "",
          notes: requestNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      const params = new URLSearchParams({
        session: data.sessionId,
        ref: data.requestId,
        status: data.status,
      });
      if (data.accessUrl) params.set("manage", data.accessUrl);
      if (data.email?.mode) params.set("email", data.email.mode);
      router.push(`/${lang}/confirmation?${params.toString()}`);
    } catch (e: any) {
      setError(e.message);
      setSubmitting(false);
    }
  };

  const canAdvanceStep1 =
    state.serviceType &&
    state.startDate &&
    state.endDate &&
    days > 0 &&
    state.pickupLocation.trim().length > 2 &&
    state.dropoffLocation.trim().length > 2;

  const canAdvanceStep2 = state.customerName.trim().length > 1 && contactProvided;
  const canAdvanceStep3 = state.acceptedRequestTerms;
  const canSubmit = canAdvanceStep3 && !submitting;

  return (
    <div className={styles.flow}>
      <div className={styles.progress} role="list" aria-label="Booking steps">
        {STEPS.map((label, i) => (
          <div
            key={label}
            role="listitem"
            className={`${styles.step} ${i === step ? styles.stepActive : ""} ${i < step ? styles.stepDone : ""}`}
          >
            <div className={styles.stepDot}>
              {i < step ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <span>{i + 1}</span>
              )}
            </div>
            <span className={styles.stepLabel}>{label}</span>
          </div>
        ))}
      </div>

      <div className={styles.panel}>
        {step === 0 && (
          <div className={styles.stepContent}>
            <h2 className={styles.panelTitle}>Trip Details</h2>
            <p className={styles.panelSub}>Choose the service and route. Vava will confirm availability, final timing, and next steps.</p>

            <div className={styles.serviceOptions}>
              {SERVICE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`${styles.serviceOpt} ${state.serviceType === option.value ? styles.serviceOptActive : ""}`}
                >
                  <input
                    type="radio"
                    name="service"
                    value={option.value}
                    checked={state.serviceType === option.value}
                    onChange={() => update({ serviceType: option.value })}
                    className={styles.radioHidden}
                  />
                  <div className={styles.serviceOptInner}>
                    <strong>{option.title}</strong>
                    <span>{option.desc}</span>
                  </div>
                </label>
              ))}
            </div>

            <div className={styles.routeContext}>
              {routeFields.intro}
            </div>

            <div className={styles.modeOptions}>
              {vehicle.chauffeuredEnabled && (
                <label className={`${styles.modeOpt} ${state.travelMode === "chauffeured_rental" ? styles.modeOptActive : ""}`}>
                  <input type="radio" name="mode" value="chauffeured_rental" checked={state.travelMode === "chauffeured_rental"} onChange={() => update({ travelMode: "chauffeured_rental" })} />
                  <span>Chauffeured</span>
                </label>
              )}
              {vehicle.selfDriveEnabled && (
                <label className={`${styles.modeOpt} ${state.travelMode === "self_drive_rental" ? styles.modeOptActive : ""}`}>
                  <input type="radio" name="mode" value="self_drive_rental" checked={state.travelMode === "self_drive_rental"} onChange={() => update({ travelMode: "self_drive_rental" })} />
                  <span>Self-drive inquiry</span>
                </label>
              )}
            </div>

            <div className={styles.dateRow}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="startDate">Pickup Date</label>
                <input
                  id="startDate"
                  type="date"
                  className={styles.input}
                  value={state.startDate}
                  min={minBookingDate()}
                  onInput={(e) => update({ startDate: e.currentTarget.value })}
                  onChange={(e) => update({ startDate: e.target.value })}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="endDate">Return Date</label>
                <input
                  id="endDate"
                  type="date"
                  className={styles.input}
                  value={state.endDate}
                  min={state.startDate || minBookingDate()}
                  onInput={(e) => update({ endDate: e.currentTarget.value })}
                  onChange={(e) => update({ endDate: e.target.value })}
                />
              </div>
            </div>

            {days > 0 && (
              <div className={styles.durationBadge}>
                {days} day{days !== 1 ? "s" : ""} estimate - {formatRwf(totalPrice)}
              </div>
            )}

            <div className={styles.formGrid}>
              <LocationInput
                id="pickup"
                label={routeFields.pickupLabel}
                placeholder={routeFields.pickupPlaceholder}
                helper={routeFields.pickupHint}
                value={state.pickupLocation}
                onChange={(value) => update({ pickupLocation: value })}
              />
              <LocationInput
                id="dropoff"
                label={routeFields.dropoffLabel}
                placeholder={routeFields.dropoffPlaceholder}
                helper={routeFields.dropoffHint}
                value={state.dropoffLocation}
                onChange={(value) => update({ dropoffLocation: value })}
              />
            </div>

            <button className={styles.nextBtn} onClick={() => setStep(1)} disabled={!canAdvanceStep1}>
              Continue to Contact
            </button>
          </div>
        )}

        {step === 1 && (
          <div className={styles.stepContent}>
            <h2 className={styles.panelTitle}>Contact</h2>
            <p className={styles.panelSub}>Only the contact needed to follow up on this request. Extra passenger or driver details can be handled by the Vava team later if required.</p>

            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="name">Name</label>
                <input id="name" type="text" className={styles.input} placeholder="Requester name" value={state.customerName} onChange={(e) => update({ customerName: e.target.value })} />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="phone">Phone / WhatsApp</label>
                <input id="phone" type="tel" className={styles.input} placeholder="+250 7XX XXX XXX" value={state.phone} onChange={(e) => update({ phone: e.target.value })} />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="email">Email</label>
                <input id="email" type="email" className={styles.input} placeholder="you@example.com" value={state.email} onChange={(e) => update({ email: e.target.value })} />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="passengers">Passengers</label>
                <input id="passengers" type="number" min="1" className={styles.input} value={state.passengerCount} onChange={(e) => update({ passengerCount: e.target.value })} />
              </div>
              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label className={styles.label} htmlFor="org">Organization / Event</label>
                <input id="org" type="text" className={styles.input} placeholder="Optional company, conference, or group name" value={state.organizationName} onChange={(e) => update({ organizationName: e.target.value })} />
              </div>
              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label className={styles.label} htmlFor="notes">Notes</label>
                <textarea id="notes" className={styles.textarea} rows={4} placeholder="Flight number, event schedule, route notes, concierge needs, etc." value={state.notes} onChange={(e) => update({ notes: e.target.value })} />
              </div>
            </div>

            <div className={styles.navRow}>
              <button className={styles.backBtn} onClick={() => setStep(0)}>Back</button>
              <button className={styles.nextBtn} onClick={() => setStep(2)} disabled={!canAdvanceStep2}>Review Request</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={styles.stepContent}>
            <h2 className={styles.panelTitle}>Review & Submit</h2>
            <p className={styles.panelSub}>Confirm the request details. Vava operations will review and follow up with the requester.</p>

            <div className={styles.reviewCard}>
              <div className={styles.reviewVehicle}>
                <div className={styles.reviewPhoto}>
                  <Image src={vehicle.photoUrl} alt={vehicle.model} fill className={styles.reviewPhotoImg} />
                </div>
                <div>
                  <p className={styles.reviewMake}>{vehicle.make}</p>
                  <p className={styles.reviewModel}>{vehicle.model} ({vehicle.year})</p>
                </div>
              </div>

              <div className={styles.reviewRows}>
                {[
                  { label: "Service", value: state.serviceType ? serviceTypeLabel(state.serviceType) : "Not selected" },
                  { label: "Mode", value: serviceTypeLabel(state.travelMode) },
                  { label: "Pickup Date", value: new Date(state.startDate).toDateString() },
                  { label: "Return Date", value: new Date(state.endDate).toDateString() },
                  { label: "Duration", value: `${days} day${days !== 1 ? "s" : ""}` },
                  { label: routeFields.pickupLabel, value: state.pickupLocation },
                  { label: routeFields.dropoffLabel, value: state.dropoffLocation },
                  { label: "Requester", value: state.customerName },
                  { label: "Contact", value: state.phone || state.email },
                ].map((row) => (
                  <div key={row.label} className={styles.reviewRow}>
                    <span className={styles.reviewLabel}>{row.label}</span>
                    <span className={styles.reviewValue}>{row.value}</span>
                  </div>
                ))}
              </div>

              <div className={styles.reviewPricing}>
                <div className={styles.reviewTotal}>
                  <span>Estimate shown for demo</span>
                  <strong>{formatRwf(totalPrice)}</strong>
                </div>
              </div>
            </div>

            <div className={styles.termsPanel}>
              <h3 className={styles.termsTitle}>Request terms</h3>
              <ul className={styles.termsList}>
                <li><strong>Operator review:</strong> Vava confirms vehicle availability, route fit, and timing before assigning the trip.</li>
                <li><strong>Details later:</strong> Passenger, driver, or protocol details are collected only when the operator needs them.</li>
                <li><strong>FleetX handoff:</strong> This white-label request can become a FleetX session for dispatch, scheduling, and handover.</li>
              </ul>
              <label className={styles.termsAccept}>
                <input
                  type="checkbox"
                  checked={state.acceptedRequestTerms}
                  onChange={(event) => update({ acceptedRequestTerms: event.target.checked })}
                />
                <span>I understand this is a transport request for Vava to review and confirm.</span>
              </label>
            </div>

            {error && (
              <div className={styles.errorMsg} role="alert">
                {error}
              </div>
            )}

            <div className={styles.navRow}>
              <button className={styles.backBtn} onClick={() => setStep(1)}>Edit Contact</button>
              <button className={styles.submitBtn} onClick={handleSubmit} disabled={!canSubmit}>
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={styles.sidebar}>
        <div className={styles.sideCard}>
          <div className={styles.sidePhoto}>
            <Image src={vehicle.photoUrl} alt={vehicle.model} fill className={styles.sidePhotoImg} />
          </div>
          <div className={styles.sideBody}>
            <p className={styles.sideMake}>{vehicle.make}</p>
            <p className={styles.sideModel}>{vehicle.model}</p>
            {days > 0 && (
              <>
                <div className={styles.sideDivider} />
                <div className={styles.sideRow}>
                  <span>Daily estimate</span>
                  <strong>{formatRwf(vehicle.dailyRateRwf)}</strong>
                </div>
                <div className={styles.sideRow}>
                  <span>{days} days</span>
                  <strong>{formatRwf(totalPrice)}</strong>
                </div>
              </>
            )}
            <div className={styles.sideDivider} />
            <div className={styles.sidePolicy}>
              <span>{vehicle.mileageLimitKm.toLocaleString()} km/day reference limit</span>
              <span>{formatRwf(vehicle.extraMileageFeeRwf)} / extra km if applicable</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
