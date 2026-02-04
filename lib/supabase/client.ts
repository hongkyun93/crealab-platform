import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    return createBrowserClient(
        "https://wbeyxjoqcwjbcuwvjrsa.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiZXl4am9xY3dqYmN1d3ZqcnNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMjE2NjYsImV4cCI6MjA4NTY5NzY2Nn0.dd42_fmkAw67xYMztVnu_8i7W3N2cya-4oJw-R0NUb8"
    )
}
