-- Test if generate_barcode function exists and works
-- Run this in Supabase SQL Editor to test

-- Test 1: Check if function exists
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'generate_barcode';

-- Test 2: Try calling the function
SELECT generate_barcode(
    '123e4567-e89b-12d3-a456-426614174000'::uuid,
    1,
    'TEST'
);

-- Test 3: Check if books table has organization_id column
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'books'
AND column_name = 'organization_id';
