/**
 * Supabase `Database`-Typ (Schema laut `supabase/migrations/*`).
 *
 * Regenerieren, sobald `supabase link` / Project-ID verfügbar ist:
 *   npx supabase gen types typescript --project-id <REF> > src/types/supabase.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          name: string | null;
          created_at: string;
          updated_at: string;
        };
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
        Row: {
          id: string;
          start_at: string;
          end_at: string;
          booking_type: Database["public"]["Enums"]["booking_type"];
          generated_by_schedule: boolean;
          available: boolean;
          blocked_by_booking_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          start_at: string;
          end_at: string;
          booking_type: Database["public"]["Enums"]["booking_type"];
          generated_by_schedule?: boolean;
          available?: boolean;
          blocked_by_booking_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          start_at?: string;
          end_at?: string;
          booking_type?: Database["public"]["Enums"]["booking_type"];
          generated_by_schedule?: boolean;
          available?: boolean;
          blocked_by_booking_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      weekly_slot_rules: {
        Row: {
          id: string;
          booking_type: Database["public"]["Enums"]["booking_type"];
          weekday: number;
          start_time: string;
          end_time: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_type: Database["public"]["Enums"]["booking_type"];
          weekday: number;
          start_time: string;
          end_time: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          booking_type?: Database["public"]["Enums"]["booking_type"];
          weekday?: number;
          start_time?: string;
          end_time?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          slot_id: string;
          type: Database["public"]["Enums"]["booking_type"];
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          notes: string | null;
          status: Database["public"]["Enums"]["booking_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slot_id: string;
          type: Database["public"]["Enums"]["booking_type"];
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          notes?: string | null;
          status?: Database["public"]["Enums"]["booking_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slot_id?: string;
          type?: Database["public"]["Enums"]["booking_type"];
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string;
          notes?: string | null;
          status?: Database["public"]["Enums"]["booking_status"];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_slot_id_fkey";
            columns: ["slot_id"];
            isOneToOne: true;
            referencedRelation: "time_slots";
            referencedColumns: ["id"];
          },
        ];
      };
      contact_inquiries: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          subject: string;
          message: string;
          category: Database["public"]["Enums"]["contact_category"];
          status: Database["public"]["Enums"]["contact_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          subject: string;
          message: string;
          category?: Database["public"]["Enums"]["contact_category"];
          status?: Database["public"]["Enums"]["contact_status"];
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
          category?: Database["public"]["Enums"]["contact_category"];
          status?: Database["public"]["Enums"]["contact_status"];
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
          p_type: Database["public"]["Enums"]["booking_type"];
          p_first_name: string;
          p_last_name: string;
          p_email: string;
          p_phone: string;
          p_notes?: string | null;
        };
        Returns: {
          booking_id: string | null;
          error_message: string | null;
        }[];
      };
      unblock_slots_for_booking: {
        Args: { p_booking_id: string };
        Returns: number;
      };
    };
    Enums: {
      booking_type: "PROBETRAINING" | "PERSONAL_TRAINING";
      booking_status: "CONFIRMED" | "CANCELLED" | "COMPLETED";
      contact_status: "NEW" | "IN_PROGRESS" | "DONE" | "ARCHIVED";
      contact_category: "GENERAL" | "MEMBERSHIP" | "OTHER";
    };
    CompositeTypes: Record<string, never>;
  };
};
