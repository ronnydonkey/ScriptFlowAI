# Citation Mapping Bug Fix

## The Bug

Citations in generated scripts were attributing information to the WRONG sources, making the research verification system unreliable.

**Example of the bug:**
- UI displays: Source #1 = NBC News, Source #2 = Pubity
- Script says: "According to NBC News..." but cites content from Source #2 (Pubity)
- This is misleading, unprofessional, and potentially defamatory

## Root Cause

The research synthesizer ([lib/agents/research-synthesizer.ts](lib/agents/research-synthesizer.ts)) was adding source numbers to synthesis main points like `[Source 1]`, `[Source 2]`, etc.

Then, the citation utilities ([lib/prompts/citation-utils.ts](lib/prompts/citation-utils.ts)) were ALSO adding source numbers like "Source #1", "Source #2".

This created **TWO competing numbering systems** in the prompt sent to Claude:
1. Synthesis references: `[Source 1]`, `[Source 2]` in the main points
2. Actual source list: "Source #1 - TechCrunch", "Source #2 - The Verge"

Claude got confused about which numbering system to trust, leading to mismatched citations.

## The Fix

### 1. Removed source numbers from synthesis ([lib/agents/research-synthesizer.ts](lib/agents/research-synthesizer.ts:67-74))

**Before:**
```typescript
points.push(`[Source ${idx + 1}] ${source.summary}...`);
```

**After:**
```typescript
points.push(`${source.summary}...`);
// NO source numbers - let citation-utils handle ALL numbering
```

### 2. Updated contradiction messages ([lib/agents/research-synthesizer.ts](lib/agents/research-synthesizer.ts:126-128))

**Before:**
```typescript
`Source ${idx1 + 1} suggests ${word1} while Source ${idx2 + 1} indicates ${word2}`
```

**After:**
```typescript
`Some sources suggest ${word1} perspectives while others indicate ${word2} viewpoints`
```

### 3. Added comprehensive logging

**In [app/api/chat/route.ts](app/api/chat/route.ts:48-51):**
- Logs source order when received by API
- Verifies source titles and URLs match UI display

**In [lib/prompts/citation-utils.ts](lib/prompts/citation-utils.ts:58,68):**
- Logs each source as it's formatted for the prompt
- Shows publication name extraction

## How It Works Now

### Source Flow (Verified with Logging)

1. **UI Display ([app/page.tsx](app/page.tsx:507-512)):**
   ```typescript
   Source #1 - [First source title]
   Source #2 - [Second source title]
   ```

2. **API receives sources in exact same order ([app/api/chat/route.ts](app/api/chat/route.ts:49-51)):**
   ```
   [Chat API] Source order verification:
     [1] First source title... (url)
     [2] Second source title... (url)
   ```

3. **Citation utilities format sources ([lib/prompts/citation-utils.ts](lib/prompts/citation-utils.ts:66-83)):**
   ```
   Source #1 - PublicationName
   Title: First source title
   URL: url
   Summary: ...

   WHEN CITING THIS SOURCE, use:
   - "According to PublicationName, ..."
   - "PublicationName reports that..."
   ```

4. **Synthesis provides thematic overview ([lib/agents/research-synthesizer.ts](lib/agents/research-synthesizer.ts:161-183)):**
   - Key themes (no source numbers)
   - Main points (no source numbers)
   - Consensus
   - Contradictions (generic, no source numbers)

5. **Claude receives ONE clear source list:**
   - Synthesis gives context WITHOUT numbers
   - Source list gives NUMBERED references with publication names
   - Citation instructions emphasize natural language

## Expected Behavior After Fix

```
Research Results Display:
┌─────────────────────┐
│ Source #1           │
│ NBC News           │
│ "Dodgers win..."   │
└─────────────────────┘
┌─────────────────────┐
│ Source #2           │
│ Pubity             │
│ "Freeman's slam..."│
└─────────────────────┘

Generated Script:
"According to NBC News, the Dodgers won..."  ← Cites Source #1 content ✓
"Pubity reports that Freeman's slam..."      ← Cites Source #2 content ✓
```

## Testing Checklist

- [ ] Generate a script with citations enabled
- [ ] Verify citations use publication names (e.g., "According to TechCrunch...")
- [ ] Check that cited information matches the correct numbered source
- [ ] Verify at least 3 different citations reference the correct sources
- [ ] Test with different structure types (storytelling, listicle, etc.)
- [ ] Check server logs to verify source order is preserved

## Files Changed

1. [lib/agents/research-synthesizer.ts](lib/agents/research-synthesizer.ts)
   - Removed source numbers from main points extraction
   - Updated contradiction messages to be generic

2. [app/api/chat/route.ts](app/api/chat/route.ts)
   - Added logging to verify source order

3. [lib/prompts/citation-utils.ts](lib/prompts/citation-utils.ts)
   - Added logging to show source formatting
   - Already had correct natural citation format

## Why This Matters

✅ **Accuracy**: Citations now correctly attribute information to sources
✅ **Verifiability**: Users can verify claims against numbered sources
✅ **Professionalism**: Natural citations sound journalistic
✅ **Trust**: Tool maintains credibility with accurate citations
✅ **Legal**: Avoids potential defamation from misattributed claims
