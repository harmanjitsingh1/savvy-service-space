
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://alreeczvrvcruvxoxhvh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFscmVlY3p2cnZjcnV2eG94aHZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5OTY5NzUsImV4cCI6MjA2MDU3Mjk3NX0.EsZdPLSbtPLgqogHHHGNYjRqIt8qVMCMK3QV1niBClg";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage
  }
});
