const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const config = require('./config');

// Load .env for development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
}

const supabaseUrl = config.SUPABASE_URL;
const supabaseKey = config.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Anon Key must be provided in .env file');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
