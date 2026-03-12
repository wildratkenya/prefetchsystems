import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://ynvcqmrfodvzrkhvbddo.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjYzMDJmZTFlLWVmM2YtNDQ4Yy04YjZlLTU0MjE0MGEwMTI1NyJ9.eyJwcm9qZWN0SWQiOiJ5bnZjcW1yZm9kdnpya2h2YmRkbyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzcxOTM1NTU5LCJleHAiOjIwODcyOTU1NTksImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.VL0ero63z6GnQPsXbpTF8IK3CJbGIMJO5LIpUhN3LdA';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };