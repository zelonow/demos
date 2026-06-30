import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import type { ServiceType } from "@/types";

export interface RequestAccessPayload {
  requestId: string;
  sessionId: string;
  status: string;
  customerName: string;
  email: string;
  phone: string;
  vehicleId: string;
  vehicleLabel: string;
  serviceType: ServiceType;
  startsAt: string;
  endsAt: string;
  pickupLocation: string;
  dropoffLocation: string;
  createdAt: string;
  expiresAt: string;
}

const encoder = new TextEncoder();

declare global {
  // eslint-disable-next-line no-var
  var __vavaRequestAccessStore: Map<string, RequestAccessPayload> | undefined;
}

function store() {
  globalThis.__vavaRequestAccessStore ??= new Map<string, RequestAccessPayload>();
  return globalThis.__vavaRequestAccessStore;
}

function secret() {
  return process.env.REQUEST_ACCESS_SECRET || process.env.ZELO_FLEETX_API_KEY || "vava-demo-request-access-secret";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createRequestAccessToken(payload: RequestAccessPayload) {
  const id = randomBytes(24).toString("base64url");
  store().set(id, payload);
  return `${id}.${sign(id)}`;
}

export function verifyRequestAccessToken(token: string): RequestAccessPayload | null {
  const [id, signature] = token.split(".");
  if (!id || !signature) return null;

  const expected = sign(id);
  const actualBytes = encoder.encode(signature);
  const expectedBytes = encoder.encode(expected);
  if (actualBytes.length !== expectedBytes.length || !timingSafeEqual(actualBytes, expectedBytes)) {
    return null;
  }

  const payload = store().get(id);
  if (!payload) return null;
  if (!payload.expiresAt || new Date(payload.expiresAt).getTime() < Date.now()) {
    store().delete(id);
    return null;
  }

  return payload;
}
