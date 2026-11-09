// ========================================================================
// CORE TYPES FOR JATRASHEBA PLATFORM
// ========================================================================

export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'finance_manager'
  | 'operator_owner'
  | 'operator_manager'
  | 'counter_manager'
  | 'counter_operator'
  | 'support_agent'
  | 'passenger';

export type SeatStatus =
  | 'available'
  | 'selected'
  | 'held'
  | 'booked'
  | 'reserved'
  | 'disabled';

export type BookingStatus =
  | 'initiated'
  | 'held'
  | 'pending_payment'
  | 'confirmed'
  | 'cancelled'
  | 'expired'
  | 'refund_pending'
  | 'refunded'
  | 'partially_refunded';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'successful'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export type BookingChannel = 'website' | 'counter' | 'admin' | 'operator' | 'mobile_app';

export type PaymentMethod = 'bkash' | 'nagad' | 'rocket' | 'card' | 'cash';

export interface UserProfile {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  role: UserRole;
  operatorId?: string;
  counterId?: string;
  avatarUrl?: string;
}

export interface City {
  id: string;
  nameEn: string;
  nameBn: string;
  division: string;
  isPopular?: boolean;
}

export interface Terminal {
  id: string;
  cityId: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

export interface BusOperator {
  id: string;
  name: string;
  code: string;
  contactEmail: string;
  contactPhone: string;
  logoUrl: string;
  commissionRate: number;
  status: 'active' | 'pending' | 'suspended' | 'inactive';
  isOwnFleet: boolean;
  rating: number;
  address: string;
  totalBuses?: number;
  totalTrips?: number;
}

export interface BusCategory {
  id: string;
  name: string;
  code: string;
  isAc: boolean;
  amenities: string[];
  description: string;
}

export type LayoutType = '2+2' | '2+1' | 'sleeper' | 'double_decker';

export interface BusSeatConfig {
  seatNumber: string;
  row: number;
  col: number; // 0, 1, 2, 3
  deck: 'lower' | 'upper';
  type: 'standard' | 'vip' | 'sleeper' | 'door' | 'driver' | 'aisle';
}

export interface SeatLayout {
  id: string;
  name: string;
  totalSeats: number;
  rows: number;
  columns: number;
  layoutType: LayoutType;
  deckType: 'single' | 'double';
  seats: BusSeatConfig[];
}

export interface Bus {
  id: string;
  operatorId: string;
  operatorName?: string;
  categoryId: string;
  categoryName?: string;
  seatLayoutId: string;
  registrationNumber: string;
  coachNumber: string;
  model: string;
  hasGps: boolean;
  status: 'active' | 'maintenance' | 'inactive';
}

export interface Counter {
  id: string;
  operatorId: string;
  operatorName?: string;
  name: string;
  code: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  contactPerson: string;
  isActive: boolean;
  todaySales?: number;
  todayBookings?: number;
}

export interface BoardingPoint {
  id: string;
  name: string;
  counterId?: string;
  time: string; // e.g. "21:30"
  address?: string;
}

export interface DroppingPoint {
  id: string;
  name: string;
  counterId?: string;
  time: string; // e.g. "06:00"
  address?: string;
}

export interface TripSeat {
  id: string;
  tripId: string;
  seatNumber: string;
  seatType: 'standard' | 'vip' | 'sleeper';
  fare: number;
  status: SeatStatus;
  heldBySession?: string;
  holdExpiresAt?: string; // ISO string
  genderRestriction?: 'any' | 'female_only' | 'male_only';
  deck?: 'lower' | 'upper';
  row: number;
  col: number;
}

export interface Trip {
  id: string;
  operatorId: string;
  operatorName: string;
  operatorLogo: string;
  busId: string;
  coachNumber: string;
  busCategory: string;
  isAc: boolean;
  layoutType: LayoutType;
  originCity: string;
  destinationCity: string;
  departureDate: string; // YYYY-MM-DD
  departureTime: string; // "22:00"
  arrivalTime: string;   // "06:30"
  duration: string;      // "8h 30m"
  baseFare: number;
  availableSeats: number;
  totalSeats: number;
  boardingPoints: BoardingPoint[];
  droppingPoints: DroppingPoint[];
  status: 'scheduled' | 'boarding' | 'departed' | 'completed' | 'cancelled';
  rating: number;
  facilities: string[];
}

export interface PassengerInfo {
  fullName: string;
  phone: string;
  email?: string;
  gender: 'male' | 'female' | 'other';
  nid?: string;
}

export interface Booking {
  id: string;
  bookingReference: string;
  tripId: string;
  trip?: Trip;
  passenger: PassengerInfo;
  operatorId: string;
  operatorName: string;
  counterId?: string;
  counterName?: string;
  bookingChannel: BookingChannel;
  status: BookingStatus;
  seatNumbers: string[];
  totalAmount: number;
  discountAmount: number;
  serviceFee: number;
  payableAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  transactionRef: string;
  boardingPoint: string;
  droppingPoint: string;
  journeyDate: string;
  departureTime: string;
  coachNumber: string;
  createdAt: string;
  qrPayload: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  bookingReference: string;
  seatNumber: string;
  passengerName: string;
  passengerPhone: string;
  origin: string;
  destination: string;
  operatorName: string;
  coachNumber: string;
  journeyDate: string;
  departureTime: string;
  boardingPoint: string;
  droppingPoint: string;
  fare: number;
  status: 'valid' | 'boarded' | 'cancelled' | 'refunded';
  qrPayload: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minSpend: number;
  maxDiscount?: number;
  validUntil: string;
  isActive: boolean;
}

export interface DailyCashRecord {
  id: string;
  counterId: string;
  counterName: string;
  date: string;
  totalBookings: number;
  cashCollected: number;
  digitalCollected: number;
  expenses: number;
  netCash: number;
  status: 'open' | 'closed';
  closedBy?: string;
}

export interface CounterExpense {
  id: string;
  counterId: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  loggedBy: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  name: string;
  phone: string;
  bookingRef?: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
}

export interface Driver {
  id: string;
  operatorId: string;
  fullName: string;
  phone: string;
  licenseNumber: string;
  status: 'active' | 'on_trip' | 'leave';
}

export interface Helper {
  id: string;
  operatorId: string;
  fullName: string;
  phone: string;
  status: 'active' | 'on_trip' | 'leave';
}

export interface OperatorAccount {
  id: string;
  operatorId: string;
  companyName: string;
  email: string;
  passwordHint: string;
  fullName: string;
  phone: string;
  role: 'operator_owner' | 'operator_manager';
  logoUrl: string;
}

