import { createClient } from '@supabase/supabase-js'

// 🧩 Replace these with your actual Supabase project details
const SUPABASE_URL = 'https://vpadcnrmvivbjzxaljpo.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwYWRjbnJtdml2Ymp6eGFsanBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMjkzNjEsImV4cCI6MjA3NDcwNTM2MX0.QBPhNCM_JlW8MMRVUJuFlC7vzvA-Nei-AcjLFdhoPso'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
