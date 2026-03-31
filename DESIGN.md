# KnowIntent — Product & Technical Design Baseline (for Next Project Phase)

## 1) Purpose of this document
This document captures the **current branch state** of KnowIntent and turns it into a practical design baseline for the next project phase: launching a production-grade mobile app for both **Android (Google Play)** and **iOS (App Store)**.

It is intended for founders, product, design, and engineering teams to align on:
- what already exists,
- what is prototype vs production-ready,
- what needs to be built next,
- and how to execute in phases.

---

## 2) Current project snapshot

### 2.1 Tech stack
- **Framework**: Expo + React Native + Expo Router (file-based routes).
- **Language**: TypeScript (strict mode).
- **State/Data**: React Query for server-state patterns, AsyncStorage for local session/theme persistence.
- **UI**: Custom components, Lucide icons, LinearGradient, themed light/dark color system.
- **Build/Release**: EAS config present with development/preview/production profiles.

### 2.2 Product scope implemented today (high level)
The current app already includes:
- Login and multi-step signup flow.
- Main tab navigation (Home, Search, Profile).
- Detail pages for posts and user profiles.
- Messages and notifications screens.
- Settings with theme toggle and logout.
- Upload and media-related UI components.

### 2.3 Maturity level
Current branch appears to be a **functional product prototype / v0 app shell** with:
- strong visual UX foundation,
- route structure in place,
- partial API integration,
- but still using substantial dummy/mock content in feed/social surfaces.

---

## 3) Functional map of current app

## 3.1 Authentication & onboarding
- **Login screen** (`app/index.tsx`)
  - checks existing session from local storage;
  - supports identifier + password login;
  - stores session and user payload in AsyncStorage on success.
- **Signup flow** (`app/signup/*`)
  1. email/phone capture,
  2. password setup,
  3. date of birth,
  4. KPI/interest selection.

### 3.2 Main app surfaces
- **Home feed** (`app/(tabs)/index.tsx`) with stories-like row, cards, ad variants, and interaction controls.
- **Search** (`app/(tabs)/search.tsx`) with trends and grid results.
- **Profile** (`app/(tabs)/profile.tsx`) with grid/spider views and post interactions.

### 3.3 Secondary surfaces
- Notifications (`app/notifications/index.tsx`) with infinite-scroll pattern.
- Messaging list + chat (`app/messages/*`).
- Post detail and chain exploration (`app/post/[id].tsx`).
- User profile pages (`app/user/[username].tsx`).
- Settings and account/theme actions (`app/settings.tsx`).

---

## 4) Architecture baseline (as-built)

### 4.1 Front-end architecture
- **Routing**: file-system routing via Expo Router.
- **App providers**:
  - `QueryProvider` for React Query,
  - `ThemeProvider` for dark/light and color tokens.
- **Pattern**:
  - Screen-level UI in `app/`;
  - reusable UI blocks in `components/`;
  - data hooks in `hooks/`;
  - API clients in `src/api/`;
  - local utilities in `lib/`;
  - mock services in `services/`.

### 4.2 Data and storage
- **Server-facing API client**: `src/api/userService.ts` (fetch wrapper + typed request/response models).
- **Session persistence**: `lib/sessionStorage.ts`.
- **Signup transient memory state**: `lib/signupStorage.ts`.
- **Feed/notifications mocks**: `services/feedService.ts`, `services/notificationService.ts`.

### 4.3 Theming and UX system
- Theme context persists mode in AsyncStorage.
- Shared color tokens include semantic roles (surface, border, text, icon, etc.) and gradient presets.

---

## 5) Key findings & risks to address before store launch

## 5.1 API-contract inconsistencies (important)
There is an integration mismatch in current code:
- Signup KPI screen imports functions (`signup`, `signin`, `getUserProfile`) that are not defined in current `src/api/userService.ts` API surface.
- Existing API client defines `authSignup`, `authSignin`, `getUserDetails`, `updateUser`.

**Impact**: build/typecheck instability and runtime auth/onboarding risk.

### 5.2 Prototype-heavy feature surfaces
Many social surfaces currently rely on static dummy datasets (feed, notifications, messages, profile posts, post chains, user profile).

**Impact**: good for UX validation, but not production behavior.

### 5.3 Session and security hardening needed
- Session storage is AsyncStorage-only (not secure storage for secrets/tokens).
- No refresh-token lifecycle visible.
- Broad `AsyncStorage.clear()` during logout can remove unrelated keys.

### 5.4 Operational readiness gaps
Missing or not yet visible in repo:
- observability pipeline (crash + analytics events),
- release quality gates (E2E + smoke CI),
- privacy/legal instrumentation for store policy readiness,
- robust offline/network error strategies on all key flows.

---

## 6) Design for next project phase (recommended)

## 6.1 Product goal
Ship **KnowIntent v1 mobile app** to both stores with:
1. reliable auth and profile lifecycle,
2. real personalized feed + engagement primitives,
3. robust production quality (performance, crash safety, policy compliance).

### 6.2 Proposed target architecture (v1)

#### A) App layers
1. **Presentation**: screens/components (existing pattern retained).
2. **Domain layer**: typed use-cases (`auth`, `feed`, `profile`, `engagement`, `notifications`, `chat`).
3. **Data layer**:
   - HTTP client + endpoint modules;
   - DTO-to-domain mappers;
   - cache policy via React Query.

#### B) API client standardization
- Consolidate all endpoints under one consistent service contract.
- Enforce versioned route namespace (`/v1/...`) and shared error shape.
- Add auth interceptor strategy for token attach + token refresh + forced logout.

#### C) Local persistence model
- Move sensitive tokens to secure storage (e.g., Expo SecureStore).
- Keep non-sensitive profile/settings in AsyncStorage.
- Add migration strategy for key renaming between app versions.

#### D) Feature flags
- Introduce remote-config/flags to safely roll out risky features (chat, intent chains, ranking experiments).

---

## 7) Feature roadmap (execution-ready)

## Phase 1 — Stabilize foundations (2–3 weeks)
- Fix auth API mismatch and unify onboarding/login models.
- Introduce typed domain models and normalize data contracts.
- Replace dummy data in at least one core surface (home feed) with real backend data.
- Add central error mapper + user-friendly error messages.
- Add startup health checks (session validation + app version gate).

## Phase 2 — Production core (3–5 weeks)
- Implement complete real-data flow for:
  - feed,
  - post detail + engagement,
  - notifications,
  - profile retrieval/update.
- Add pagination contracts and robust empty/error/loading states.
- Add image upload flow with retry and progressive states.
- Add instrumentation: analytics events + crash reporting.

## Phase 3 — Store readiness (2–3 weeks)
- Performance tuning (list virtualization, image caching strategy, memory audit).
- App policy readiness:
  - privacy policy URLs,
  - data collection declarations,
  - account deletion path,
  - age/consent checks if applicable.
- QA matrix for Android + iOS real devices.
- Release pipeline via EAS channels (internal → preview → production).

---

## 8) Cross-platform release design (Android + iOS)

### 8.1 Build/release strategy
- Continue with EAS profiles already configured.
- Add release channels and env segregation:
  - `dev`, `staging`, `production` API bases.
- Add semantic versioning discipline:
  - app version (marketing),
  - build numbers (platform specific).

### 8.2 Store submission checklist (must-have)
- App icons, splash, screenshots, preview videos.
- Privacy policy + terms pages reachable in-app and store listing.
- Account management: login/logout + delete account flow.
- Permission rationale strings (camera/photos already partially configured).
- Test accounts and reviewer notes for moderation teams.

### 8.3 Quality gates before publish
- 0 blocker crashes on smoke suite.
- Auth critical path success rate > 99% in internal testing.
- P95 screen load targets defined and validated.
- Upgrade path tested from previous builds.

---

## 9) Data contracts to define now (for backend + app sync)

Define and freeze schemas for:
- `User`
- `Session`
- `Post`
- `Media`
- `Reaction`
- `IntentChain`
- `Notification`
- `Conversation` / `Message`

For each schema include:
- required vs optional fields,
- timestamp format,
- pagination cursor semantics,
- nullable conventions,
- backward compatibility rules.

---

## 10) Suggested engineering standards for the next phase

- **Strict TypeScript** on all API payloads.
- **No screen-level raw fetch**; use feature service modules + React Query.
- **Unified error envelope** (code, message, retriable, context).
- **Small component boundaries** + snapshot/interaction tests for shared UI blocks.
- **Observability first**: every critical user flow emits success/failure telemetry.

---

## 11) Immediate actions (next 7 days)

1. Create `docs/` folder and split this design into living specs:
   - `docs/architecture.md`
   - `docs/api-contracts.md`
   - `docs/release-plan.md`
2. Resolve auth API mismatch and make `npm run typecheck` green.
3. Decide v1 scope freeze (which features are truly GA vs postponed).
4. Add staging backend and wire environment-based configuration.
5. Start internal alpha using EAS `preview` builds.

---

## 12) Founder summary (plain language)
You have already built a strong cross-platform base in Expo/React Native with a clear product direction. The next step is not re-building UI; it is **converting prototype surfaces into production systems**: API consistency, secure session lifecycle, real data, observability, and release discipline.

If we execute the three phases above, this project can move from “great prototype” to “store-ready v1” with significantly lower launch risk.
