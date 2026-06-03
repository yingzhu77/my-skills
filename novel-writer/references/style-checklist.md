# Style Checklist

Use this checklist for every 10-chapter review and end-of-volume revision.

## Ending Check (Every Chapter)

- [ ] Ending structure differs from last 2 chapters?
- [ ] No "log + food + summary" template?
- [ ] Summary sentence doesn't repeat log content?
- [ ] No information duplication within chapter?

Record last 5 endings:
| Ch | Type | Last Line |
|----|------|-----------|
|    |      |           |

## Repeated Phrases (Every 10 Chapters)

Scan for these patterns. Replace any that appear 3+ times in 10 chapters:

- Transition to desk/window
- Character silence + action
- Log closing phrase
- Environmental description
- Body reactions (see below)

## Body Reaction Frequency (Every 10 Chapters)

| Reaction | Count in 10ch | Max |
|----------|--------------|-----|
| breath caught | | 2 |
| fingers froze | | 2 |
| nodded | | 2/chapter |
| shoulders tensed | | 2 |
| eyes lingered | | 2 |
| mouth twitched | | 2 |

## Metaphor Tracking (Every 10 Chapters)

Each metaphor used once. Record and don't reuse:
| Metaphor | Character/Scene | Chapter |
|----------|----------------|---------|
|          |                |         |

## Character Appearance (Every 10 Chapters)

| Character | Chapters Appeared | Expected |
|-----------|------------------|----------|
| Protagonist | /10 | 10/10 |
| Core A | /10 | 7-10 |
| Core B | /10 | 7-10 |
| Supporting C | /10 | 3-5 |

## Revision Scan Commands

```bash
# Find repeated endings
grep -c "PATTERN" chapters/ch*.md

# Find repeated body reactions
grep -c "breath caught" chapters/ch*.md

# Find repeated transitions
grep -c "turned back to desk" chapters/ch*.md
```
