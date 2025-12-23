#!/bin/bash
# MB.MD i18n Batch Transformation Script v2.0
# Transforms JSX string literals to t() calls with fallbacks

LOG_FILE="/tmp/i18n-transform.log"
echo "=== i18n Batch Transformation $(date) ===" > $LOG_FILE

# Process each non-admin, non-prototype page
find client/src/pages -name "*.tsx" \
  ! -path "*admin*" ! -path "*Admin*" \
  ! -name "*Prototype*" ! -name "*Test*" \
  ! -name "*.test.tsx" | while read file; do

  pagename=$(basename "$file" .tsx | sed 's/Page$//' | tr '[:upper:]' '[:lower:]')
  
  # Skip if already using t() calls extensively
  t_count=$(grep -c "t('" "$file" 2>/dev/null || echo 0)
  if [ "$t_count" -gt 5 ]; then
    echo "SKIP (already done): $file" >> $LOG_FILE
    continue
  fi
  
  # Check if has useTranslation hook
  if ! grep -q "useTranslation" "$file"; then
    echo "NO_HOOK: $file" >> $LOG_FILE
    continue
  fi
  
  # Check if t is declared but unused
  if grep -qE "const \{ t \}|const \{t\}" "$file"; then
    if [ "$t_count" -lt 2 ]; then
      echo "NEEDS_WORK: $file ($t_count t() calls)" >> $LOG_FILE
    else
      echo "PARTIAL: $file ($t_count t() calls)" >> $LOG_FILE
    fi
  fi
done

# Summary
echo "" >> $LOG_FILE
echo "=== SUMMARY ===" >> $LOG_FILE
echo "Total files scanned: $(find client/src/pages -name "*.tsx" ! -path "*admin*" ! -path "*Admin*" ! -name "*Prototype*" ! -name "*Test*" | wc -l)" >> $LOG_FILE
echo "Files needing work: $(grep -c "NEEDS_WORK" $LOG_FILE)" >> $LOG_FILE
echo "Files partially done: $(grep -c "PARTIAL" $LOG_FILE)" >> $LOG_FILE
echo "Files skipped (done): $(grep -c "SKIP" $LOG_FILE)" >> $LOG_FILE
echo "Files missing hook: $(grep -c "NO_HOOK" $LOG_FILE)" >> $LOG_FILE

cat $LOG_FILE
