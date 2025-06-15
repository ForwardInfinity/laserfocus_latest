# Product Requirements Document: **LaserFocus**

## 1  Overview

LaserFocus is a Chrome Extension (desktop Chrome, Manifest V3) that interrupts unintentional visits to distracting websites. When a user attempts to open any domain on their personal block‑list (e.g., `facebook.com`, `tiktok.com`), the extension uses **`chrome.declarativeNetRequest` to redirect** the navigation to an internal page `overlay.html`. This full‑screen overlay automatically plays a short, muted motivational video. After the video ends, the user may choose **Continue to \[sitename]** or **Go Back**, forcing a deliberate decision and helping them regain focus.

## 2  Goals

| Goal ID | Objective                                                 | Success Metric                                                            |
| ------- | --------------------------------------------------------- | ------------------------------------------------------------------------- |
| G‑01    | Reduce the number of daily visits to block‑listed domains | ≥ 80 % reduction vs. baseline after 14 days                               |
| G‑02    | Ensure user completes video before deciding               | ≥ 95 % of interceptions end with full video playback (no premature exits) |
| G‑03    | Provide seamless, zero‑config first‑run experience        | ≤ 1 support ticket per 1 000 installs regarding setup                     |

## 3  Target Audience

Knowledge‑work professionals and students who rely on the **desktop** Chrome browser for productive tasks but frequently drift to social‑media or entertainment sites. Technical proficiency ranges from low (non‑developer) to medium.

## 4  User Stories

| ID         | Title                           | Description                                                                                                               | Acceptance Criteria                                                                                                                                                                                  |
| ---------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **US‑001** | Intercept distracted navigation | As a user, when I navigate to a blocked domain, LaserFocus should redirect before the page loads and display the overlay. | 1. Visiting `https://facebook.com` (or any sub‑domain) immediately loads `overlay.html` served by the extension. 2. Original target URL is passed as a query parameter and paused until user action. |
| **US‑002** | Continue after reflection       | As a user, I want to continue to the site after the video so I can proceed intentionally.                                 | 1. **Continue** button is disabled until the `video.ended` event. 2. Clicking **Continue** navigates to the originally requested URL in the same tab.                                                |
| **US‑003** | Go Back to safety               | As a user, I want to abandon the visit after the video so I can return to my previous page.                               | 1. **Go Back** button enabled only after video ends. 2. If `history.length ≥ 2`, clicking triggers `history.back()`. 3. If `history.length < 2`, the extension opens a new‑tab page instead.         |
| **US‑004** | Edit block‑list                 | As a user, I can add / remove domains in an options page.                                                                 | 1. Textarea lists domains one‑per‑line. 2. Clicking **Save** persists to `chrome.storage.sync`. 3. Changes are effective immediately without restart.                                                |
| **US‑005** | First‑run defaults              | As a first‑time user, I see a sensible default list so the extension works out‑of‑the‑box.                                | 1. On fresh install, textarea pre‑populated with five defaults. 2. Block‑list stored on installation event only once.                                                                                |
| **US‑006** | Random video variety            | As a user, I want a different motivational clip each time to avoid habituation.                                           | 1. Video file chosen using a shuffle‑queue algorithm that guarantees at least two distinct videos in any 10 consecutive interceptions.                                                               |
| **US‑007** | No overlay when list empty      | As a user, if I clear the block‑list, LaserFocus must never trigger.                                                      | 1. Empty textarea ⇒ no interceptions. 2. Visiting any site proceeds normally.                                                                                                                        |
| **US‑008** | Responsive overlay              | As a user, the overlay must fully cover any viewport width from 320 px to 2560 px.                                        | 1. Tested at the specified widths: overlay occupies full viewport, video centered, buttons visible.                                                                                                  |
| **US‑009** | Sub‑domain coverage             | As a user, sub‑domains of a blocked domain must also be blocked.                                                          | 1. Block‑listing `facebook.com` intercepts `m.facebook.com`, `www.facebook.com`, etc.                                                                                                                |
| **US‑010** | Accessible interaction          | As a user with assistive technology, I can operate the overlay using only the keyboard and screen readers.                | 1. Focus is trapped inside the overlay. 2. Buttons are tabbable and announce proper ARIA labels. 3. Overlay meets WCAG 2.1 AA contrast guidelines.                                                   |

## 5  Core Features (MVP)

| ID        | Feature                           | Priority | Description                                                                                                     | Linked Requirements             |
| --------- | --------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| **CF‑01** | Domain interception & redirect    | P0       | Uses `chrome.declarativeNetRequest` to redirect blocked navigations to `overlay.html` before first byte.        | REQ‑001 REQ‑002 REQ‑003 REQ‑016 |
| **CF‑02** | Full‑screen overlay page          | P0       | Stand‑alone `overlay.html` with HTML/CSS covering the entire viewport; shows loading spinner until video ready. | REQ‑004 REQ‑014                 |
| **CF‑03** | Motivational video player         | P0       | Autoplays a random **muted** 9:16 `.mp4` from `/videos/`.                                                       | REQ‑005 REQ‑006 REQ‑017         |
| **CF‑04** | Post‑video decision buttons       | P0       | **Continue** and **Go Back** buttons remain disabled until video end; keyboard‑ and screen‑reader accessible.   | REQ‑007 REQ‑008 REQ‑009 REQ‑010 |
| **CF‑05** | Options page – block‑list manager | P0       | Simple UI with `<textarea>` and **Save**; persists to sync storage.                                             | REQ‑011 REQ‑012                 |
| **CF‑06** | Default block‑list seeding        | P0       | On `chrome.runtime.onInstalled`, populate storage with defaults.                                                | REQ‑013                         |
| **CF‑07** | Storage‑driven behavior toggle    | P1       | Skip interception entirely when block‑list empty.                                                               | REQ‑014                         |
| **CF‑08** | Packaging & compliance            | P1       | All assets bundled; zero external network; Manifest V3 with optional host permissions.                          | REQ‑015 REQ‑018                 |

### Functional Requirements

* **REQ‑001** Intercept navigation requests whose eTLD+1 or any sub‑domain matches an entry in the block‑list and **redirect** them to `overlay.html?target=<URL>` before page load.
* **REQ‑002** Domain matching is case‑insensitive and protocol‑agnostic.
* **REQ‑003** Original URL is preserved as a query parameter and reopened only if the user selects **Continue**.
* **REQ‑004** `overlay.html` contains a container `<div id="laserfocus‑overlay">` that stretches 100 vw × 100 vh; z‑index ≥ 999999.
* **REQ‑005** `<video muted playsinline autoplay>` element autoplays; if autoplay fails, overlay shows “Click to Play”.
* **REQ‑006** Video chosen using a shuffle queue of the last ten IDs to guarantee ≥ 2 distinct videos per 10 interceptions.
* **REQ‑007** Decision buttons have `disabled` attribute until `video.ended`.
* **REQ‑008** Clicking **Continue** closes overlay and loads the preserved target URL via `chrome.tabs.update`.
* **REQ‑009** If user clicks **Go Back** and `history.length ≥ 2`, execute `history.back()`.
* **REQ‑010** If `history.length < 2`, **Go Back** instead updates the tab to `chrome://newtab`.
* **REQ‑011** Options page textarea parses each non‑empty line into sanitized domain strings.
* **REQ‑012** Domains saved to `chrome.storage.sync` key `blockedDomains` as string array.
* **REQ‑013** On install, if `blockedDomains` undefined, set default list: `facebook.com`, `instagram.com`, `tiktok.com`, `youtube.com`, `twitter.com`.
* **REQ‑014** If `blockedDomains.length === 0`, extension performs no interception logic.
* **REQ‑015** All `.mp4` files reside in `/videos/`; no CDN or runtime download.
* **REQ‑016** Manifest V3 with `"host_permissions": ["<all_urls>"]` and `"optional_host_permissions": []`, plus `"permissions": ["storage", "declarativeNetRequest", "tabs"]`.
* **REQ‑017** Overlay complies with WCAG 2.1 AA: role = `dialog`, `aria‑modal="true"`, focus trap, ≥ 4.5:1 contrast.
* **REQ‑018** Extension bundle size ≤ 200 MB.

## 6  User Flow

### 6.1 Narrative Flow

1. **Navigate** – User enters or clicks a URL.
2. **Check Block‑List** – Background script compares the request’s eTLD+1 against `blockedDomains`.
3. **Not Blocked** – If no match → request proceeds normally.
4. **Blocked** – If match:
   4.1 `declarativeNetRequest` redirects navigation to `overlay.html?target=<originalURL>`.
   4.2 Overlay page loads and autoplays a muted, randomly selected video.
5. **Video End** – Overlay enables **Continue** and **Go Back** buttons.
6. **Decision** –
   • **Continue** → overlay closes, tab navigates to original URL.
   • **Go Back** → if history allows, `history.back()`; else, open new‑tab page.
7. **Resume Browsing** – User continues with chosen destination.

### 6.2 Mermaid Diagram

```mermaid
flowchart TD
    A[User navigates to URL] --> B{Domain in<br/>block‑list?}
    B -- No --> Z[Load site normally]
    B -- Yes --> C[Redirect to<br/>overlay.html]
    C --> D[Play random<br/>muted video]
    D --> E{Video ended?}
    E -- No --> D
    E -- Yes --> F[Enable buttons]
    F -->|Continue| G[Load original URL]
    F -->|Go Back| H{history.length ≥ 2?}
    H -- Yes --> I[history.back()]
    H -- No --> J[Open new tab]
    G --> K[End]
    I --> K
    J --> K
    Z --> K
```

---

*End of Document*