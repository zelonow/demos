// ─────────────────────────────────────────────────────────────────────────────
// TYPE DEFINITIONS — exactly mirrors Appendix A backend contract
// ─────────────────────────────────────────────────────────────────────────────

export type VehicleClass =
  | "economy"
  | "sedan"
  | "executive"
  | "suv"
  | "van"
  | "pickup"
  | "landcruiser"
  | "volkswagen"
  | "vans"
  | "sedans"
  | "executive_bus";

export type VehicleType =
  | "sedan"
  | "suv"
  | "van"
  | "coupe"
  | "pickup"
  | "minibus"
  | "bus";

export type RentalStatus = "available" | "rented" | "maintenance" | "inactive";

export type ServiceType =
  | "self_drive_rental"
  | "chauffeured_rental"
  | "airport_transfer"
  | "wedding_event"
  | "corporate_longterm"
  | "corporate_event"
  | "tour_travel"
  | "vvip_transfer"
  | "destination_management";

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vehicleType: VehicleType;
  vehicleClass: VehicleClass;
  color: string;
  photoUrl: string;
  heroImage?: string;
  listingPhotos: string[];
  dailyRateRwf: number;
  hourlyRateRwf: number;
  weeklyRateRwf: number;
  depositAmountRwf: number;
  mileageLimitKm: number;
  extraMileageFeeRwf: number;
  lateReturnFeeRwf: number;
  selfDriveEnabled: boolean;
  chauffeuredEnabled: boolean;
  rentalStatus: RentalStatus;
  listingTitle: string;
  listingDescription: string;
  listingTags: string[];
  seats: number;
  transmission: "automatic" | "manual";
  fuelType: "petrol" | "diesel" | "hybrid" | "electric";
}

export interface Organization {
  id: string;
  name: string;
  city: string;
  supportedServiceTypes: ServiceType[];
  logoUrl: string;
  active: boolean;
}

export interface InventoryResponse {
  organization: Organization;
  vehicles: Vehicle[];
}

export interface BookingProofUploadResponse {
  fileUrl: string;
  storageKey: string;
  viewUrl: string;
}

export interface BookingRequest {
  source: "enterprise_white_label";
  lang?: string;
  serviceType: ServiceType;
  vehicleId: string;
  customerName: string;
  phone: string;
  email: string;
  idDocumentNumber?: string;
  licenseNumber?: string;
  startsAt: string;
  endsAt: string;
  pickupLocation: string;
  dropoffLocation: string;
  depositAmountRwf: number;
  proofAmountRwf: number;
  requireDepositProof?: boolean;
  paymentMethod?: string;
  paymentReference?: string;
  payerPhone?: string;
  proofFileUrl?: string;
  proofFileName?: string;
  proofStorageKey?: string;
  proofViewUrl?: string;
  notes?: string;
}

export interface BookingResponse {
  requestId: string;
  sessionId: string;
  status: string;
  createdAt?: string;
  accessToken?: string;
  accessUrl?: string;
  email?: {
    sent: boolean;
    mode: "resend" | "mock" | "skipped" | "failed";
    messageId?: string;
    error?: string;
  };
}
