#!/usr/bin/env node

console.log('🎯 AI Summer Camp - Supabase Database Setup Guide');
console.log('='.repeat(50));

console.log('\n📋 STEP-BY-STEP SETUP INSTRUCTIONS:');
console.log('\n1. 🌐 Open your Supabase Dashboard:');
console.log('   https://supabase.com/dashboard');

console.log('\n2. 🏷️  Select your project:');
console.log('   Look for the project matching your URL in .env file');

console.log('\n3. 📝 Open SQL Editor:');
console.log('   - Click "SQL Editor" in the left sidebar');
console.log('   - Click "New Query" button');

console.log('\n4. 📄 Copy the SQL script:');
console.log('   - Open the file: server/database_setup.sql');
console.log('   - Copy ALL the content (Ctrl+A, Ctrl+C)');

console.log('\n5. ⚡ Execute the script:');
console.log('   - Paste the content into the SQL Editor');
console.log('   - Click "Run" (or press Ctrl+Enter)');

console.log('\n6. ✅ Verify tables were created:');
console.log('   - Click "Table Editor" in the left sidebar');
console.log('   - You should see 2 tables: "users" and "game_state"');

console.log('\n7. 🚀 Start the application:');
console.log('   - Run: npm start');
console.log('   - You should see "✅ Database is ready to use!"');

console.log('\n' + '='.repeat(50));
console.log('📄 SQL Script Content Preview:');
console.log('='.repeat(50));

const fs = require('fs');
const path = require('path');

try {
  const sqlContent = fs.readFileSync(path.join(__dirname, 'database_setup.sql'), 'utf8');
  console.log(sqlContent);
} catch (error) {
  console.log('❌ Could not read database_setup.sql file');
  console.log('Make sure the file exists in the server directory');
}

console.log('\n' + '='.repeat(50));
console.log('🔧 TROUBLESHOOTING:');
console.log('='.repeat(50));
console.log('• If you get permission errors: Check your Supabase anon key');
console.log('• If tables already exist: The script will skip existing tables');
console.log('• If you see syntax errors: Make sure you copied the entire script');
console.log('• Need help? Check the logs when running "npm start"');

console.log('\n💡 TIP: After setup, the app will automatically check and initialize the database!');
