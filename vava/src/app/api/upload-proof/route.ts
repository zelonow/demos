import { NextRequest, NextResponse } from "next/server";
import { SITE } from "@/config/site";
import { fleetxApiHeaders, hasLiveFleetxConfig } from "@/lib/fleetx-inventory";




export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a JPG, PNG, WEBP, or PDF." },
        { status: 400 }
      );
    }

    // Validate file size (5 MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5 MB." },
        { status: 400 }
      );
    }

    // If real backend is configured, forward to it
    if (hasLiveFleetxConfig()) {
      const url = `${SITE.backendBase}/api/v1/fleet/public/${SITE.organizationId}/booking-proof-upload`;
      const upstream = new FormData();
      upstream.append("file", file);

      const res = await fetch(url, {
        method: "POST",
        headers: fleetxApiHeaders(),
        body: upstream,
      });

      if (!res.ok) {
        const text = await res.text();
        return NextResponse.json(
          { error: "Upload failed on backend", detail: text },
          { status: res.status }
        );
      }

      const data = await res.json();
      return NextResponse.json(data);
    }

    // Mock response for development
    const mockKey = `proof/${Date.now()}_${file.name}`;
    return NextResponse.json({
      fileUrl: `s3://vava-demo-uploads/${mockKey}`,
      storageKey: mockKey,
      viewUrl: `https://storage.vavatransport.rw/${mockKey}`,
    });
  } catch (err) {
    console.error("[upload-proof]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
