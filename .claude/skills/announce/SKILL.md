---
description: "/announce — Generate branded Canva assets (social cards, release announcements, marketing materials) with Dreamboard's brand voice"
user_invocable: true
---

# /announce — Brand Asset Generator

Generate professional branded assets for Dreamboard using the Canva MCP connector. One command to create social media cards, release announcements, marketing materials, or concept art.

## Trigger

User invokes `/announce` with a description of what they want. Examples:
- `/announce new Vision Board feature`
- `/announce Instagram post about habit tracking`
- `/announce app store screenshot`
- `/announce release card for PR #172`

## Brand Guidelines (always applied)

Every Canva generation prompt MUST include these brand elements:
- **Palette:** Warm earth tones — cream, stone, and gold. No pure white or pure black. Muted natural colors
- **Aesthetic:** Cozy RPG companion app. Fantasy-inspired but approachable and friendly. Not corporate, not childish, not fitness-app
- **Mascot:** Skipper the penguin — cute, sassy, adventurous. Include when appropriate
- **Tagline:** "Level Up Your Life" — use as headline or subtitle when fitting
- **Typography:** Rounded, friendly fonts (Nunito-like). Bold headlines, clean body text
- **App name:** Dreamboard (one word, capital D)

## Execution Steps

### 1. Determine asset type

Based on the user's request, pick the best `design_type`:
- **Social media:** `instagram_post`, `facebook_post`, `twitter_post`, `pinterest_pin`, `your_story`
- **Marketing:** `poster`, `flyer`, `postcard`
- **Presentation:** Use `request-outline-review` workflow for presentations
- **Document:** `doc` for written content
- **Video thumbnail:** `youtube_thumbnail`

If unclear, default to `instagram_post` (square, versatile).

### 2. Build the prompt

Construct a detailed Canva generation prompt that combines:
- The user's specific request (feature description, message, context)
- Brand guidelines above (always include palette, aesthetic, font direction)
- Specific visual direction based on context

**Prompt template:**
```
[Asset description from user request].
Style: Warm earth tones with cream and gold accents. Cozy RPG fantasy aesthetic —
friendly and approachable, not corporate. Rounded fonts similar to Nunito.
[Include "Dreamboard" app name]. [Include "Level Up Your Life" tagline if appropriate].
[Include Skipper penguin mascot if appropriate].
[Any specific visual elements from the request].
```

### 3. Generate and present

1. Call `generate-design` with the constructed prompt and chosen `design_type`
2. Present ALL generated candidates to the user with thumbnail previews
3. Ask which one they prefer (or if they want a different direction)

### 4. After selection

Once the user picks a candidate:
1. Call `create-design-from-candidate` to save it to their Canva account
2. Ask if they want any edits (text changes, color adjustments)
3. If edits requested, use `start-editing-transaction` → `perform-editing-operations` → show preview → `commit-editing-transaction`
4. Offer to export (`export-design`) in their preferred format (PNG, PDF, etc.)
5. Share the Canva design URL so they can access it directly

### 5. For release announcements specifically

When the request is about a shipped feature or PR:
1. Read recent git log to understand what was shipped
2. Craft a concise, engaging summary (not technical — user-facing benefits)
3. Generate a card that celebrates the feature, not just describes it
4. Use language like "New:" or "Just shipped:" — not changelog language

## Output

Present the generated designs with thumbnails and ask the user to pick one. After selection, provide:
- Canva design URL (for direct access)
- Export download if requested
- One-line summary of what was created

## Notes

- This skill uses the Canva MCP connector — no API keys or setup needed
- Generated designs are saved to the user's Canva account
- Brand guidelines are non-negotiable — every asset must feel like Dreamboard
- When in doubt about visual direction, check `brand-assets.md` and `design-taste.md` in the memory directory
