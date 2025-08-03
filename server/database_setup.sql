-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    score INTEGER DEFAULT 0,
    last_task_completed INTEGER DEFAULT 0,
    role VARCHAR(50) DEFAULT 'STUDENT' NOT NULL,
    password VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create game_state table for instructor controls
CREATE TABLE IF NOT EXISTS game_state (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    is_paused BOOLEAN DEFAULT false,
    current_task INTEGER DEFAULT 1,
    start_time TIMESTAMP WITH TIME ZONE,
    pause_time TIMESTAMP WITH TIME ZONE,
    total_pause_duration INTEGER DEFAULT 0, -- in seconds
    instructor_id UUID REFERENCES users(id),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_score ON users(score DESC);
CREATE INDEX IF NOT EXISTS idx_game_state_current ON game_state(is_paused, current_task);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_state_updated_at 
    BEFORE UPDATE ON game_state 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default game state if it doesn't exist
INSERT INTO game_state (is_paused, current_task, settings)
SELECT false, 1, '{}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM game_state LIMIT 1);

-- Add constraint to ensure password is required for instructors
ALTER TABLE users ADD CONSTRAINT check_instructor_password 
CHECK (
    (role = 'INSTRUCTOR' AND password IS NOT NULL) OR 
    (role != 'INSTRUCTOR')
);
