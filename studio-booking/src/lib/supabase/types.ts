export type BookingType = "PROBETRAINING" | "PERSONAL_TRAINING";
export type BookingStatus = "CONFIRMED" | "CANCELLED" | "COMPLETED";
export type ContactStatus = "NEW" | "IN_PROGRESS" | "DONE" | "ARCHIVED";
export type ContactCategory = "GENERAL" | "MEMBERSHIP" | "OTHER";

export interface AdminUser {
  id: string;
  email: string;
  password_hash: string;
  name: string | null;
  created_at: string;
  updated_at: string;
}

export interface TimeSlot {
  id: string;
  start_at: string;
  end_at: string;
  booking_type: BookingType;
  generated_by_schedule: boolean;
  created_at: string;
  updated_at: string;
}

export interface TimeSlotWithBooking extends TimeSlot {
  booking: Booking | null;
}

export interface Booking {
  id: string;
  slot_id: string;
  type: BookingType;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  notes: string | null;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
}

export interface BookingWithSlot extends Booking {
  slot: TimeSlot;
}

export interface ContactInquiry {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  category: ContactCategory;
  status: ContactStatus;
  created_at: string;
  updated_at: string;
}

export interface WeeklySlotRule {
  id: string;
  booking_type: BookingType;
  weekday: number;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
}

// Supabase Database type — exaktes Format für createClient<Database>
export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: AdminUser;
        Insert: {
          id?: string;
          email: string;
          password_hash: string;
          name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          password_hash?: string;
          name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      time_slots: {
        Row: TimeSlot;
        Insert: {
          id?: string;
          start_at: string;
          end_at: string;
          booking_type: BookingType;
          generated_by_schedule?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          start_at?: string;
          end_at?: string;
          booking_type?: BookingType;
          generated_by_schedule?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      weekly_slot_rules: {
        Row: WeeklySlotRule;
        Insert: {
          id?: string;
          booking_type: BookingType;
          weekday: number;
          start_time: string;
          end_time: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          booking_type?: BookingType;
          weekday?: number;
          start_time?: string;
          end_time?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      bookings: {
        Row: Booking;
        Insert: {
          id?: string;
          slot_id: string;
          type: BookingType;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          notes?: string | null;
          status?: BookingStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slot_id?: string;
          type?: BookingType;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string;
          notes?: string | null;
          status?: BookingStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      contact_inquiries: {
        Row: ContactInquiry;
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          subject: string;
          message: string;
          category?: ContactCategory;
          status?: ContactStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string;
          subject?: string;
          message?: string;
          category?: ContactCategory;
          status?: ContactStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_booking_atomic: {
        Args: {
          p_slot_id: string;
          p_type: BookingType;
          p_first_name: string;
          p_last_name: string;
          p_email: string;
          p_phone: string;
          p_notes?: string | null;
        };
        Returns: Array<{
          booking_id: string | null;
          error_message: string | null;
        }>;
      };
    };
    Enums: {
      booking_type: BookingType;
      booking_status: BookingStatus;
      contact_status: ContactStatus;
      contact_category: ContactCategory;
    };
    CompositeTypes: Record<string, never>;
  };
};
