import { SITE } from "@/config/site";
import { MOCK_INVENTORY } from "@/lib/mock-data";
import type { InventoryResponse, ServiceType, Vehicle, VehicleClass, VehicleType } from "@/types";

type FleetxVehicle = Record<string, unknown>;
type FleetxInventory = {
  organization?: Record<string, unknown>;
  vehicles?: FleetxVehicle[];
};

const DEFAULT_IMAGE = "/images/vehicles/sedan.png";
const VEHICLE_TYPES = new Set<VehicleType>(["sedan", "suv", "van", "coupe", "pickup", "minibus", "bus"]);
const VEHICLE_CLASSES = new Set<VehicleClass>([
  "economy",
  "sedan",
  "executive",
  "suv",
  "van",
  "pickup",
  "landcruiser",
  "volkswagen",
  "vans",
  "sedans",
  "executive_bus",
]);
const SERVICE_TYPES = new Set<ServiceType>([
  "self_drive_rental",
  "chauffeured_rental",
  "airport_transfer",
  "wedding_event",
  "corporate_longterm",
  "corporate_event",
  "tour_travel",
  "vvip_transfer",
  "destination_management",
]);

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function numberValue(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
}

function vehicleType(value: unknown): VehicleType {
  const normalized = stringValue(value, "sedan").toLowerCase();
  if (VEHICLE_TYPES.has(normalized as VehicleType)) return normalized as VehicleType;
  return "sedan";
}

function vehicleClass(value: unknown, type: VehicleType): VehicleClass {
  const normalized = stringValue(value, type).toLowerCase();
  if (normalized === "compact") return "economy";
  if (normalized === "premium_suv" || normalized === "land_cruiser") return "landcruiser";
  if (normalized === "people_mover") return "vans";
  if (normalized === "tour_bus") return "executive_bus";
  if (normalized === "executive_sedan") return "sedans";
  if (VEHICLE_CLASSES.has(normalized as VehicleClass)) return normalized as VehicleClass;
  if (type === "pickup") return "pickup";
  if (type === "van" || type === "minibus") return "van";
  if (type === "suv") return "suv";
  return "sedan";
}

function fuelType(value: unknown): Vehicle["fuelType"] {
  const normalized = stringValue(value, "petrol").toLowerCase();
  if (["electric", "ev"].includes(normalized)) return "electric";
  if (["hybrid", "phev"].includes(normalized)) return "hybrid";
  if (["diesel"].includes(normalized)) return "diesel";
  return "petrol";
}

function transmission(value: unknown): Vehicle["transmission"] {
  return stringValue(value).toLowerCase() === "manual" ? "manual" : "automatic";
}

function normalizedTags(vehicle: FleetxVehicle) {
  return Array.from(
    new Set([
      ...stringArray(vehicle.listingTags),
      ...stringArray(vehicle.listing_tags),
      ...stringArray(vehicle.supportedServiceTypes),
      ...stringArray(vehicle.supported_service_types),
      stringValue(vehicle.category),
    ].filter(Boolean)),
  );
}

function supportedServices(vehicle: FleetxVehicle): ServiceType[] {
  const tags = normalizedTags(vehicle).map((tag) => tag.toLowerCase());
  const services = new Set<ServiceType>();
  for (const value of [...stringArray(vehicle.supportedServiceTypes), ...stringArray(vehicle.supported_service_types)]) {
    if (SERVICE_TYPES.has(value as ServiceType)) services.add(value as ServiceType);
  }
  if (vehicle.selfDriveEnabled || vehicle.self_drive_enabled) services.add("self_drive_rental");
  if (vehicle.chauffeuredEnabled || vehicle.chauffeured_enabled) services.add("chauffeured_rental");
  if (tags.some((tag) => tag.includes("airport"))) services.add("airport_transfer");
  if (tags.some((tag) => tag.includes("wedding") || tag.includes("event"))) services.add("wedding_event");
  if (tags.some((tag) => tag.includes("corporate") || tag.includes("longterm") || tag.includes("long_term"))) services.add("corporate_longterm");
  if (tags.some((tag) => tag.includes("conference") || tag.includes("event"))) services.add("corporate_event");
  if (tags.some((tag) => tag.includes("tour") || tag.includes("safari"))) services.add("tour_travel");
  if (tags.some((tag) => tag.includes("vvip") || tag.includes("vip") || tag.includes("concierge"))) services.add("vvip_transfer");
  if (tags.some((tag) => tag.includes("dmc") || tag.includes("destination"))) services.add("destination_management");
  return Array.from(services);
}

export function normalizeFleetxInventory(payload: FleetxInventory): InventoryResponse {
  const organization = payload.organization ?? {};
  return {
    organization: {
      id: stringValue(organization.id, SITE.organizationId),
      name: stringValue(organization.name, SITE.name),
      city: stringValue(organization.city, SITE.city),
      supportedServiceTypes: [...stringArray(organization.supportedServiceTypes), ...stringArray(organization.supported_service_types)].filter(
        (value): value is ServiceType => SERVICE_TYPES.has(value as ServiceType),
      ),
      logoUrl: stringValue(organization.logoUrl ?? organization.logo_url, "/images/logo-dark.png"),
      active: stringValue(organization.subscriptionStatus ?? organization.subscription_status, "active") !== "inactive",
    },
    vehicles: (payload.vehicles ?? []).map(normalizeFleetxVehicle),
  };
}

export function normalizeFleetxVehicle(vehicle: FleetxVehicle): Vehicle {
  const type = vehicleType(vehicle.vehicleType ?? vehicle.vehicle_type);
  const classification = vehicleClass(vehicle.vehicleClass ?? vehicle.vehicle_class ?? vehicle.category, type);
  const photos = [
    ...stringArray(vehicle.listingPhotos),
    ...stringArray(vehicle.listing_photos),
    ...stringArray(vehicle.photoUrls),
    ...stringArray(vehicle.photo_urls),
    stringValue(vehicle.photoUrl ?? vehicle.photo_url),
  ].filter(Boolean);
  const tags = normalizedTags(vehicle);
  const services = supportedServices(vehicle);
  const make = stringValue(vehicle.make, "Vehicle");
  const model = stringValue(vehicle.model, type.toUpperCase());

  return {
    id: stringValue(vehicle.id),
    make,
    model,
    year: numberValue(vehicle.year, new Date().getFullYear()),
    vehicleType: type,
    vehicleClass: classification,
    color: stringValue(vehicle.color, "Available"),
    photoUrl: photos[0] ?? DEFAULT_IMAGE,
    heroImage: stringValue(vehicle.heroImage ?? vehicle.hero_image, photos[0] ?? DEFAULT_IMAGE),
    listingPhotos: photos.length ? photos : [DEFAULT_IMAGE],
    dailyRateRwf: numberValue(vehicle.dailyRateRwf ?? vehicle.daily_rate_rwf),
    hourlyRateRwf: numberValue(vehicle.hourlyRateRwf ?? vehicle.hourly_rate_rwf),
    weeklyRateRwf: numberValue(vehicle.weeklyRateRwf ?? vehicle.weekly_rate_rwf),
    depositAmountRwf: numberValue(vehicle.depositAmountRwf ?? vehicle.deposit_amount_rwf),
    mileageLimitKm: numberValue(vehicle.mileageLimitKm ?? vehicle.mileage_limit_km, 200),
    extraMileageFeeRwf: numberValue(vehicle.extraMileageFeeRwf ?? vehicle.extra_mileage_fee_rwf),
    lateReturnFeeRwf: numberValue(vehicle.lateReturnFeeRwf ?? vehicle.late_return_fee_rwf),
    selfDriveEnabled: Boolean(vehicle.selfDriveEnabled ?? vehicle.self_drive_enabled ?? services.includes("self_drive_rental")),
    chauffeuredEnabled: Boolean(vehicle.chauffeuredEnabled ?? vehicle.chauffeured_enabled ?? services.includes("chauffeured_rental")),
    rentalStatus: stringValue(vehicle.rentalStatus ?? vehicle.rental_status, "available") as Vehicle["rentalStatus"],
    listingTitle: stringValue(vehicle.listingTitle ?? vehicle.listing_title, `${make} ${model}`),
    listingDescription: stringValue(vehicle.listingDescription ?? vehicle.listing_description, "Available through Vava Transport and Logistics."),
    listingTags: tags,
    seats: numberValue(vehicle.seatCount ?? vehicle.seats ?? vehicle.seat_count, type === "van" || type === "minibus" ? 8 : 5),
    transmission: transmission(vehicle.transmission),
    fuelType: fuelType(vehicle.powertrain ?? vehicle.fuelType ?? vehicle.fuel_type),
  };
}

export function hasLiveFleetxConfig() {
  return Boolean(SITE.backendBase && SITE.organizationId !== "mock");
}

export function fleetxApiHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return {
    ...extra,
    ...(process.env.ZELO_FLEETX_API_KEY ? { Authorization: `Bearer ${process.env.ZELO_FLEETX_API_KEY}` } : {}),
  };
}

export async function getAttInventory(): Promise<InventoryResponse> {
  if (!hasLiveFleetxConfig()) return MOCK_INVENTORY;

  try {
    const url = `${SITE.backendBase.replace(/\/+$/, "")}/api/v1/fleet/public/${SITE.organizationId}/inventory`;
    const response = await fetch(url, {
      headers: {
        ...fleetxApiHeaders({ Accept: "application/json" }),
      },
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`FleetX inventory returned ${response.status}`);
    return normalizeFleetxInventory(await response.json());
  } catch (error) {
    console.error("[fleetx-inventory] Falling back to mock inventory", error);
    return MOCK_INVENTORY;
  }
}

export async function getAttVehicle(vehicleId: string) {
  const inventory = await getAttInventory();
  return inventory.vehicles.find((vehicle) => vehicle.id === vehicleId) ?? null;
}
