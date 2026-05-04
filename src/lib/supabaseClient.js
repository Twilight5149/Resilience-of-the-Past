import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fxpvfulobjzoxcdlfmng.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4cHZmdWxvYmp6b3hjZGxmbW5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MzI1MzQsImV4cCI6MjA5MTEwODUzNH0.oDd_de57mVoGJDsd-7UWQxpLBDYROfFyIAxJFlgqGUw'
export const supabase = createClient(supabaseUrl, supabaseKey)

