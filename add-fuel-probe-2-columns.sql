ALTER TABLE vehicles
ADD COLUMN IF NOT EXISTS fuel_probe_2_level NUMERIC,
ADD COLUMN IF NOT EXISTS fuel_probe_2_volume_in_tank NUMERIC,
ADD COLUMN IF NOT EXISTS fuel_probe_2_temperature NUMERIC,
ADD COLUMN IF NOT EXISTS fuel_probe_2_level_percentage NUMERIC;
