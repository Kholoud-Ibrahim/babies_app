import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ovovsfzkpsuafcibqqgb.supabase.co'
// This is a Supabase anon (public) key - safe to expose in frontend code
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92b3ZzZnprcHN1YWZjaWJxcWdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2Mjk1MzYsImV4cCI6MjA4NTIwNTUzNn0.0VbBAfDBiTy9bt3tJ8nYGsmNXRCepij1aXnFL-x36X0' // gitleaks:allow

export const supabase = createClient(supabaseUrl, supabaseAnonKey)


