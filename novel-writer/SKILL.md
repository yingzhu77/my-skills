---
name: novel-writer
description: "Long-form novel writing with AI collaboration. Four-stage workflow: writing, review, consistency check, revision. Manages state tables, foreshadowing, character arcs across 50+ chapters. Use for: write novel chapter, continue novel, review chapter, revise novel, check consistency, manage foreshadowing, track character state, novel outline, chapter outline, writing rules, style check. Supports Chinese and English novels. Triggers: 'write chapter', 'novel', 'chapter review', 'story writing', 'book writing', 'long fiction', 'serial novel', 'web novel', 'writing workflow', 'chapter consistency'."
---

# Novel Writer

**IRON LAW: Every chapter must advance at least one of: plot, character arc, world-building. A chapter that only maintains status quo is a wasted chapter.**

## Project Structure

```
novel-project/
  bible.md                  # World, characters, immutable rules
  style_guide.md            # Voice, tone, prose rules
  outline.md                # Full series outline by volume
  state_table.md            # Current state: resources, locations, injuries
  foreshadowing.md          # Active and archived foreshadowing
  confirmed_facts.md        # Established story facts
  open_issues.md            # Unresolved questions, next-chapter constraints
  resource_snapshot.md      # Per-chapter resource tracking
  chapters/
    ch001.md                # Chapter text
    summaries.md            # All chapter summaries (150-300 words each)
  logs/
    ch001_log.md            # Writing log (YAML, creative decisions only)
  reviews/
    ch001_review.md         # Review report
  scripts/
    check_consistency.py    # Automated consistency checker
```

## Four-Stage Workflow

### Stage 1: Write Chapter

Load: bible + style guide + current chapter outline + state table + foreshadowing index + last 3 chapters + open issues constraints.

Output:
1. Chapter text (under 6500 Chinese characters or equivalent)
2. Writing log (YAML, creative decisions only, NOT fact extraction)

Writing log format:
```yaml
chapter: N
title: "Chapter Title"
timeline: "Day X, time of day"
creative_decisions:
  - "Why this POV, what alternative was rejected"
foreshadow_new:
  - id: "F-XXX"
    content: "New foreshadowing"
foreshadow_resolve:
  - id: "F-XXX"
    resolution: "How it was resolved"
next_chapter_must_remember:
  - "Hard constraint for next chapter"
```

### Stage 2: Review Chapter

Load: chapter text + writing log + all state files + foreshadowing + chapter outline.

Check:
- Continuity (bible, state table, foreshadowing, timeline)
- Chapter goals (conflict, information increment, hook)
- Writing quality (show don't tell, no info-dumps, scene-based exposition)
- **Style consistency** (ending variety, repeated phrases, body reactions)

Output:
1. Review report (pass / minor-fix / rewrite)
2. Direct file updates to confirmed_facts, open_issues, resource_snapshot, foreshadowing, summaries

### Stage 3: Consistency Check

Every 5 chapters, run automated checks:
- Resource jumps (food, supplies)
- Foreshadowing duplicates
- Timeline reversals
- Character location errors
- Word count violations

### Stage 4: Revision (End of Volume)

After each volume (30 chapters), run style revision:
1. Scan for repeated endings, phrases, metaphors
2. Fix template patterns (e.g., same ending structure 3+ chapters in a row)
3. Vary character body reactions
4. Remove information redundancy at chapter ends

## Show Don't Tell

Never write "He was shocked" / "She was sad" / "They were angry."

Instead use:
- **Action**: pause, clench fingers, look away, check an unrelated gauge
- **Dialogue**: short sentences, deflection, questions, silence
- **Objects**: water flask, debt chip, memory shard, wrench, old photo
- **Environment**: alarm lights, wind, leaking pipes, generator hum
- **Choice**: who gets the last medicine, what to repair first

## Ending Diversity (Critical)

Endings are the #1 place where template patterns accumulate.

### 6 Ending Types (Rotate)

| Type | Example | When to Use |
|------|---------|-------------|
| Dialogue | "The light is still on." | Character declaration |
| Action | She turned and walked away. | Scene transition |
| Environment | Wind rattled the tin roof. | Mood/atmosphere |
| Internal | But the light exposed their position. | Reflection/conflict |
| Object | The chip glowed faintly on the desk. | Suspense/symbol |
| Log | He wrote the last line and closed the book. | Ritual/record |

### Forbidden Patterns

- Same ending structure 3+ chapters in a row
- "He closed the log + food status + summary sentence" template
- Same environment description 3+ chapters in a row
- Repeating information already stated in the chapter

## Body Reaction Variety

Prepare 5-8 reactions per emotion. Never use the same one more than twice in 10 chapters.

**Shock**: breath caught, fingers froze, temple pulsed, gaze locked, lips moved without sound
**Tension**: fingers tightened, shoulders tensed, leaned back, eyes narrowed, jaw clenched
**Thinking**: eyes lingered, fingers tapped desk, leaned back, head tilted, mouth twitched
**Agreement**: nodded (max 2/chapter), didn't deny, didn't argue, paused then spoke

## Scene-Based Exposition

World-building, tech rules, and resource info must enter through scenes:
- Repair failures show tech limits
- Trade prices show scarcity
- Patient symptoms show contamination
- Defense battles show base weaknesses
- Allocation disputes show governance rules

NO encyclopedia paragraphs. Reader sees the problem first, then understands the rule.

## Food as Scene, Not Inventory

Do NOT write "Today's rations came from XX, food line stable" in maintenance logs.

Instead: characters eating, trading, distributing rations, checking supplies with worry. If the chapter has a trade or distribution scene, no extra food mention needed.

## Information Deduplication

Same fact appears in at most 2 of: dialogue, internal monologue, maintenance log. Never all three.

## State Management

### State Table
Keep only last 3 chapters in detail. Older entries compress to one-line summaries.

### Foreshadowing Table
Split into:
- **Active**: needs attention in next 10 chapters
- **Archived**: resolved or long-shelved

Writing agent only reads active section.

## Anti-Patterns

1. **Ending template**: every chapter ends with log + food + summary
2. **Environment repeat**: same window description every chapter
3. **Metaphor reuse**: same metaphor for different characters
4. **Reaction freeze**: character always "breathes caught"
5. **Food inventory**: rations as accounting, not scene
6. **Triple duplication**: same info in dialogue + thought + log
7. **Log as safety net**: maintenance log as default ending
8. **Mid-section formula**: crisis -> negotiation -> temp fix -> new threat on repeat

## Confirmation Gates

Stop and ask before:
- Major character death, betrayal, or relationship change
- World-rule changes
- Volume transitions
- Every 10-chapter review

## Pre-Delivery Checklist

Before marking a chapter complete:
- [ ] Advances at least one of: plot, character, world
- [ ] Has clear conflict and information increment
- [ ] Ending differs from last 2 chapters in structure
- [ ] No body reaction repeated from last 5 chapters
- [ ] Food info is scene-based, not inventory
- [ ] Same fact not in all 3 of dialogue/thought/log
- [ ] Under 6500 characters
- [ ] Writing log has creative decisions, not fact extraction
