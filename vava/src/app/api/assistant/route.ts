import { NextRequest, NextResponse } from "next/server";
import { SITE } from "@/config/site";
import { fleetxApiHeaders, hasLiveFleetxConfig } from "@/lib/fleetx-inventory";
import { MOCK_INVENTORY } from "@/lib/mock-data";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = String(body?.message ?? "").trim();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (hasLiveFleetxConfig()) {
      const url = `${SITE.backendBase}/api/v1/fleet/public/${SITE.organizationId}/assistant/query`;
      const res = await fetch(url, {
        method: "POST",
        headers: fleetxApiHeaders({
          "Content-Type": "application/json",
          "Accept": "application/json",
        }),
        body: JSON.stringify({ ...body, message }),
      });

      if (!res.ok) {
        const detail = await res.json().catch(() => ({}));
        return NextResponse.json({ error: "Assistant failed", detail }, { status: res.status });
      }

      return NextResponse.json(await res.json());
    }

    const lowered = message.toLowerCase();
    const suggestedVehicles = MOCK_INVENTORY.vehicles
      .filter((vehicle) => {
        const haystack = [
          vehicle.make,
          vehicle.model,
          vehicle.vehicleClass,
          vehicle.vehicleType,
          ...vehicle.listingTags,
        ].join(" ").toLowerCase();
        return lowered.split(/\s+/).some((word) => word.length > 2 && haystack.includes(word));
      })
      .slice(0, 3);
    const fallback = suggestedVehicles.length > 0 ? suggestedVehicles : MOCK_INVENTORY.vehicles.slice(0, 3);
    const lead = fallback[0];

    return NextResponse.json({
      answer: `${lead.make} ${lead.model} is available from ${lead.dailyRateRwf.toLocaleString()} RWF per day. I can prepare the booking path, and the final request is submitted through the booking form.`,
      organization: MOCK_INVENTORY.organization,
      suggestedVehicles: fallback,
      nextAction: {
        type: "prepare_booking_request",
        status: "requires_user_submission",
        vehicleId: lead.id,
        label: "Continue to booking",
      },
    });
  } catch (err) {
    console.error("[assistant]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
