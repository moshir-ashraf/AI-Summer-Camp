const supabase = require('./supabase');
const fs = require('fs');
const path = require('path');

async function createTables() {
  console.log('🚀 Setting up Supabase database tables...');
  
  try {
    // Read the SQL setup script
    const sqlScript = fs.readFileSync(path.join(__dirname, 'database_setup.sql'), 'utf8');
    
    console.log('📝 Executing database setup script...');
    
    // Execute the SQL script
    const { error } = await supabase.rpc('exec_sql', { sql_query: sqlScript });
    
    if (error) {
      // If RPC method doesn't exist, we'll create tables manually
      console.log('⚠️  RPC method not available, creating tables manually...');
      await createTablesManually();
    } else {
      console.log('✅ Database tables created successfully via SQL script!');
    }
    
    return true;
    
  } catch (error) {
    console.log('⚠️  SQL script execution failed, trying manual table creation...');
    console.log('Error:', error.message);
    
    // Fallback to manual table creation
    return await createTablesManually();
  }
}

async function createTablesManually() {
  try {
    console.log('🛠️  Creating tables manually...');
    
    // Create users table using Supabase admin API
    console.log('Creating users table...');
    const { error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (usersError && usersError.code === '42P01') { // Table doesn't exist
      console.log('❌ Tables do not exist. Please create them manually in Supabase dashboard.');
      console.log('\n📋 MANUAL SETUP REQUIRED:');
      console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard');
      console.log('2. Select your project');
      console.log('3. Go to SQL Editor');
      console.log('4. Create a new query');
      console.log('5. Copy and paste the entire contents of server/database_setup.sql');
      console.log('6. Click "Run" to execute the script');
      console.log('7. Verify tables were created in the Table Editor');
      console.log('8. Restart this application\n');
      return false;
    }
    
    // Check if game_state table exists
    console.log('Checking game_state table...');
    const { error: gameStateError } = await supabase
      .from('game_state')
      .select('id')
      .limit(1);
    
    if (gameStateError && gameStateError.code === '42P01') {
      console.log('❌ game_state table missing. Please run the manual setup above.');
      return false;
    }
    
    console.log('✅ All tables exist!');
    
    // Ensure default game state exists
    const { data: existingGameState } = await supabase
      .from('game_state')
      .select('*')
      .limit(1);
    
    if (!existingGameState || existingGameState.length === 0) {
      console.log('Creating default game state...');
      const { error: insertError } = await supabase
        .from('game_state')
        .insert([{
          is_paused: false,
          current_task: 1,
          settings: {}
        }]);
      
      if (insertError) {
        console.log('⚠️  Could not create default game state:', insertError.message);
      } else {
        console.log('✅ Default game state created');
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Manual table creation failed:', error.message);
    return false;
  }
}

async function initializeDatabase() {
  console.log('🔧 Initializing Supabase database...');
  
  try {
    // Test basic connection
    console.log('🔌 Testing Supabase connection...');
    const { error: connectionError } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (connectionError) {
      if (connectionError.code === '42P01') {
        // Table doesn't exist - this is expected on first run
        console.log('📋 Tables not found. Setting up database...');
        return await createTables();
      } else {
        console.error('❌ Connection error:', connectionError.message);
        console.log('\n🔧 TROUBLESHOOTING:');
        console.log('1. Check your SUPABASE_URL in .env file');
        console.log('2. Check your SUPABASE_ANON_KEY in .env file');
        console.log('3. Ensure your Supabase project is active');
        console.log('4. Verify you have the correct permissions\n');
        return false;
      }
    }
    
    // Tables exist, check game_state
    const { error: gameStateError } = await supabase
      .from('game_state')
      .select('*')
      .limit(1);
    
    if (gameStateError) {
      if (gameStateError.code === '42P01') {
        console.log('📋 game_state table missing. Setting up...');
        return await createTables();
      } else {
        console.error('❌ Game state table error:', gameStateError.message);
        return false;
      }
    }
    
    console.log('✅ Database connection successful!');
    console.log('✅ All tables are ready!');
    return true;
    
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    return false;
  }
}

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(success => {
      if (success) {
        console.log('\n🎉 Database is ready to use!');
      } else {
        console.log('\n❌ Database setup failed. Please follow the manual setup instructions above.');
      }
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase, createTables };
