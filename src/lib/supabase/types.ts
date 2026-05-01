/**
 * App-Typen abgeleitet vom Supabase-Schema (`@/types/supabase`).
 */
import type { Database } from "@/types/supabase";

export type { Database } from "@/types/supabase";

export type BookingType = Database["public"]["Enums"]["booking_type"];
export type BookingStatus = Database["public"]["Enums"]["booking_status"];
export type ContactStatus = Database["public"]["Enums"]["contact_status"];
export type ContactCategory = Database["public"]["Enums"]["contact_category"];

export type AdminUser = Database["public"]["Tables"]["admin_users"]["Row"];
export type TimeSlot = Database["public"]["Tables"]["time_slots"]["Row"];
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type ContactInquiry = Database["public"]["Tables"]["contact_inquiries"]["Row"];
export type WeeklyAvailabilityInterval = Database["public"]["Tables"]["weekly_availability_intervals"]["Row"];

export type TimeSlotWithBooking = TimeSlot & {
  booking: Booking | null;
};

export type BookingWithSlot = Booking & {
  slot: TimeSlot;
};
