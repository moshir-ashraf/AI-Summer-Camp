const path = require('path');

require('dotenv').config({path: path.join(__dirname, '../.env')});

console.log('🎯 Quick Setup Helper');
console.log('='.repeat(30));

const supabaseUrl = process.env.SUPABASE_URL;

if (supabaseUrl) {
  // Extract project reference from URL
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  
  if (projectRef) {
    const dashboardUrl = `https://supabase.com/dashboard/project/${projectRef}`;
    const sqlEditorUrl = `https://supabase.com/dashboard/project/${projectRef}/sql`;
    
    console.log('📂 Your Supabase Project:');
    console.log(`   Project URL: ${supabaseUrl}`);
    console.log(`   Project Ref: ${projectRef}`);
    console.log('');
    console.log('🔗 Quick Links:');
    console.log(`   Dashboard: ${dashboardUrl}`);
    console.log(`   SQL Editor: ${sqlEditorUrl}`);
    console.log('');
    console.log('📋 Next Steps:');
    console.log('1. Click the SQL Editor link above');
    console.log('2. Copy the content from server/database_setup.sql');
    console.log('3. Paste and run it in the SQL Editor');
    console.log('4. Come back and run: npm start');
  } else {
    console.log('❌ Could not parse project reference from SUPABASE_URL');
    console.log(`   URL: ${supabaseUrl}`);
  }
} else {
  console.log('❌ SUPABASE_URL not found in .env file');
  console.log('Make sure your .env file contains:');
  console.log('SUPABASE_URL=https://your-project.supabase.co');
  console.log('SUPABASE_ANON_KEY=your-anon-key');
}

console.log('\n💡 Need the full setup guide? Run: node setup-database.js');
