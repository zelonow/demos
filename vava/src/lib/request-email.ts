import { SITE } from "@/config/site";
import type { RequestAccessPayload } from "@/lib/request-access";
import { serviceTypeLabel } from "@/lib/utils";

interface SendRequestEmailInput {
  payload: RequestAccessPayload;
  accessUrl: string;
}

export interface RequestEmailResult {
  sent: boolean;
  mode: "resend" | "mock" | "skipped" | "failed";
  messageId?: string;
  preview?: string;
  error?: string;
}

function textEmail(payload: RequestAccessPayload, accessUrl: string) {
  return [
    `Hello ${payload.customerName || "there"},`,
    "",
    `We received your ${SITE.nameShort} transport request (${payload.requestId}).`,
    `Vehicle: ${payload.vehicleLabel}`,
    `Service: ${serviceTypeLabel(payload.serviceType)}`,
    `Route: ${payload.pickupLocation} -> ${payload.dropoffLocation}`,
    "",
    "Use your private request link to check status and see whether Vava needs any extra details:",
    accessUrl,
    "",
    "This link is private to you. Do not share it publicly.",
    "",
    `${SITE.name}`,
    `${SITE.phone} | ${SITE.email}`,
  ].join("\n");
}

function htmlEmail(payload: RequestAccessPayload, accessUrl: string) {
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
      <h2 style="margin:0 0 12px">Vava request received</h2>
      <p>Hello ${payload.customerName || "there"},</p>
      <p>We received your transport request <strong>${payload.requestId}</strong>.</p>
      <table style="border-collapse:collapse;margin:16px 0;width:100%;max-width:560px">
        <tr><td style="padding:8px;border:1px solid #ddd">Vehicle</td><td style="padding:8px;border:1px solid #ddd"><strong>${payload.vehicleLabel}</strong></td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd">Service</td><td style="padding:8px;border:1px solid #ddd">${serviceTypeLabel(payload.serviceType)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd">Pickup</td><td style="padding:8px;border:1px solid #ddd">${payload.pickupLocation}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd">Destination</td><td style="padding:8px;border:1px solid #ddd">${payload.dropoffLocation}</td></tr>
      </table>
      <p>
        <a href="${accessUrl}" style="display:inline-block;background:#ed6623;color:#fff;text-decoration:none;padding:12px 18px;font-weight:700">
          View request status
        </a>
      </p>
      <p style="color:#666;font-size:13px">This link is private to you. Do not share it publicly.</p>
      <p>${SITE.name}<br/>${SITE.phone} | ${SITE.email}</p>
    </div>
  `;
}

export async function sendRequestConfirmationEmail({ payload, accessUrl }: SendRequestEmailInput): Promise<RequestEmailResult> {
  if (!payload.email) {
    return { sent: false, mode: "skipped", error: "No customer email supplied" };
  }

  const preview = textEmail(payload, accessUrl);
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.REQUEST_EMAIL_FROM || `Vava Transport <${SITE.email}>`;

  if (!apiKey) {
    console.info("[vava-email:mock]", { to: payload.email, subject: `Vava request ${payload.requestId}`, accessUrl });
    return { sent: true, mode: "mock", preview };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: payload.email,
        subject: `Vava request ${payload.requestId} received`,
        text: preview,
        html: htmlEmail(payload, accessUrl),
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { sent: false, mode: "failed", error: data?.message || "Email provider rejected the request", preview };
    }

    return { sent: true, mode: "resend", messageId: data?.id, preview };
  } catch (error) {
    return { sent: false, mode: "failed", error: error instanceof Error ? error.message : "Email failed", preview };
  }
}
