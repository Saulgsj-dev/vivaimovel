// src/services/supabase.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xkafkgdajvfmtphzoeta.supabase.co"; // Substitua
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhrYWZrZ2RhanZmbXRwaHpvZXRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTIzOTksImV4cCI6MjA2ODY2ODM5OX0.4sJh8KCuPmaWpZjwaKqsXbdl5jdPKmtjmDc7iDINhBU"; // Substitua

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;