# Consistency Checker Script

A Python script for automated consistency checking across chapters.

## Usage

```bash
python check_consistency.py --chapters-dir ./chapters --state-file ./state_table.md --foreshadow-file ./foreshadowing.md
```

## Checks Performed

1. **Resource jumps**: Food, supplies, medicine don't decrease unexpectedly
2. **Foreshadowing duplicates**: Same foreshadowing ID not used twice
3. **Timeline reverses**: Day numbers only go forward
4. **Character locations**: Characters don't appear in two places at once
5. **Word count**: Chapters under 6500 characters
6. **Missing food source**: Each chapter mentions food origin

## Output Format

```
PASS: ch001-ch005
FAIL: ch006 - Food jumped from 30 to 50 without trade scene
PASS: ch007-ch010
```

## Integration

Run every 5 chapters. All checks must PASS before continuing to next chapter.

## Customization

Edit the script to match your project's:
- Resource types (food, water, medicine, ammunition, etc.)
- Character names
- Location names
- Word count limits
