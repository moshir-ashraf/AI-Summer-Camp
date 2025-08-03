# Database Migration to Supabase

This application has been migrated from MongoDB to Supabase. Follow these steps to set up the database:

## Setup Instructions

### 1. Database Setup
1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to your project (the URL and API key are already configured in your .env file)
3. Go to the **SQL Editor** tab
4. Copy the entire contents of `server/database_setup.sql`
5. Paste it into the SQL editor and click **Run**

This will create:
- `users` table (equivalent to the old MongoDB User collection)
- `game_state` table (new - for instructor game controls)
- Proper indexes for performance
- Triggers for automatic timestamp updates

### 2. Verification
After running the SQL script, you can verify the setup by:
1. Going to the **Table Editor** in Supabase
2. You should see both `users` and `game_state` tables
3. The `game_state` table should have one default row

### 3. Running the Application
```bash
npm start
```

The application will automatically test the database connection and initialize any missing data.

## New Features

### Game State Management
The instructor now has additional controls:
- **Start Game**: Initialize a new game session
- **Pause Game**: Pause the game for all students
- **Resume Game**: Resume the game (tracks total pause time)
- **Set Current Task**: Change which task students should be working on
- **Update Settings**: Store game-specific settings

### API Endpoints
New game state endpoints are available:
- `GET /api/gameState` - Get current game state
- `POST /api/startGame` - Start/restart the game
- `POST /api/pauseGame` - Pause the game
- `POST /api/resumeGame` - Resume the game
- `POST /api/setCurrentTask` - Set current task (body: `{taskNumber: 1-5}`)
- `POST /api/updateGameSettings` - Update game settings (body: `{settings: {...}}`)

All game state endpoints require instructor authentication.

## Database Schema

### Users Table
```sql
- id (UUID, Primary Key)
- name (VARCHAR, Unique)
- score (INTEGER, Default: 0)
- last_task_completed (INTEGER, Default: 0)
- role (VARCHAR, Default: 'STUDENT')
- password (VARCHAR, Required for instructors)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Game State Table
```sql
- id (UUID, Primary Key)
- is_paused (BOOLEAN, Default: false)
- current_task (INTEGER, Default: 1)
- start_time (TIMESTAMP)
- pause_time (TIMESTAMP)
- total_pause_duration (INTEGER, Default: 0) -- seconds
- instructor_id (UUID, References users.id)
- settings (JSONB, Default: '{}')
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## Migration Notes

### Changes Made
1. **Database**: Migrated from MongoDB/Mongoose to Supabase/PostgreSQL
2. **CRUD Operations**: Updated to use Supabase client instead of Mongoose
3. **Field Names**: Converted camelCase to snake_case for database, with automatic conversion in the application layer
4. **New Model**: Added `GameState` model for instructor controls
5. **Dependencies**: Removed `mongodb` and `mongoose`, added `@supabase/supabase-js`

### Compatibility
- All existing API endpoints remain the same
- User authentication and session management unchanged
- Score tracking and leaderboard functionality preserved
- Added new game state management features

If you encounter any issues, check the console logs for specific error messages and ensure the database tables were created properly.
