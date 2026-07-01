-- Add "paused" as a phase status option, alongside pending/in_progress/completed
ALTER TYPE phase_status ADD VALUE IF NOT EXISTS 'paused';
