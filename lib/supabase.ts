import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error("VITE_SUPABASE_URL is not configured. Check your .env file.");
}
if (!supabaseAnonKey) {
  console.error(
    "VITE_SUPABASE_ANON_KEY is not configured. Check your .env file.",
  );
}

// Create client - both URL and key are required for functionality
export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");

export type Database = {
  public: {
    Tables: {
      support_tickets: {
        Row: {
          id: number;
          customer_id: number;
          customer_email: string;
          customer_name: string;
          subject: string;
          category: string;
          priority: string;
          status: string;
          message: string;
          created_at: string;
          updated_at: string;
        };
      };
      ticket_replies: {
        Row: {
          id: number;
          ticket_id: number;
          sender_type: string;
          sender_name: string;
          sender_email: string;
          message: string;
          created_at: string;
        };
      };
    };
  };
};
