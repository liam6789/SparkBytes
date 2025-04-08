ALTER TABLE events RENAME COLUMN date TO start_time;
ALTER TABLE foods ADD COLUMN dietary_tags TEXT DEFAULT '';