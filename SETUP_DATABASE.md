# Supabase Database Setup Guide

## Quick Setup Steps

1. **Access Supabase Dashboard**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Login to your account
   - Select your project (the one matching the URL in your .env file)

2. **Run Database Setup Script**
   - In the Supabase dashboard, click on "SQL Editor" in the left sidebar
   - Click "New Query" 
   - Copy ALL the content from `server/database_setup.sql`
   - Paste it into the SQL editor
   - Click "Run" (or press Ctrl+Enter)

3. **Verify Setup**
   - Go to "Table Editor" in the left sidebar
   - You should see two tables: `users` and `game_state`
   - The `game_state` table should have 1 row of default data

4. **Start the Application**
   ```bash
   npm start
   ```

## What the Script Creates

- **users table**: Stores student and instructor accounts
- **game_state table**: NEW - Controls game state for all students
- **Indexes**: For better database performance  
- **Triggers**: Automatically update timestamps
- **Default data**: Initial game state

## Troubleshooting

If you see connection errors:
1. Check that your SUPABASE_URL and SUPABASE_ANON_KEY are correct in the .env file
2. Make sure you've run the database setup script
3. Verify your Supabase project is active

The application will show helpful error messages if tables are missing.
