-- Drop the unused 'To-do' table to reduce attack surface
-- This table has RLS enabled but no policies and is not used in the application
DROP TABLE IF EXISTS public."To-do" CASCADE;