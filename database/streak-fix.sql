-- Streak System Fix - Enhanced Logic for 5-minute minimum and daily validation
-- Run this in your Supabase SQL Editor to update the existing trigger

-- Enhanced function to update user stats with proper streak validation
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
DECLARE
    session_date DATE;
    last_date DATE;
    streak_count INTEGER;
    daily_study_time INTEGER;
    existing_stats RECORD;
BEGIN
    -- Get the date of the completed session
    session_date := DATE(NEW.completed_at);
    
    -- Get user's current stats
    SELECT * INTO existing_stats
    FROM public.user_stats 
    WHERE user_id = NEW.user_id;
    
    -- If no stats record exists, create one
    IF NOT FOUND THEN
        -- For new users, only create streak if session >= 5 minutes
        IF NEW.duration >= 5 THEN
            INSERT INTO public.user_stats (
                user_id, 
                total_study_time, 
                total_sessions, 
                current_streak, 
                longest_streak, 
                last_study_date
            )
            VALUES (NEW.user_id, NEW.duration, 1, 1, 1, session_date);
        ELSE
            -- Create stats but no streak for sessions under 5 minutes
            INSERT INTO public.user_stats (
                user_id, 
                total_study_time, 
                total_sessions, 
                current_streak, 
                longest_streak, 
                last_study_date
            )
            VALUES (NEW.user_id, NEW.duration, 1, 0, 0, NULL);
        END IF;
        RETURN NEW;
    END IF;
    
    -- Extract current values
    last_date := existing_stats.last_study_date;
    streak_count := COALESCE(existing_stats.current_streak, 0);
    
    -- Check if user already studied today (to prevent duplicate streak increments)
    IF session_date = last_date THEN
        -- Same day - just update totals, no streak changes
        UPDATE public.user_stats 
        SET 
            total_study_time = total_study_time + NEW.duration,
            total_sessions = total_sessions + 1,
            updated_at = timezone('utc'::text, now())
        WHERE user_id = NEW.user_id;
        
        RETURN NEW;
    END IF;
    
    -- Calculate total study time for the session date to check 5-minute minimum
    SELECT COALESCE(SUM(duration), 0) + NEW.duration INTO daily_study_time
    FROM public.study_sessions 
    WHERE user_id = NEW.user_id 
    AND DATE(completed_at) = session_date;
    
    -- Only process streak logic if daily total >= 5 minutes
    IF daily_study_time >= 5 THEN
        -- Calculate new streak
        IF last_date IS NULL THEN
            -- First qualifying study day
            streak_count := 1;
        ELSIF session_date = last_date + INTERVAL '1 day' THEN
            -- Next consecutive day
            streak_count := streak_count + 1;
        ELSIF session_date > last_date + INTERVAL '1 day' THEN
            -- Streak broken - reset to 1
            streak_count := 1;
        ELSE
            -- This shouldn't happen with proper date logic, but handle edge case
            streak_count := 1;
        END IF;
        
        -- Update stats with new streak
        UPDATE public.user_stats 
        SET 
            total_study_time = total_study_time + NEW.duration,
            total_sessions = total_sessions + 1,
            current_streak = streak_count,
            longest_streak = GREATEST(longest_streak, streak_count),
            last_study_date = session_date,
            updated_at = timezone('utc'::text, now())
        WHERE user_id = NEW.user_id;
    ELSE
        -- Update totals but don't update streak (under 5 minutes total for the day)
        UPDATE public.user_stats 
        SET 
            total_study_time = total_study_time + NEW.duration,
            total_sessions = total_sessions + 1,
            updated_at = timezone('utc'::text, now())
        WHERE user_id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check and update streaks daily (can be called by a scheduled job)
CREATE OR REPLACE FUNCTION check_streak_continuity()
RETURNS void AS $$
DECLARE
    user_record RECORD;
    days_since_last_study INTEGER;
BEGIN
    -- Check all users who have active streaks
    FOR user_record IN 
        SELECT user_id, current_streak, last_study_date 
        FROM public.user_stats 
        WHERE current_streak > 0 AND last_study_date IS NOT NULL
    LOOP
        -- Calculate days since last study
        days_since_last_study := EXTRACT(days FROM (CURRENT_DATE - user_record.last_study_date));
        
        -- If more than 1 day has passed, reset streak
        IF days_since_last_study > 1 THEN
            UPDATE public.user_stats 
            SET 
                current_streak = 0,
                updated_at = timezone('utc'::text, now())
            WHERE user_id = user_record.user_id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a view to easily check user streak status
CREATE OR REPLACE VIEW public.user_streak_status AS
SELECT 
    u.id as user_id,
    u.name,
    us.current_streak,
    us.longest_streak,
    us.last_study_date,
    CASE 
        WHEN us.last_study_date = CURRENT_DATE THEN 'active_today'
        WHEN us.last_study_date = CURRENT_DATE - INTERVAL '1 day' THEN 'at_risk'
        WHEN us.current_streak > 0 THEN 'broken'
        ELSE 'no_streak'
    END as streak_status,
    CASE 
        WHEN us.last_study_date IS NULL THEN 0
        ELSE (CURRENT_DATE - us.last_study_date)::integer
    END as days_since_last_study
FROM public.users u
LEFT JOIN public.user_stats us ON u.id = us.user_id;