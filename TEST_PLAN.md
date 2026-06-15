# Test Plan - Roast My App AI

## What Was Tested

Screens:
- Home / Hero
- Signal / Project input
- Mode selector
- Loading / Analysis pipeline
- Result
- Result tabs
- History / Library
- Floating bottom navigation
- Demo project picker

Core behavior:
- Mock fallback without API key
- Input quality meter
- Advanced details
- Suggestions and focus behavior
- Mode selection
- Analysis depth selection
- Copy buttons
- Save to history
- Open/repeat/delete history items
- Reload persistence
- Responsive layout
- Basic accessibility and keyboard/source review

Technical checks:
- No API key found in client source
- `.env.example` exists
- Console errors checked during normal flows
- `vite-dev.log` reviewed
- Node version checked
- `npm install --dry-run` passed
- `npm run build` passed after fixes

## Scenarios

### Scenario 1

New user opens app -> clicks `Разнести проект` -> enters only project name -> tries to analyze.

Status: Passed after fix.

Notes:
- Continue button stays disabled.
- Missing inline explanation near CTA was fixed in BUG-007.

### Scenario 2

User enters a normal idea without details -> checks input quality -> selects Threads-bro -> gets analysis.

Status: Passed.

Notes:
- Quality meter changed to normal signal.
- Threads-bro mode reached result.
- Mock analysis returned.
- No undefined/null/NaN found.

### Scenario 3

User loads DayPilot demo -> chooses mentor -> gets result -> copies Threads posts -> saves to history.

Status: Passed.

Notes:
- Demo result opens.
- Copy all Threads posts writes to clipboard.
- Save changes button to saved state.
- History persists after reload.

### Scenario 4

User loads Money Control demo -> chooses Investor -> Deep audit -> gets result -> clicks `Больше про бизнес`.

Status: Passed after fix.

Notes:
- Money Control demo opens with Investor and Deep audit.
- `Больше про бизнес` reruns pipeline and returns Investor result.
- Follow-up actions now set matching mode/depth focus.

### Scenario 5

User loads StreakTogether demo -> Launch review -> result -> copy offer -> repeat analysis.

Status: Passed, with manual upload/real browser caveat unrelated to this scenario.

Notes:
- StreakTogether demo opens with Threads-bro and Launch review.
- `Разнести еще раз` resets to Signal after transition.
- Copy offer label was fixed to `Скопировать оффер`.

### Scenario 6

User uploads screenshot -> deletes it -> uploads another -> checks preview.

Status: Partially tested by source review; upload accessibility fixes applied.

Notes:
- Browser automation surface did not expose file upload.
- Source supports png/jpg/webp, preview, delete, and file size validation.
- Keyboard and same-file re-upload issues fixed in BUG-006. Real file picker still needs manual browser QA.

### Scenario 7

User enters very long text in idea and landing text.

Status: Passed.

Notes:
- No horizontal overflow.
- Textareas scroll internally.
- Special symbols, emoji, Russian/English text did not break layout.

### Scenario 8

User saves 3 results -> goes to History -> opens, filters, deletes, repeats.

Status: Passed after fix.

Notes:
- Filters work.
- Open works.
- Delete works.
- Repeat opens Mode and now shows project/stage context.

### Scenario 9

User reloads page -> checks that history and last draft persist.

Status: Passed for history after fix.

Notes:
- Saved history remained after reload.
- Deleted item did not return.
- Analyze nav no longer clears the current draft.

### Scenario 10

Corrupt localStorage manually -> app should recover.

Status: Source-confirmed risk fixed, not browser-reproduced.

Notes:
- Browser automation sandbox did not allow Storage API mutation.
- Storage now sanitizes draft/settings/history and validates saved results.

### Scenario 11

Open app on mobile width -> complete Home to Result flow.

Status: Passed after responsive fix.

Notes:
- Flow works on mobile widths.
- 375x667 primary CTA is visible and short-height bottom nav is hidden.

### Scenario 12

Check all buttons on Result.

Status: Passed after copy/accessibility fixes.

Notes:
- Main copy buttons write real clipboard text.
- Save works.
- Tabs work.
- Follow-up actions rerun analysis.
- Individual post copy buttons now have contextual aria-labels.

## Scenarios Not Fully Verified

- Real OpenAI mode with actual `OPENAI_API_KEY`.
- File picker upload in browser automation.
- Clipboard API hard failure in a browser that denies both Clipboard API and execCommand.
- Manual drag-and-drop of screenshot file.
- Full screen-reader pass.
- Full keyboard-only flow across every control.

## Tests Worth Automating

1. Unit test `calculateInputQuality`:
   - empty input
   - name only
   - idea only
   - full context
   - screenshot present

2. Unit test `validateRoastResult`:
   - valid result
   - missing weak point
   - bad score
   - fewer than 3 posts

3. Unit test storage guards:
   - corrupted JSON
   - malformed history item
   - invalid stage/mode/depth
   - result with string score

4. Component/e2e test main flow:
   - Home -> Signal -> Mode -> Loading -> Result
   - mock fallback
   - save/open/delete history

5. E2E copy tests:
   - full report
   - all Threads posts
   - offer
   - individual post

6. Responsive tests:
   - 375x667 hero CTA visibility
   - 390x844 mobile result tabs
   - 1366x768 result nav overlap
   - no horizontal overflow

7. Accessibility tests:
   - all buttons have unique accessible names where necessary
   - upload is keyboard reachable
   - focus ring is visible
   - dropdown exposes expanded state

## Edge Cases Still Remaining

- Very large localStorage after many base64 screenshots.
- API route timeout with partial OpenAI response.
- Real AI returning valid JSON with poor content quality.
- Multiple tabs editing same localStorage keys.
- User saving the same result many times.
- Extremely long project name in history cards.
- Non-image file drag/drop.
- Same image selected twice after deletion.

## Final Notes

The app is visually strong and the core mock flow works. The fix sprint resolved the navigation, storage, responsive, copy, and accessibility issues found in this QA pass.

Post-fix verification:
- `npm run build` passed.
- `npm install --dry-run` passed.
- UTF-8/mojibake scan passed.
- Browser smoke confirmed Home, Signal, Mode, Result labels, responsive guards, and History CTA.

Still worth manual QA:
- Real browser screenshot upload/delete/re-upload.
- Real OpenAI mode with `OPENAI_API_KEY`.
- Full keyboard-only and screen-reader pass.
