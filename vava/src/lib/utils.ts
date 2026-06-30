import { SITE } from "@/config/site";

// ── Currency formatter ───────────────────────────────────────────────────────
export function formatRwf(amount: number): string {
  return (
    new Intl.NumberFormat("en-RW", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) +
    " " +
    SITE.currency
  );
}

// ── Date helpers ─────────────────────────────────────────────────────────────
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-RW", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateISO(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function diffDays(start: Date, end: Date): number {
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function minBookingDate(): string {
  return formatDateISO(addDays(new Date(), 1));
}

// ── String helpers ───────────────────────────────────────────────────────────
export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function serviceTypeLabel(type: string): string {
  const map: Record<string, string> = {
    self_drive_rental: "Self-Drive",
    chauffeured_rental: "Chauffeured",
    airport_transfer: "Airport Transfer",
    wedding_event: "Wedding & Events",
    corporate_longterm: "Corporate / Long-Term",
    corporate_event: "Conference / Event Transport",
    tour_travel: "Tourism Services",
    vvip_transfer: "VVIP Concierge Transfer",
    destination_management: "Destination Management",
  };
  return map[type] ?? type;
}

export function vehicleClassLabel(cls: string): string {
  const map: Record<string, string> = {
    economy: "Economy",
    sedan: "Sedan",
    executive: "Executive",
    suv: "SUV",
    van: "Van / Minibus",
    pickup: "Pickup",
    landcruiser: "Landcruiser",
    volkswagen: "Volkswagen",
    vans: "Vans",
    sedans: "Sedans",
    executive_bus: "Executive buses",
  };
  return map[cls] ?? cls;
}

// ── Booking helpers ──────────────────────────────────────────────────────────
export function calcTotalPrice(
  dailyRate: number,
  startDate: Date,
  endDate: Date
): number {
  const days = diffDays(startDate, endDate);
  return dailyRate * Math.max(1, days);
}
