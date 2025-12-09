-- 13-Digit Structured Student ID System
-- Format: XXYY-NNNN-NNN-C (13 digits total)
-- XX   = University code (01-99)
-- YY   = Year (24 = 2024)
-- NNNN = Sequence number (0001-9999)
-- NNN  = Department/Faculty code (001-999)
-- C    = Check digit (EAN-13 algorithm)

-- 1. Create sequence for student numbers
CREATE SEQUENCE IF NOT EXISTS student_id_sequence START WITH 1;

-- 2. Update student_number column to support 13 digits
ALTER TABLE profiles 
ALTER COLUMN student_number TYPE VARCHAR(13);

-- 3. Add department_code column
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS department_code VARCHAR(3) DEFAULT '001';

-- 4. Create function to calculate EAN-13 check digit
CREATE OR REPLACE FUNCTION calculate_ean13_check_digit(barcode TEXT)
RETURNS INTEGER AS $$
DECLARE
    sum_odd INTEGER := 0;
    sum_even INTEGER := 0;
    total INTEGER;
    check_digit INTEGER;
    i INTEGER;
BEGIN
    -- Calculate sum of digits at odd positions (1st, 3rd, 5th, etc.)
    FOR i IN 1..LENGTH(barcode) BY 2 LOOP
        sum_odd := sum_odd + SUBSTRING(barcode FROM i FOR 1)::INTEGER;
    END LOOP;
    
    -- Calculate sum of digits at even positions (2nd, 4th, 6th, etc.)
    FOR i IN 2..LENGTH(barcode) BY 2 LOOP
        sum_even := sum_even + SUBSTRING(barcode FROM i FOR 1)::INTEGER;
    END LOOP;
    
    -- Total = (sum_odd * 1) + (sum_even * 3)
    total := sum_odd + (sum_even * 3);
    
    -- Check digit = (10 - (total mod 10)) mod 10
    check_digit := (10 - (total % 10)) % 10;
    
    RETURN check_digit;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 5. Create function to generate 13-digit student ID
CREATE OR REPLACE FUNCTION generate_13digit_student_id()
RETURNS TRIGGER AS $$
DECLARE
    university_code TEXT := '01';  -- Default university code
    year_code TEXT;
    sequence_num TEXT;
    dept_code TEXT;
    base_id TEXT;
    check_digit INTEGER;
    final_id TEXT;
BEGIN
    -- Only generate if student_number is NULL
    IF NEW.student_number IS NULL THEN
        -- Get 2-digit year (e.g., 24 for 2024)
        year_code := TO_CHAR(CURRENT_DATE, 'YY');
        
        -- Get 4-digit sequence number (zero-padded)
        sequence_num := LPAD(nextval('student_id_sequence')::TEXT, 4, '0');
        
        -- Get department code (default 001 if not set)
        dept_code := COALESCE(NEW.department_code, '001');
        
        -- Combine: XXYY + NNNN + NNN (12 digits)
        base_id := university_code || year_code || sequence_num || dept_code;
        
        -- Calculate check digit
        check_digit := calculate_ean13_check_digit(base_id);
        
        -- Final 13-digit ID
        final_id := base_id || check_digit::TEXT;
        
        -- Assign to NEW record
        NEW.student_number := final_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger to auto-generate 13-digit student ID
DROP TRIGGER IF EXISTS trigger_generate_13digit_student_id ON profiles;
CREATE TRIGGER trigger_generate_13digit_student_id
    BEFORE INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION generate_13digit_student_id();

-- 7. Backfill existing users with 13-digit IDs
DO $$
DECLARE
    profile_record RECORD;
    university_code TEXT := '01';
    year_code TEXT;
    sequence_num TEXT;
    dept_code TEXT;
    base_id TEXT;
    check_digit INTEGER;
    final_id TEXT;
BEGIN
    year_code := TO_CHAR(CURRENT_DATE, 'YY');
    
    FOR profile_record IN 
        SELECT id, department_code FROM profiles 
        WHERE student_number IS NULL OR LENGTH(student_number) != 13
    LOOP
        -- Get next sequence
        sequence_num := LPAD(nextval('student_id_sequence')::TEXT, 4, '0');
        
        -- Department code
        dept_code := COALESCE(profile_record.department_code, '001');
        
        -- Base ID (12 digits)
        base_id := university_code || year_code || sequence_num || dept_code;
        
        -- Calculate check digit
        check_digit := calculate_ean13_check_digit(base_id);
        
        -- Final ID (13 digits)
        final_id := base_id || check_digit::TEXT;
        
        -- Update
        UPDATE profiles 
        SET student_number = final_id 
        WHERE id = profile_record.id;
    END LOOP;
END $$;

-- 8. Create index
CREATE INDEX IF NOT EXISTS idx_profiles_student_number_13 ON profiles(student_number);

-- 9. Add comments
COMMENT ON COLUMN profiles.student_number IS '13-digit structured student ID (Format: XXYY-NNNN-NNN-C)';
COMMENT ON COLUMN profiles.department_code IS 'Department/Faculty code (001-999)';

-- 10. Example department codes (optional - customize as needed)
COMMENT ON COLUMN profiles.department_code IS 
'Department codes:
001 - General
101 - Computer Science / IT
102 - Engineering
103 - Mathematics
201 - Medicine
202 - Biology
301 - Economics
302 - Business
401 - Law
501 - Arts & Humanities';
