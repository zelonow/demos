import { NextResponse } from "next/server";
import { getAttInventory } from "@/lib/fleetx-inventory";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getAttInventory());
}
