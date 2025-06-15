# Implementation Plan: LaserFocus

---

## 1. Overview

This document is the machine‑readable, step‑by‑step execution plan for an AI code‑generation agent to build the **LaserFocus** Chrome Extension. All tasks are derived exclusively from the supplied PRD and SRS and are ordered into atomic, verifiable steps that follow strict **Test → Code → Refactor (TDD)** sequencing.

---

## 2. Environment & Tooling

| Step | Command / Setting                                                                                                         | Purpose                                     |
| ---- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| E‑01 | `nvm install 20 && nvm use 20`                                                                                            | Standardise Node .js 20 runtime (ES2020+)   |
| E‑02 | `npm init -y`                                                                                                             | Initialise project manifest                 |
| E‑03 | `npm i --save-dev jest puppeteer axe-core jest-environment-puppeteer @types/chrome eslint prettier`                       | Install test & lint tool‑chain              |
| E‑04 | `npx jest --init`— select _ESM_, _puppeteer_ env                                                                          | Generate Jest config for unit + e2e         |
| E‑05 | Add `scripts` to **package.json**:`"test":"jest"`, `"test:e2e":"jest --config jest.e2e.config.js"`, `"lint":"eslint src"` | CI entry‑points                             |
| E‑06 | `mkdir -p src/{background,overlay,options} videos tests/{unit,e2e}`                                                       | Create canonical directory layout (SRS 3.3) |
| E‑07 | Create stub **manifest.json** (MV3, no permissions yet)                                                                   | Enables `chrome` typings in tests           |
| E‑08 | Commit baseline (`git init && git add . && git commit -m "bootstrap"`)                                                    | Track incremental changes                   |

---

## 3. Data Models

|Identifier|Storage|Shape|Description|SRS Ref|
|---|---|---|---|---|
|`blockedDomains`|`chrome.storage.sync`|`string[]`|Sanitised eTLD+1 domains|4.3|
|`videoHistory`|`chrome.storage.local`|`string[]` (length ≤ 10)|Circular queue of last 10 video filenames|4.3|
|`RedirectTarget`|memory (URL param)|`{ url: string }`|Encoded original URL passed to overlay|FR‑001|

---

## 4. Phased Work Breakdown

### Legend

- **Task Type:** `Test`, `Code`, `Refactor`, `Setup`, `Config`
    
- **ID Prefixes:** `P0‑` Environment, `P1‑` Storage, `P2‑` Redirect, `P3‑` Overlay, `P4‑` Video Variety, `P5‑` Decision Flow, `P6‑` Options, `P7‑` A11y & Responsive, `P8‑` Packaging
    
- **References:** PRD (REQ‑, CF‑, US‑) or SRS (FR‑, NFR‑)
    

---

#### **Phase 0 – Environment & Skeleton**

| Task ID | Task Type | Description                                                                | File Path                    | Action           | Dependencies | References | Acceptance Criteria          |
| ------- | --------- | -------------------------------------------------------------------------- | ---------------------------- | ---------------- | ------------ | ---------- | ---------------------------- |
| P0‑T‑01 | Test      | Create failing smoke test asserting Jest runs (`expect(true).toBe(false)`) | tests/unit/bootstrap.test.js | Add minimal test | —            | —          | Jest CLI exits with non‑zero |
| P0‑C‑02 | Code      | Adjust test to `expect(true).toBe(true)`                                   | tests/unit/bootstrap.test.js | Edit assertion   | P0‑T‑01      | —          | `npm test` passes            |
| P0‑R‑03 | Refactor  | Remove bootstrap test, keep empty suite                                    | tests/unit/*                 | Delete file      | P0‑C‑02      | —          | Jest passes with 0 tests     |

**Validation (Phase 0)**  
`npm test` and `npm run lint` both exit 0; directory tree matches SRS 3.3.

---

#### **Phase 1 – Storage & Default Block‑List**

| Task ID | Task Type | Description                                                               | File Path                        | Action                                                    | Dependencies | References    | Acceptance Criteria    |
| ------- | --------- | ------------------------------------------------------------------------- | -------------------------------- | --------------------------------------------------------- | ------------ | ------------- | ---------------------- |
| P1‑T‑01 | Test      | Failing unit test: `getBlockedDomains()` returns seeded list on first run | tests/unit/storage.test.js       | Write Jest test stub                                      | P0‑R‑03      | FR‑012 FR‑013 | Test fails             |
| P1‑C‑02 | Code      | Implement `storage.js` with `getBlockedDomains`, `saveBlockedDomains`     | src/background/storage.js        | Add minimal code to pass test (return hard‑coded default) | P1‑T‑01      | FR‑012 FR‑013 | Test passes            |
| P1‑R‑03 | Refactor  | Replace hard‑coded default with `chrome.storage.sync` calls               | src/background/storage.js        | Refactor logic                                            | P1‑C‑02      | FR‑012 FR‑013 | Tests still pass       |
| P1‑T‑04 | Test      | Failing test: `onInstalled` seeds defaults only if undefined              | tests/unit/install.test.js       | Mock `chrome.runtime.onInstalled`                         | P1‑R‑03      | FR‑013        | Test fails             |
| P1‑C‑05 | Code      | Add `install.js` listener registering seeding logic                       | src/background/install.js        | Implement minimal pass                                    | P1‑T‑04      | FR‑013        | Test passes            |
| P1‑R‑06 | Refactor  | Move seeding util into `storage.js` to centralise                         | src/background/storage.js        | Refactor                                                  | P1‑C‑05      | FR‑012 FR‑013 | All storage tests pass |
| P1‑T‑07 | Test      | Failing unit test: `shouldIntercept()` returns **false** when list empty  | tests/unit/interceptSkip.test.js | Write test                                                | P1‑R‑06      | FR‑014        | Test fails             |
| P1‑C‑08 | Code      | Implement `shouldIntercept()` predicate                                   | src/background/intercept.js      | Minimal code                                              | P1‑T‑07      | FR‑014        | Test passes            |
| P1‑R‑09 | Refactor  | Document predicate with JSDoc and edge cases                              | src/background/intercept.js      | Refactor comment‑only                                     | P1‑C‑08      | FR‑014        | Lint passes            |

**Validation (Phase 1)**  
Run `npm test`; all storage & predicate tests pass. Manually load unpacked extension—verify defaults appear after install event.

---

#### **Phase 2 – Domain Interception & Redirect**

| Task ID | Task Type | Description                                                                                                        | File Path                      | Action                               | Dependencies | References    | Acceptance Criteria           |
| ------- | --------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------ | ------------------------------------ | ------------ | ------------- | ----------------------------- |
| P2‑T‑01 | Test      | Failing unit test: `domainMatch("M.Facebook.com")` ⇒ true                                                          | tests/unit/domainMatch.test.js | Add case‑insensitive, subdomain test | P1‑R‑09      | FR‑001 FR‑002 | Test fails                    |
| P2‑C‑02 | Code      | Implement minimal `domainMatch()` util                                                                             | src/background/domainMatch.js  | Pass failing test                    | P2‑T‑01      | FR‑001 FR‑002 | Test passes                   |
| P2‑R‑03 | Refactor  | Replace regex with URL API parsing for clarity                                                                     | src/background/domainMatch.js  | Refactor                             | P2‑C‑02      | FR‑001 FR‑002 | Tests still pass              |
| P2‑T‑04 | Test      | Failing integration test (Puppeteer): navigation to `facebook.com` is redirected to `overlay.html` before DOM load | tests/e2e/redirect.e2e.test.js | Use `page.on('framenavigated')`      | P2‑R‑03      | FR‑001 FR‑019 | Test fails                    |
| P2‑C‑05 | Code      | Add `chrome.declarativeNetRequest` rule assembly in service worker                                                 | src/background/background.js   | Minimal rule list                    | P2‑T‑04      | FR‑001 FR‑019 | Test passes                   |
| P2‑R‑06 | Refactor  | Extract rule builder to `dnrRules.js`, add unit tests                                                              | src/background/dnrRules.js     | Modularise                           | P2‑C‑05      | FR‑019        | All redirect tests still pass |
| P2‑T‑07 | Test      | Failing unit: original URL encoded as param                                                                        | tests/unit/urlParam.test.js    | Expect overlay URL has `target=`     | P2‑R‑06      | FR‑001        | Test fails                    |
| P2‑C‑08 | Code      | Update rule builder to append encoded target                                                                       | src/background/dnrRules.js     | Fix param                            | P2‑T‑07      | FR‑001        | Unit passes                   |
| P2‑R‑09 | Refactor  | Add validation for param length & encodeURIComponent                                                               | src/background/dnrRules.js     | Refactor                             | P2‑C‑08      | FR‑001        | Tests pass                    |

**Validation (Phase 2)**  
E2E script loads test page; network panel shows zero byte request to blocked site, overlay URL includes `target`. Manual attempt to visit `m.facebook.com` also intercepted.

---

#### **Phase 3 – Overlay Base (Layout & Video Container)**

| Task ID | Task Type | Description                                                           | File Path                                       | Action                 | Dependencies | References | Acceptance Criteria    |
| ------- | --------- | --------------------------------------------------------------------- | ----------------------------------------------- | ---------------------- | ------------ | ---------- | ---------------------- |
| P3‑T‑01 | Test      | Failing unit: overlay container spans 100 vw×100 vh                   | tests/unit/overlayStyle.test.js                 | JSDOM evaluate CSS     | P2‑R‑09      | FR‑004     | Test fails             |
| P3‑C‑02 | Code      | Create `overlay.html` with `<div id="laserfocus-overlay">` & base CSS | src/overlay/overlay.htmlsrc/overlay/overlay.css | Minimal markup & style | P3‑T‑01      | FR‑004     | Test passes            |
| P3‑R‑03 | Refactor  | Move CSS variables, add z‑index 999999                                | src/overlay/overlay.css                         | Refactor               | P3‑C‑02      | FR‑004     | Tests pass             |
| P3‑T‑04 | Test      | Failing e2e: spinner visible until `video.readyState >= 3`            | tests/e2e/spinner.e2e.test.js                   | Puppeteer waits        | P3‑R‑03      | FR‑005     | Test fails             |
| P3‑C‑05 | Code      | Add spinner markup & JS to hide on `canplaythrough`                   | src/overlay/overlay.js                          | Implement minimal      | P3‑T‑04      | FR‑005     | Test passes            |
| P3‑R‑06 | Refactor  | Extract `showSpinner/hideSpinner` utilities                           | src/overlay/ui.js                               | Refactor               | P3‑C‑05      | FR‑005     | All overlay tests pass |

**Validation (Phase 3)**  
Open overlay directly; verify full‑screen container, spinner disappears when local video cached.

---

#### **Phase 4 – Video Variety (Shuffle Queue)**

| Task ID | Task Type | Description                                                    | File Path                       | Action           | Dependencies | References | Acceptance Criteria  |
| ------- | --------- | -------------------------------------------------------------- | ------------------------------- | ---------------- | ------------ | ---------- | -------------------- |
| P4‑T‑01 | Test      | Failing unit: queue guarantees ≥ 2 distinct videos in 10 picks | tests/unit/shuffleQueue.test.js | Simulate 20 runs | P3‑R‑06      | FR‑007     | Test fails           |
| P4‑C‑02 | Code      | Implement `getNextVideo()` with circular `videoHistory`        | src/overlay/videoQueue.js       | Minimal logic    | P4‑T‑01      | FR‑007 4.3 | Test passes          |
| P4‑R‑03 | Refactor  | Persist `videoHistory` to `chrome.storage.local`               | src/overlay/videoQueue.js       | Refactor         | P4‑C‑02      | FR‑007 4.3 | All queue tests pass |

**Validation (Phase 4)**  
Run unit test; log shows distribution of at least 2 unique filenames per 10 invocations.

---

#### **Phase 5 – Decision Flow (Buttons & Navigation)**

| Task ID | Task Type | Description                                                              | File Path                                      | Action                  | Dependencies | References    | Acceptance Criteria     |
| ------- | --------- | ------------------------------------------------------------------------ | ---------------------------------------------- | ----------------------- | ------------ | ------------- | ----------------------- |
| P5‑T‑01 | Test      | Failing e2e: Continue & Go Back **disabled** pre‑video                   | tests/e2e/buttonState.e2e.test.js              | Puppeteer eval          | P4‑R‑03      | FR‑008        | Test fails              |
| P5‑C‑02 | Code      | Add buttons markup, disable attr, enable on `video.ended`                | src/overlay/overlay.htmlsrc/overlay/overlay.js | Implement               | P5‑T‑01      | FR‑008        | Test passes             |
| P5‑R‑03 | Refactor  | Factor event binding into `controls.js`                                  | src/overlay/controls.js                        | Refactor                | P5‑C‑02      | FR‑008        | Tests pass              |
| P5‑T‑04 | Test      | Failing e2e: clicking **Continue** loads original URL                    | tests/e2e/continue.e2e.test.js                 | Use target param        | P5‑R‑03      | FR‑003 FR‑009 | Test fails              |
| P5‑C‑05 | Code      | Implement runtime message from overlay → service worker to `tabs.update` | src/background/navigation.js                   | Minimal                 | P5‑T‑04      | FR‑003 FR‑009 | Test passes             |
| P5‑R‑06 | Refactor  | Co‑locate message keys in `messages.js`                                  | src/common/messages.js                         | Refactor                | P5‑C‑05      | FR‑003        | Tests pass              |
| P5‑T‑07 | Test      | Failing e2e: **Go Back** performs history.back or new‑tab                | tests/e2e/goBack.e2e.test.js                   | Simulate history length | P5‑R‑06      | FR‑010        | Test fails              |
| P5‑C‑08 | Code      | Extend navigation handler for conditional logic                          | src/background/navigation.js                   | Implement               | P5‑T‑07      | FR‑010        | Test passes             |
| P5‑R‑09 | Refactor  | Extract helper `goBackOrNewTab()`                                        | src/background/navigation.js                   | Refactor                | P5‑C‑08      | FR‑010        | All decision tests pass |

**Validation (Phase 5)**  
Manual flow: Visit blocked domain → watch video → Continue opens site; Go Back returns or opens new tab depending on history.

---

#### **Phase 6 – Options Page (Block‑List Manager)**

| Task ID | Task Type | Description                                                                  | File Path                         | Action          | Dependencies | References    | Acceptance Criteria    |
| ------- | --------- | ---------------------------------------------------------------------------- | --------------------------------- | --------------- | ------------ | ------------- | ---------------------- |
| P6‑T‑01 | Test      | Failing unit: textarea loads current domains on open                         | tests/unit/optionsLoad.test.js    | JSDOM form test | P5‑R‑09      | FR‑011 FR‑012 | Test fails             |
| P6‑C‑02 | Code      | Build `options.html` + `options.js` to read storage and populate textarea    | src/options/*                     | Minimal         | P6‑T‑01      | FR‑011 FR‑012 | Test passes            |
| P6‑R‑03 | Refactor  | Factor sanitisation util to `sanitizeDomain()`                               | src/options/sanitize.js           | Refactor        | P6‑C‑02      | FR‑011        | Tests pass             |
| P6‑T‑04 | Test      | Failing e2e: clicking **Save** persists and rule list updates without reload | tests/e2e/optionsSave.e2e.test.js | Puppeteer       | P6‑R‑03      | FR‑011 FR‑012 | Test fails             |
| P6‑C‑05 | Code      | Implement save handler; post‑message to service worker to rebuild dNR rules  | src/options/options.js            | Implement       | P6‑T‑04      | FR‑012 FR‑019 | Test passes            |
| P6‑R‑06 | Refactor  | Debounce save notifications & add toast                                      | src/options/options.js            | Refactor        | P6‑C‑05      | FR‑011        | All options tests pass |

**Validation (Phase 6)**  
Options page shows domains, allows editing; adding `example.com` immediately blocks site in new tab.

---

#### **Phase 7 – Accessibility & Responsiveness**

| Task ID | Task Type | Description                                                       | File Path                        | Action                | Dependencies | References    | Acceptance Criteria            |
| ------- | --------- | ----------------------------------------------------------------- | -------------------------------- | --------------------- | ------------ | ------------- | ------------------------------ |
| P7‑T‑01 | Test      | Failing axe‑core scan: overlay must have role dialog & aria‑modal | tests/unit/a11y.test.js          | axe‑core JSDOM        | P6‑R‑06      | FR‑017 FR‑018 | Test fails                     |
| P7‑C‑02 | Code      | Add ARIA attributes, focus trap cycle                             | src/overlay/overlay.js           | Implement             | P7‑T‑01      | FR‑017 FR‑018 | Test passes                    |
| P7‑R‑03 | Refactor  | Extract `focusTrap.js`, document keyboard shortcuts               | src/overlay/focusTrap.js         | Refactor              | P7‑C‑02      | FR‑018        | Tests pass                     |
| P7‑T‑04 | Test      | Failing responsive snapshot at 320 px & 2560 px                   | tests/e2e/responsive.e2e.test.js | puppeteer‑screenshots | P7‑R‑03      | NFR‑006       | Test fails                     |
| P7‑C‑05 | Code      | Add media queries & flexible layout                               | src/overlay/overlay.css          | Implement             | P7‑T‑04      | NFR‑006       | Test passes                    |
| P7‑R‑06 | Refactor  | Replace px with rem units; consolidate breakpoints                | src/overlay/overlay.css          | Refactor              | P7‑C‑05      | NFR‑006       | All a11y/responsive tests pass |

**Validation (Phase 7)**  
axe‑core has zero critical violations; manual `Tab` cycles inside overlay; screenshots across widths show full coverage.

---

#### **Phase 8 – Packaging & Compliance**

| Task ID | Task Type | Description                                                                                     | File Path                    | Action                  | Dependencies | References     | Acceptance Criteria |
| ------- | --------- | ----------------------------------------------------------------------------------------------- | ---------------------------- | ----------------------- | ------------ | -------------- | ------------------- |
| P8‑T‑01 | Test      | Failing unit: `manifest.json` lacks required permissions                                        | tests/unit/manifest.test.js  | Load JSON & assert keys | P7‑R‑06      | FR‑016         | Test fails          |
| P8‑C‑02 | Code      | Populate manifest with MV3 fields, host permissions, options UI, `declarative_net_request` keys | manifest.json                | Implement               | P8‑T‑01      | FR‑016         | Test passes         |
| P8‑R‑03 | Refactor  | Split manifest into base + injection task for CI                                                | build/manifest-builder.js    | Refactor                | P8‑C‑02      | FR‑016         | Tests pass          |
| P8‑T‑04 | Test      | Failing size check: bundle ≤ 200 MB                                                             | tests/unit/sizeLimit.test.js | Node fs stat            | P8‑R‑03      | FR‑015 NFR‑004 | Test fails          |
| P8‑C‑05 | Code      | Add `npm run build` script zipping src excluding tests                                          | build/package.js             | Implement               | P8‑T‑04      | FR‑015 NFR‑004 | Test passes         |
| P8‑R‑06 | Refactor  | Integrate build & test into GitHub Actions; enforce 80 % coverage                               | .github/workflows/ci.yml     | Refactor                | P8‑C‑05      | NFR‑008        | CI passes on push   |

**Validation (Phase 8)**  
`npm run build` produces `laserfocus.zip` < 200 MB; Chrome Web Store validator reports no MV3 errors.

---

### 5. Definition of Done

The project is complete when **all** of the following hold:

1. **All phase validations pass** on clean checkout (`git clone`, `npm ci`, `npm run build`).
    
2. **Automated test suites** (unit + e2e + a11y + size) achieve ≥ 80 % coverage and green CI.
    
3. Chrome extension bundle (`laserfocus.zip`) installs without warnings, intercepts domains, plays videos, and satisfies all functional (FR‑001 … FR‑019) and non‑functional (NFR‑001 … NFR‑008) requirements.
    
4. Manual exploratory tests confirm user stories US‑001 – US‑010 in the PRD.
    
5. Bundle size ≤ 200 MB and contains **no external network references**.
    
6. Accessibility audit (axe‑core & manual keyboard test) returns zero critical issues, meeting WCAG 2.1 AA.
    
7. Source repository contains fully documented code, README with usage instructions, and CI badge showing passing status.
    

---

### Self‑Correction Checklist (internal verification)

- ✅ Every functional feature is decomposed into **Test → Code → Refactor** tasks.
    
- ✅ All tasks are atomic, with unambiguous `Action` steps runnable by an AI agent.
    
- ✅ `References` column maps each task to exact PRD/SRS IDs.
    
- ✅ `Dependencies` create a valid, acyclic order inside and across phases.
    
- ✅ Plan content derives **only** from provided PRD/SRS; no extraneous requirements introduced.