/**
 * HostelHub - Supabase Client Configuration & Database Connectivity
 */

const SUPABASE_URL = "https://difdcjxvfpbazcmpnxec.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_wBb4swb4vJXBJnTL5xogbg_r8Tl-Mjw";

let supabaseClient = null;

if (typeof window !== 'undefined' && window.supabase && window.supabase.createClient) {
  supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );
}

window.supabaseClient = supabaseClient;
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_PUBLISHABLE_KEY = SUPABASE_PUBLISHABLE_KEY;
