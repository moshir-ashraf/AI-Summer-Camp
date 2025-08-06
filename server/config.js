// Configuration file for both development and production
const config = {
  development: {
    PORT: process.env.PORT || 3000,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  },
  production: {
    PORT: 3000,
    SUPABASE_URL: 'https://zefgpirgrropthjonmbe.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplZmdwaXJncnJvcHRoam9ubWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyNTc4OTcsImV4cCI6MjA2OTgzMzg5N30.QpadXXH-IRWo_aQGTvW92cUK36dJSos4n1vQJblvKyw'
  }
};

const environment = process.env.NODE_ENV || 'development';
const isPackaged = process.env.NODE_ENV === 'production' || (typeof process !== 'undefined' && process.versions && process.versions.electron);

module.exports = isPackaged ? config.production : config.development;
