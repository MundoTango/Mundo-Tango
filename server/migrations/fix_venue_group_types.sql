-- Fix misclassified venue groups
-- Venue groups should have type='venue', not type='city'
-- Venues typically contain specific indicators in their names

-- Update groups that are clearly venues based on naming patterns
UPDATE groups
SET type = 'venue'
WHERE type = 'city'
  AND (
    -- Dance studios and schools
    name ILIKE '%studio%' OR
    name ILIKE '%dance%' OR
    name ILIKE '%school%' OR
    name ILIKE '%academy%' OR
    name ILIKE '%centro%' OR
    name ILIKE '%centro de%' OR
    name ILIKE '%center%' OR
    name ILIKE '%centre%' OR
    
    -- Specific venue types
    name ILIKE '%milonga%' OR
    name ILIKE '%practica%' OR
    name ILIKE '%salon%' OR
    name ILIKE '%hall%' OR
    name ILIKE '%club%' OR
    name ILIKE '%space%' OR
    name ILIKE '%venue%' OR
    name ILIKE '%room%' OR
    
    -- Named establishments
    name ILIKE '%la %' OR
    name ILIKE '%el %' OR
    name ILIKE '%cafe%' OR
    name ILIKE '%bar %' OR
    name ILIKE '%restaurant%' OR
    name ILIKE '%hotel%' OR
    
    -- Organizations with specific structure
    name ILIKE '%.%' OR  -- Groups with dots (e.g. I.AM.DANCE)
    name ILIKE '%&%' OR  -- Groups with ampersands
    
    -- Groups with possessive or descriptive structures
    name ILIKE '%\'s %' OR
    name ILIKE '% at %' OR
    name ILIKE '% de %' OR
    name ILIKE '% del %'
  );

-- Log the changes
SELECT 
  id,
  name,
  city,
  type
FROM groups
WHERE type = 'venue'
ORDER BY id;
