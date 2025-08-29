-- StudyTimer Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Study sessions table
CREATE TABLE public.study_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    break_duration INTEGER, -- in minutes
    method TEXT NOT NULL, -- 'pomodoro', 'fifty-ten', 'ninety-fifteen', 'two-thirty', 'custom'
    study_topic TEXT, -- what the user studied (subject/topic)
    notes TEXT, -- user's session notes and insights
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User statistics table
CREATE TABLE public.user_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    total_study_time INTEGER DEFAULT 0 NOT NULL, -- total minutes studied
    total_sessions INTEGER DEFAULT 0 NOT NULL,
    current_streak INTEGER DEFAULT 0 NOT NULL, -- consecutive days studied
    longest_streak INTEGER DEFAULT 0 NOT NULL,
    last_study_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for better performance
CREATE INDEX idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX idx_study_sessions_completed_at ON public.study_sessions(completed_at);
CREATE INDEX idx_study_sessions_method ON public.study_sessions(method);
CREATE INDEX idx_user_stats_user_id ON public.user_stats(user_id);
CREATE INDEX idx_user_stats_total_study_time ON public.user_stats(total_study_time DESC);
CREATE INDEX idx_user_stats_current_streak ON public.user_stats(current_streak DESC);

-- Row Level Security Policies

-- Users can only see and update their own profile
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can only see and manage their own study sessions
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sessions" ON public.study_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON public.study_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON public.study_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessions" ON public.study_sessions FOR DELETE USING (auth.uid() = user_id);

-- Users can only see and update their own stats
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own stats" ON public.user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stats" ON public.user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stats" ON public.user_stats FOR UPDATE USING (auth.uid() = user_id);

-- Public leaderboard policy (users can see all stats for leaderboard)
CREATE POLICY "Anyone can view leaderboard stats" ON public.user_stats FOR SELECT USING (true);

-- Functions for automatic stats updates

-- Function to update user stats when a session is completed
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
DECLARE
    session_date DATE;
    last_date DATE;
    streak_count INTEGER;
BEGIN
    -- Get the date of the completed session
    session_date := DATE(NEW.completed_at);
    
    -- Get user's current stats
    SELECT last_study_date, current_streak INTO last_date, streak_count
    FROM public.user_stats 
    WHERE user_id = NEW.user_id;
    
    -- If no stats record exists, create one
    IF NOT FOUND THEN
        INSERT INTO public.user_stats (user_id, total_study_time, total_sessions, current_streak, longest_streak, last_study_date)
        VALUES (NEW.user_id, NEW.duration, 1, 1, 1, session_date);
        RETURN NEW;
    END IF;
    
    -- Calculate new streak
    IF last_date IS NULL OR session_date = last_date THEN
        -- First session or same day - maintain current streak
        streak_count := COALESCE(streak_count, 0);
    ELSIF session_date = last_date + INTERVAL '1 day' THEN
        -- Next consecutive day
        streak_count := streak_count + 1;
    ELSE
        -- Streak broken
        streak_count := 1;
    END IF;
    
    -- Update user stats
    UPDATE public.user_stats 
    SET 
        total_study_time = total_study_time + NEW.duration,
        total_sessions = total_sessions + 1,
        current_streak = streak_count,
        longest_streak = GREATEST(longest_streak, streak_count),
        last_study_date = session_date,
        updated_at = timezone('utc'::text, now())
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stats when a session is inserted
CREATE TRIGGER update_user_stats_trigger
    AFTER INSERT ON public.study_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats();

-- Function to handle user creation (from auth trigger)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', 'Anonymous'),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    
    INSERT INTO public.user_stats (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for when a user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Views for easier data access

-- Leaderboard view with user details
CREATE VIEW public.leaderboard AS
SELECT 
    u.id,
    u.name,
    u.avatar_url,
    s.total_study_time,
    s.total_sessions,
    s.current_streak,
    s.longest_streak,
    ROW_NUMBER() OVER (ORDER BY s.total_study_time DESC) as rank
FROM public.users u
JOIN public.user_stats s ON u.id = s.user_id
WHERE s.total_study_time > 0
ORDER BY s.total_study_time DESC;

-- Weekly leaderboard view
CREATE VIEW public.weekly_leaderboard AS
SELECT 
    u.id,
    u.name,
    u.avatar_url,
    SUM(ss.duration) as weekly_study_time,
    COUNT(ss.id) as weekly_sessions,
    ROW_NUMBER() OVER (ORDER BY SUM(ss.duration) DESC) as rank
FROM public.users u
JOIN public.study_sessions ss ON u.id = ss.user_id
WHERE ss.completed_at >= date_trunc('week', now())
GROUP BY u.id, u.name, u.avatar_url
HAVING SUM(ss.duration) > 0
ORDER BY weekly_study_time DESC;

-- Monthly leaderboard view
CREATE VIEW public.monthly_leaderboard AS
SELECT 
    u.id,
    u.name,
    u.avatar_url,
    SUM(ss.duration) as monthly_study_time,
    COUNT(ss.id) as monthly_sessions,
    ROW_NUMBER() OVER (ORDER BY SUM(ss.duration) DESC) as rank
FROM public.users u
JOIN public.study_sessions ss ON u.id = ss.user_id
WHERE ss.completed_at >= date_trunc('month', now())
GROUP BY u.id, u.name, u.avatar_url
HAVING SUM(ss.duration) > 0
ORDER BY monthly_study_time DESC;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;