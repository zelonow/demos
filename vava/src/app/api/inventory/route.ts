import { NextResponse } from "next/server";
import { getAttInventory } from "@/lib/fleetx-inventory";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getAttInventory());
  } catch (error) {
    return NextResponse.json(
      {
        detail: error instanceof Error ? error.message : String(error),
        error: "FleetX inventory unavailable",
      },
      { status: 502 },
    );
  }
}
