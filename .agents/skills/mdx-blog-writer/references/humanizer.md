# Writing Humanizer — Reference Guide

Full rules for transforming any draft into clear, direct, human-sounding prose. Apply these before finalizing every post.

---

## Purpose

The goal is to strip away AI-generated patterns, marketing fluff, and unnecessary complexity so the writing sounds like a real person talking to another real person. Clear. Direct. Credible.

---

## Guidelines

### 1. Focus on Clarity

Make every sentence immediately understandable on the first read. If a reader has to re-read a sentence, it needs to be rewritten.

Good: "Please send the file by Monday."

For technical or specialized topics, clarity does not mean removing necessary complexity. Keep the accurate term, API name, command, design pattern, or caveat, then explain it in plain language.

### 2. Be Direct and Concise

Get to the point. Remove any setup, preamble, or throat-clearing that delays the actual message.

Good: "We should meet tomorrow."

### 3. Use Simple Language

Use plain words and clean sentences. Mix short, medium, and longer sentences so the writing has rhythm instead of a clipped, mechanical pace. Avoid dense constructions when a simpler one works just as well.

Good: "I need help with this issue."

### 4. Preserve Technical Precision

Do not flatten meaning to make the prose sound casual. Preserve domain vocabulary when it is the correct term, especially for code, APIs, architecture, data models, product names, legal concepts, measurements, and quoted language.

Good: "The API returns a signed URL that expires after 15 minutes."

### 5. Avoid Fluff

No unnecessary adjectives or adverbs. Every modifier should earn its place by changing the meaning.

Good: "We finished the task." (not "We successfully completed the critical task.")

### 6. Avoid Marketing Hype

Don't over-promise. Don't use promotional buzzwords. Describe what something does, not how amazing it is.

Good: "This tool helps you manage tasks." (not "This revolutionary platform transforms how you work.")

### 7. Keep It Real

Be honest. Avoid forced friendliness or exaggeration. If something has limits, acknowledge them.

Good: "I don't think that's the best approach here."

Do not change the factual meaning of source material while making it sound better. Preserve names, dates, numbers, technical claims, quotes, caveats, and uncertainty unless the user asks for a substantive rewrite or a verified correction.

### 8. Calibrate the Voice

Match the audience, subject, and publication context. A beginner guide can be warmer and more explanatory. A technical deep dive can be direct and precise. A personal essay can carry more voice. Do not use one casual tone for every piece.

### 9. Maintain a Natural, Conversational Tone

It's okay to start sentences with "And" or "But." Let the prose breathe. Don't write like a press release.

Good: "And that's exactly where most setups break down."

### 10. Do Not Over-Humanize

Do not add fake anecdotes, forced jokes, excessive contractions, slang, or emotional color that was not earned by the draft. The goal is credible human writing, not performative casualness.

### 11. Simplify Grammar

Don't stress over perfection when informal constructions sound more natural. Match the voice of the post.

### 12. Avoid AI-Giveaway Phrases

These patterns immediately signal machine-generated text. Remove all of them.

**Never use:**
- "dive into", "delve into"
- "unleash your potential"
- "game-changing", "cutting-edge", "innovative"
- "seamlessly", "robust", "leverage", "synergy"
- "In today's fast-paced world..."
- "Now more than ever..."
- "This changes everything..."
- "It's important to note that..."
- "In conclusion...", "In closing..."
- "Ah, the old..."
- "Not just X, but also Y."
- "This isn't X, it's Y."
- Salesperson triads: "You can. You will. You must."

### 13. Vary Sentence Structures

Mix short sentences with medium and longer ones. Avoid both monotone blocks and a stack of one-line punches. Rhythm should feel natural, not artificially varied.

### 14. Address Readers Directly

Use "you" and "your" where it makes sense. Pull the reader into the writing.

Good: "You can apply this method right away."

### 15. Use Active Voice

Find passive constructions and flip them.

- Before: "The report was submitted by the team."
- After: "The team submitted the report."

Keep passive voice when the actor is unknown, irrelevant, or less important than the action.

### 16. Avoid Filler Phrases

These add words without meaning. Cut them.

- "It's important to note that..."
- "It's worth mentioning that..."
- "As previously mentioned..."
- "For all intents and purposes..."

### 17. Remove Cliches, Empty Jargon, Hashtags, and Decorative Emphasis

If the phrase is something you'd see in a LinkedIn post or a press release, cut it.

Bad: "Let's touch base to move the needle on this mission-critical deliverable."
Good: "Let's meet to talk about improvements for this project."

Remove hashtags, emojis, and decorative emphasis unless the user or publication format explicitly requires them. Keep Markdown asterisks when they are required for valid MDX emphasis.

### 18. Preserve Real Uncertainty

When you know something is true, say it plainly. Remove false hedges, but preserve genuine uncertainty, version limits, tradeoffs, and source caveats.

- Hedged: "This might help."
- Direct: "This helps."

Reserve "might", "could", and "may" for genuine uncertainty only.

### 19. Improve Transitions and Flow

Make the draft feel connected. Each paragraph should grow from the previous one, answer the next reader question, or deliberately shift the discussion. Add light transitions when sections feel like disconnected notes.

### 20. Protect the Reader Payoff

The final draft should make clear what the reader can do, understand, decide, or notice after reading. If the piece has no payoff, revise the angle before polishing sentences.

### 21. End With a Useful Landing

Do not end with a generic summary or "in conclusion." Close with the most useful takeaway, a practical next step, an earned reflection, or a final sentence that makes the point land.

### 22. Eliminate Redundancy

Remove duplicate words, restated points, and ideas that appear twice in different phrasing. Every paragraph should move forward.

### 23. Avoid Forced Keyword Placement

Keywords should appear naturally in the flow of the sentence. If inserting one makes the sentence awkward, rewrite the sentence around the idea, not the keyword.

---

## Humanizer Checklist

Run this on every draft before finalizing. Fix anything that fails.

### Clarity
- [ ] Is every sentence immediately understandable on first read?
- [ ] Are there any ambiguous pronouns or unclear antecedents?
- [ ] Are complex ideas broken into smaller pieces?
- [ ] Are necessary technical terms preserved and explained instead of removed?

### Directness
- [ ] Does every paragraph get to the point within the first two sentences?
- [ ] Are there any sentences that could be cut without losing meaning?

### Simple Language
- [ ] Are complex words replaced with simpler alternatives where possible?
- [ ] Is sentence length varied (short, medium, longer)?

### Voice and Tone
- [ ] Does the text feel like a conversation rather than a lecture?
- [ ] Is the tone consistent throughout, with no sudden shifts to formal or salesy?
- [ ] Are contractions used naturally?
- [ ] Is the voice calibrated to the audience, topic, and publication context?
- [ ] Does the draft avoid fake anecdotes, forced jokes, and performative casualness?

### Active Voice
- [ ] Are passive constructions identified and revised where they weaken the sentence?
  - Before: "The file was submitted by the team."
  - After: "The team submitted the file."

### No AI Fingerprints
- [ ] Are all banned words and phrases removed (see Guidelines section above)?
- [ ] Does the text avoid starting consecutive sentences with the same word?
- [ ] Is the rhythm natural, not artificially varied?
- [ ] Are cliches, empty jargon, hashtags, emojis, and decorative emphasis removed?

### Factual Integrity
- [ ] Are names, dates, numbers, technical claims, and quotes preserved from the source material?
- [ ] Are uncertain claims still framed with the right level of uncertainty?
- [ ] Did the rewrite avoid adding new facts that were not supplied or verified?

### Redundancy
- [ ] Are duplicate ideas removed, even when phrased differently?
- [ ] Are there any restated points that don't add new value?

### Conditional Language
- [ ] Are false hedges removed where the fact is certain?
- [ ] Are real uncertainty, version limits, tradeoffs, and caveats preserved?

### Flow and Payoff
- [ ] Do paragraphs and sections connect naturally?
- [ ] Does each paragraph move the piece forward?
- [ ] Is the reader payoff clear?
- [ ] Does the ending avoid a generic summary and land on a useful takeaway?

---

## Applying the Checklist — Process

1. Read the full draft once without editing.
2. Go back and apply each checklist category in order.
3. Compare the revised draft against the source material. Check names, dates, numbers, claims, examples, quotes, and caveats.
4. Reread the revised draft out loud (or simulate it). If it sounds unnatural, revise again.
5. Confirm the key message and reader payoff are still intact and easy to find.
6. Check the ending. Replace generic wrap-ups with a practical takeaway, next step, or earned reflection.

---

## Optional Inputs to Shape the Output

When the user provides extra context, incorporate it during the humanizer pass:

- **Audience Profile** — adjust vocabulary and assumed knowledge to match (e.g., technical experts vs. general public).
- **Tone/Style Preferences** — honor any specific voice requested (e.g., casual, professional, empathetic).
- **Key Terms** — preserve essential words and phrases even if the surrounding prose is rewritten.
- **Target Length** — tighten or expand accordingly, cutting or adding only what serves the reader.
- **Publication Context** — adjust how casual, technical, personal, or direct the final prose should be.
