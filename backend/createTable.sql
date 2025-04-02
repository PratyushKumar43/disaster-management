-- Create the inventory table
CREATE TABLE IF NOT EXISTS inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    department_type TEXT NOT NULL,
    department_name TEXT NOT NULL,
    item_code INTEGER NOT NULL,
    item_name TEXT NOT NULL,
    quantity INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_inventory_state ON inventory(state);
CREATE INDEX IF NOT EXISTS idx_inventory_district ON inventory(district);
CREATE INDEX IF NOT EXISTS idx_inventory_department_type ON inventory(department_type);
CREATE INDEX IF NOT EXISTS idx_inventory_department_name ON inventory(department_name);
CREATE INDEX IF NOT EXISTS idx_inventory_item_code ON inventory(item_code);
CREATE INDEX IF NOT EXISTS idx_inventory_item_name ON inventory(item_name);

-- Enable Row Level Security (RLS)
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anon key to read inventory
CREATE POLICY "Allow public read access"
    ON inventory FOR SELECT
    USING (true);

-- Create policy to allow anon key to insert inventory
CREATE POLICY "Allow anon insert access"
    ON inventory FOR INSERT
    WITH CHECK (true);

-- Create policy to allow authenticated users to update inventory
CREATE POLICY "Allow authenticated users to update inventory"
    ON inventory FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to delete inventory
CREATE POLICY "Allow authenticated users to delete inventory"
    ON inventory FOR DELETE
    USING (auth.role() = 'authenticated'); 