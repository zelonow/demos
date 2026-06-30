import { NextRequest, NextResponse } from "next/server";
import { SITE } from "@/config/site";
import { fleetxApiHeaders, getAttVehicle, hasLiveFleetxConfig } from "@/lib/fleetx-inventory";
import { createRequestAccessToken, type RequestAccessPayload } from "@/lib/request-access";
import { sendRequestConfirmationEmail } from "@/lib/request-email";
import type { ServiceType } from "@/types";

async function buildAccessResponse(req: NextRequest, body: any, booking: any) {
  const createdAt = booking.createdAt || new Date().toISOString();
  const requestId = booking.requestId || booking.id || `REQ-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const sessionId = booking.sessionId || booking.session?.id || `SES-${Date.now().toString(36).toUpperCase()}`;
  const status = booking.status || "pending_operator_review";
  const lang = body.lang || "en";
  const vehicle = await getAttVehicle(body.vehicleId);
  const vehicleLabel = vehicle ? `${vehicle.make} ${vehicle.model}` : body.vehicleId;

  const payload: RequestAccessPayload = {
    requestId,
    sessionId,
    status,
    customerName: body.customerName || "",
    email: body.email || "",
    phone: body.phone || "",
    vehicleId: body.vehicleId,
    vehicleLabel,
    serviceType: body.serviceType as ServiceType,
    startsAt: body.startsAt,
    endsAt: body.endsAt,
    pickupLocation: body.pickupLocation,
    dropoffLocation: body.dropoffLocation,
    createdAt,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
  };

  const accessToken = createRequestAccessToken(payload);
  const accessUrl = `${req.nextUrl.origin}/${lang}/request/${accessToken}`;
  const email = await sendRequestConfirmationEmail({ payload, accessUrl });

  return {
    ...booking,
    requestId,
    sessionId,
    status,
    createdAt,
    accessToken,
    accessUrl,
    email,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // If real backend is configured, forward to it
    if (hasLiveFleetxConfig()) {
      const url = `${SITE.backendBase.replace(/\/+$/, "")}/api/v1/fleet/public/${SITE.organizationId}/booking-requests`;
      const res = await fetch(url, {
        method: "POST",
        headers: fleetxApiHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ ...body, source: "enterprise_white_label" }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return NextResponse.json(
          { error: "Booking failed", detail: data },
          { status: res.status }
        );
      }

      const booking = await res.json();
      const normalizedBooking = {
        ...booking,
        status: booking.status === "pending_payment" ? "pending_operator_review" : booking.status,
      };
      return NextResponse.json(await buildAccessResponse(req, body, normalizedBooking));
    }

    // Mock booking response
    const sessionId = `SES-${Date.now().toString(36).toUpperCase()}`;
    const requestId = `REQ-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const booking = {
      requestId,
      sessionId,
      status: "pending_operator_review",
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(await buildAccessResponse(req, body, booking));
  } catch (err) {
    console.error("[booking]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
