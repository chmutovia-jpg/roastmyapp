# QA Report - Roast My App AI

## Summary

Total bugs found: 13 product/frontend issues + 2 responsive issues + 4 logic/copy risks.

Critical: 0
High: 4
Medium: 6
Low: 3
UX/Text issues: 7

Tested date: 2026-06-14

Build command status: Passed (`npm run build`)

Install command status: Passed dry-run (`npm install --dry-run`)

Fix sprint status: Completed for all logged Critical/High/Medium/Low issues.

Main risk: real OpenAI mode still needs verification with an actual server-side key; mock/demo mode is stable.

## Test Environment

Browser: Codex in-app browser / Chromium surface

Screen sizes:
- 1920x1080
- 1440x900
- 1366x768
- 1024x768
- 834x1194
- 430x932
- 390x844
- 375x667

Node version: v24.14.0

OS: Windows, PowerShell workspace

App mode: Mock / Demo analysis

API key present: no verified key in client; `.env.example` only.

Console errors: none observed during normal flow.

Git status: not checked because `git` command is not available in PATH.

## Post-Fix Verification

- `npm run build`: Passed.
- `npm install --dry-run`: Passed.
- UTF-8/mojibake scan over `src`, `api`, and markdown files: Passed.
- Browser check: Home hero, Signal draft preservation, Modes without project name, Result labels, Threads copy labels, responsive 375x667 and 1366x768, and History CTA verified.
- Remaining manual checks: real file picker upload and real OpenAI mode with a server-side key.

## Critical Bugs

No Critical bugs found.

## High Priority Bugs

### BUG-001 - Analyze navigation clears current draft

Severity: High

Area: Navigation / Storage / Input

Status: Fixed

Fix note:
Top/bottom Analyze now navigates to Signal without clearing the draft. Explicit reset remains on new-roast actions.

Changed files:
- `src/App.tsx`

Steps to reproduce:
1. Open Analyze / Signal screen.
2. Enter a long idea in the main textarea.
3. Click top navigation `Analyze`.

Expected result:
The app should return to the Analyze/Signal screen without deleting the current draft, or clearly ask for confirmation before starting a new empty roast.

Actual result:
The current draft is reset immediately. The saved draft is overwritten with the empty state.

Impact:
User can lose a work-in-progress project by clicking what looks like navigation.

Suggested fix:
Make top/bottom `Analyze` navigate to the input screen without clearing data. Keep destructive reset only for explicit `Разнести еще раз` / new-roast actions.

Files likely involved:
- `src/App.tsx`

---

### BUG-002 - Modes navigation ignores valid signal when project name is empty

Severity: High

Area: Navigation / Flow

Status: Fixed

Fix note:
Modes navigation now uses the same signal-readiness rule as the form: idea, landing text, or screenshot.

Changed files:
- `src/App.tsx`

Steps to reproduce:
1. Open Signal screen.
2. Enter a valid idea, but leave project name empty.
3. Click top navigation `Modes`.

Expected result:
Because project name is optional and the signal is valid, the app should open Mode selection.

Actual result:
The app stays on Signal/Input.

Impact:
Contradicts the product promise that project name is optional and makes navigation feel broken.

Suggested fix:
Use the same signal readiness check as the Continue button: idea text, landing text, or screenshot.

Files likely involved:
- `src/App.tsx`

---

### BUG-003 - Floating bottom nav overlaps important controls on short viewports

Severity: High

Area: Responsive / Navigation

Status: Fixed

Fix note:
Mobile hero vertical rhythm was reduced and bottom nav is hidden on short-height viewports where it would cover controls.

Changed files:
- `src/components/Hero.tsx`
- `src/App.tsx`
- `src/index.css`

Steps to reproduce:
1. Open Home at 375x667.
2. Observe hero CTA area.
3. Open Result at 1366x768.
4. Observe section navigation.

Expected result:
Primary CTA and result tabs should never sit under the floating nav.

Actual result:
At 375x667, hero CTA touches/enters the bottom-nav zone. At 1366x768, result tabs can appear behind the floating nav.

Impact:
On smaller screens, the app feels less usable and can block the main path.

Suggested fix:
Reduce mobile hero vertical footprint, keep CTA higher, and hide or compact bottom nav on short-height viewports.

Files likely involved:
- `src/components/Hero.tsx`
- `src/App.tsx`
- `src/index.css`

---

### BUG-004 - Corrupted localStorage history is not deeply validated

Severity: High

Area: Storage / History

Status: Fixed

Fix note:
Storage now sanitizes draft/settings/history and validates saved results before rendering History.

Changed files:
- `src/services/storage.ts`

Steps to reproduce:
1. Put malformed-but-parseable data into `roastmyapp.history`, for example an item with `result.score` as a string.
2. Reload app.
3. Open History.

Expected result:
Invalid records should be discarded and the app should recover.

Actual result:
Source review shows `loadHistory()` only checks `id`, `input`, and `result`. `HistoryPanel` later calls `item.result.score.toFixed(1)`, which can crash with malformed records.

Impact:
One bad localStorage write can break the library screen.

Suggested fix:
Validate/sanitize history item shape with `validateRoastResult`, safe input parsing, known stage/mode/depth values, and valid dates.

Files likely involved:
- `src/services/storage.ts`
- `src/utils/validateRoastResult.ts`
- `src/components/HistoryPanel.tsx`

## Medium Priority Bugs

### BUG-005 - CopyButton can show success even if fallback copy fails

Severity: Medium

Area: Copy / Clipboard

Status: Fixed

Fix note:
Copy helper now returns a success flag. The button shows `Не скопировано` when both Clipboard API and fallback fail.

Changed files:
- `src/components/CopyButton.tsx`

Steps to reproduce:
1. Disable or deny Clipboard API.
2. Trigger fallback copy in a browser where `document.execCommand("copy")` fails.
3. Click any copy button.

Expected result:
The UI should only show copied when text is actually copied, or show a soft failure state.

Actual result:
The catch path still sets `copied` to true.

Impact:
User may believe text is copied when clipboard is unchanged.

Suggested fix:
Return a boolean from the copy helper and show an error state if both Clipboard API and fallback fail.

Files likely involved:
- `src/components/CopyButton.tsx`

---

### BUG-006 - Upload area is not fully keyboard-accessible and same-file re-upload can fail

Severity: Medium

Area: Input / Accessibility / Upload

Status: Fixed

Fix note:
Upload area now has button semantics, Enter/Space activation, a file input ref, and clears file input value after selection.

Changed files:
- `src/components/ProjectForm.tsx`

Steps to reproduce:
1. Navigate by keyboard to screenshot upload area.
2. Try to activate it with Enter/Space.
3. Upload, delete, then choose the same file again.

Expected result:
Upload should be reachable by keyboard and selecting the same file again should fire change.

Actual result:
Visible upload UI is a label without explicit keyboard behavior. File input value is not reset after change.

Impact:
Keyboard users have a weaker path; repeated screenshot tests can feel broken.

Suggested fix:
Add keyboard handling and a file input ref. Clear the file input value after processing.

Files likely involved:
- `src/components/ProjectForm.tsx`

---

### BUG-007 - Disabled Continue has no inline reason

Severity: Medium

Area: Input / UX

Status: Fixed

Fix note:
The CTA helper now explains that idea, offer, or screenshot is required when Continue is disabled.

Changed files:
- `src/components/ProjectForm.tsx`

Steps to reproduce:
1. Open Signal.
2. Enter only a project name.
3. Observe `Выбрать режим`.

Expected result:
Button can be disabled, but the app should explain that idea, offer, or screenshot is required.

Actual result:
Button is disabled with no local explanation near the CTA.

Impact:
New users may think the button is broken.

Suggested fix:
Add a short helper line near the CTA when disabled.

Files likely involved:
- `src/components/ProjectForm.tsx`

---

### BUG-008 - Follow-up actions overpromise exact operations

Severity: Medium

Area: Result / Logic

Status: Fixed

Fix note:
Follow-up actions can now rerun analysis with both mode and depth. Business uses deep audit; Threads/launch actions use launch review.

Changed files:
- `src/App.tsx`
- `src/components/ResultView.tsx`

Steps to reproduce:
1. Open Result.
2. Click `Переписать оффер еще раз` or `Сгенерировать план запуска`.

Expected result:
The rerun should adjust mode/depth in a way that matches the button label.

Actual result:
Buttons mostly rerun generic mode changes and do not always adjust depth/focus.

Impact:
The app can feel less smart than the UI promises.

Suggested fix:
Allow follow-up actions to pass both roast mode and analysis depth. Use `launch` depth for launch plan and `deep` for business review.

Files likely involved:
- `src/App.tsx`
- `src/components/ResultView.tsx`

---

### BUG-009 - Repeat from history opens Mode without project context

Severity: Medium

Area: History / Modes / UX

Status: Fixed

Fix note:
Mode screen now shows a compact project/stage chip before mode selection.

Changed files:
- `src/components/RoastModeSelector.tsx`

Steps to reproduce:
1. Save a result.
2. Open History.
3. Click `Повторить`.

Expected result:
Mode screen should show which project is being repeated.

Actual result:
Mode screen opens, but the project name is not visible in the main content.

Impact:
User can lose orientation when repeating older audits.

Suggested fix:
Show a small project/context summary on Mode screen.

Files likely involved:
- `src/components/RoastModeSelector.tsx`

---

### BUG-010 - Individual Threads post copy buttons have ambiguous names

Severity: Medium

Area: Result / Accessibility / Copy

Status: Fixed

Fix note:
Post copy buttons now have contextual aria-labels and Russian visible labels.

Changed files:
- `src/components/ThreadsPosts.tsx`
- `src/components/CopyButton.tsx`

Steps to reproduce:
1. Open Result.
2. Open Threads tab.
3. Inspect the three post copy buttons.

Expected result:
Each button should be distinguishable for keyboard/screen-reader users.

Actual result:
All three buttons are named `Copy`.

Impact:
Accessibility and QA automation suffer; users with assistive tech do not know which post is copied.

Suggested fix:
Add contextual aria-labels, for example `Скопировать пост 01`.

Files likely involved:
- `src/components/ThreadsPosts.tsx`
- `src/components/CopyButton.tsx`

## Low Priority Bugs

### BUG-011 - History CTA says "first project" even with existing history

Severity: Low

Area: History / Copy

Status: Fixed

Fix note:
History header CTA is now state-aware: `Разнести новый проект` when history exists.

Changed files:
- `src/components/HistoryPanel.tsx`

Steps to reproduce:
1. Save at least one result.
2. Open History.
3. Look at the primary button.

Expected result:
When history exists, CTA should say `Разнести новый проект`.

Actual result:
CTA still says `Разнести первый проект`.

Impact:
Small copy inconsistency; makes the library feel less aware of state.

Suggested fix:
Change label based on `history.length`.

Files likely involved:
- `src/components/HistoryPanel.tsx`

---

### BUG-012 - Demo dropdown lacks menu semantics

Severity: Low

Area: Home / Input / Accessibility

Status: Fixed

Fix note:
Demo picker trigger now exposes expanded/menu state, menu items have menu roles, and Escape closes the dropdown.

Changed files:
- `src/components/DemoProjectPicker.tsx`

Steps to reproduce:
1. Open demo dropdown.
2. Inspect keyboard/menu semantics.

Expected result:
The trigger should expose expanded state and the menu should use clear menu/list semantics.

Actual result:
Dropdown works visually but has no `aria-expanded`, `aria-haspopup`, menu role, or Escape handling.

Impact:
Small accessibility gap.

Suggested fix:
Add menu semantics and close on Escape.

Files likely involved:
- `src/components/DemoProjectPicker.tsx`

---

### BUG-013 - AIEngineStatus uses English "not yet" in Russian UI

Severity: Low

Area: Text / Tone

Status: Fixed

Fix note:
`Last` fallback now reads `еще нет`.

Changed files:
- `src/components/AIEngineStatus.tsx`

Steps to reproduce:
1. Open Signal before any analysis.
2. Look at ROAST ENGINE / Last.

Expected result:
Use Russian copy or a more intentional technical label.

Actual result:
Shows `not yet`.

Impact:
Minor tone inconsistency in otherwise polished Russian UI.

Suggested fix:
Use `еще нет` or `no run`.

Files likely involved:
- `src/components/AIEngineStatus.tsx`

## Responsive Issues

### RESP-001 - Hero CTA collides with bottom nav on 375x667

Viewport: 375x667

Status: Fixed

Steps:
1. Open Home.
2. Observe hero CTA and bottom nav.

Problem:
CTA buttons are too low and can enter the floating nav zone.

Suggested fix:
Reduce mobile hero headline size, avoid centering preview cards together with CTA, and hide/compact bottom nav on short-height screens.

Fix note:
Mobile hero size/spacing was reduced and bottom nav is hidden on short-height viewports. Primary CTA is visible at 375x667.

---

### RESP-002 - Result section tabs can sit under bottom nav on 1366x768

Viewport: 1366x768

Status: Fixed

Steps:
1. Open Result.
2. Observe `Разбор / Исправить / Threads / Спринт`.

Problem:
Tabs can be overlapped by bottom nav on the first result viewport.

Suggested fix:
Hide/compact bottom nav for short-height screens or move tabs above the fold.

Fix note:
Post-fix check at 1366x768 found no main result buttons overlapped by bottom nav.

## Logic Issues

### LOGIC-001 - Optional project name conflicts with Modes navigation

Flow:
Signal with valid idea but no project name -> top nav Modes.

Problem:
The app requires project name for nav even though the form says it is optional.

Expected:
Route to Mode when any valid signal exists.

Suggested fix:
Centralize signal readiness logic.

---

### LOGIC-002 - Draft persistence is undermined by nav reset

Flow:
Type draft -> click Analyze nav.

Problem:
Draft is cleared and saved as empty.

Expected:
Navigation should not be destructive.

Suggested fix:
Separate `goAnalyze` from `resetForNewRoast`.

---

### LOGIC-003 - Storage parsing is shallow

Flow:
Corrupt localStorage -> reload -> History.

Problem:
Invalid nested result/input can reach UI.

Expected:
Bad records are dropped.

Suggested fix:
Add deep guards for input/result/history.

---

### LOGIC-004 - Real AI mode could silently stay demo if backend model/env is wrong

Flow:
Set `OPENAI_API_KEY` -> API route -> model request.

Problem:
Real API was not verified in this environment. The app falls back silently to mock on API errors.

Expected:
Fallback is fine, but internal status/logging should make real-mode failures debuggable.

Suggested fix:
Keep user-facing soft fallback, but consider server logs or a response metadata flag.

## UX / Copy Issues

### COPY-001 - Offer fallback grammar can be awkward

Location: Copied improved offer

Current text:
`Помогает людей, которым уже больно...`

Problem:
Fallback audience text produces grammatically awkward Russian.

Suggested replacement:
Use a fallback that fits the sentence: `Помогает тем, кому уже больно...`

---

### COPY-002 - History CTA state mismatch

Location: History header

Current text:
`Разнести первый проект`

Problem:
Shown even when history already has projects.

Suggested replacement:
`Разнести новый проект`

---

### COPY-003 - Mixed English on action buttons

Location: Result / Fix and Threads

Current text:
`Copy offer`, `Copy`

Problem:
Main UI is Russian; generic English copy labels feel less polished.

Suggested replacement:
`Скопировать оффер`, `Копировать`

---

### COPY-004 - ROAST ENGINE Last value

Location: AIEngineStatus

Current text:
`not yet`

Problem:
Tone mismatch.

Suggested replacement:
`еще нет`

---

### COPY-005 - Disabled Continue has no reason

Location: Signal CTA

Current text:
No inline text.

Problem:
User may not understand why the button is disabled.

Suggested replacement:
`Добавь идею, оффер или скрин, чтобы выбрать режим.`

---

### COPY-006 - Follow-up action labels overpromise

Location: Result follow-up actions

Current text:
`Переписать оффер еще раз`, `Сгенерировать план запуска`

Problem:
The current logic reruns analysis, not a dedicated generation step.

Suggested replacement:
Either adjust depth/mode to match, or soften labels.

---

### COPY-007 - Demo dropdown trigger has weak semantics

Location: Hero / ProjectForm

Current text:
`Загрузить демо`

Problem:
Text is fine, but state is not announced.

Suggested replacement:
Keep text; add `aria-expanded` and menu semantics.

## Buttons Checklist

| Button | Location | Expected action | Actual action | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| Разнести проект | Hero | Open Signal | Works | Pass | CTA visible on most sizes; issue at 375x667. |
| Посмотреть пример | Hero | Open demo result | Works | Pass | Opens DayPilot result. |
| Загрузить демо | Hero/Form | Open demo picker | Works | Pass | Needs better ARIA semantics. |
| Demo | Header | Open demo result | Works | Pass | Opens demo result. |
| Analyze | Header/Bottom | Navigate to analyze | Navigates without clearing draft | Pass | Fixed BUG-001. |
| Modes | Header | Open mode if signal valid | Opens Mode with valid signal and no project name | Pass | Fixed BUG-002. |
| History | Header/Bottom | Open History | Works | Pass | |
| Example | Header | Open demo result | Works | Pass | |
| Назад | Input/History | Return previous screen | Works | Pass | |
| Выбрать режим | Input | Continue when signal exists | Works | Pass | Disabled state needs reason. |
| Upload screenshot | Input | Upload image | Source-reviewed and keyboard semantics fixed | Partial | Browser automation could not attach file. |
| Удалить скрин | Input | Remove image | Source-reviewed | Partial | Not browser-verified due upload limitation. |
| Mentor/Investor/Tired User/Threads Bro/Codex Review | Mode | Select roast mode | Works | Pass | |
| Fast/Deep/Launch | Mode | Select depth | Works | Pass | |
| Получить разбор | Mode | Start pipeline/result | Works | Pass | Mock fallback works. |
| Скопировать разбор | Result | Copy full report | Works | Pass | Clipboard verified. |
| Threads-посты | Result | Copy all posts | Works | Pass | Clipboard verified. |
| Сохранить | Result | Save to history | Works | Pass | |
| Разбор/Исправить/Threads/Спринт | Result | Switch sections | Works | Pass | Can overlap nav on short height. |
| Скопировать оффер | Result/Fix | Copy offer | Works when visible | Pass | Label fixed. |
| Копировать | Threads cards | Copy one post | Works visually | Pass | Contextual aria-labels added. |
| Сделать мягче/жестче/Больше про бизнес/Threads | Result | Rerun analysis | Works | Pass | Some labels should map to depth/focus. |
| Разнести еще раз | Result | Start new Signal | Works | Pass | Transition takes over 1s. |
| Открыть | History | Open saved result | Works | Pass | |
| Повторить | History | Repeat saved audit | Works | Pass | Mode screen lacks project context. |
| Удалить | History | Delete saved result | Works | Pass | |

## Modes Checklist

| Mode | Select works | Passed to analysis | Result matches mode | Bugs |
| --- | --- | --- | --- | --- |
| Добрый ментор | Yes | Yes | Yes | None found |
| Злой инвестор | Yes | Yes | Yes | None found |
| Уставший пользователь | Yes | Source/mode selection checked | Mock copy exists | Not all full reruns browser-tested |
| Threads-бро | Yes | Yes | Yes | None found |
| Codex-ревьюер | Yes | Source/mode selection checked | Mock copy exists | Not all full reruns browser-tested |

## Text Checklist

| Screen | Text issue | Suggested fix |
| --- | --- | --- |
| Signal | Disabled CTA lacks reason | Add helper near CTA |
| Result/Fix | `Copy offer` | Use `Скопировать оффер` |
| Threads | Three `Copy` labels | Use contextual labels or aria-labels |
| History | `Разнести первый проект` with existing history | Use state-aware label |
| AIEngineStatus | `not yet` | Use `еще нет` |
| Offer export | `Помогает людей...` | Use grammar-safe fallback |
| Follow-up actions | Some labels overpromise | Map actions to mode/depth |

## Final QA Verdict

Can it be shown to users?

Yes, for a public MVP/demo test in mock mode.

Can it be posted in Threads?

Yes, screenshots look premium and the high-priority flow/responsive issues found in this sprint are fixed.

Must fix before public test:
- Real OpenAI mode should be tested with a valid `OPENAI_API_KEY` on the serverless endpoint.
- Manual screenshot upload should be tested in a real browser file picker.

Can fix later:
- Full screen-reader pass
- Automated e2e coverage
- Real OpenAI endpoint observability/metadata
- Multi-tab localStorage edge cases

FIX SPRINT completed.

Recommended next order:
1. Real AI verification with a server-side key
2. Manual upload QA in a real browser file picker
3. Automated e2e tests for main flow and storage guards
4. Full accessibility pass
