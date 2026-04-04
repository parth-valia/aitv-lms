# AITV Mini LMS

A micro-learning mobile app built with React Native Expo, demonstrating advanced native features, WebView integration, AI-powered recommendations, comprehensive security hardening, and full CI/CD automation.

---

## Setup Instructions

### Prerequisites

- Node.js 20+
- npm 10+
- Expo CLI: `npm install -g expo-cli`
- EAS CLI (for builds): `npm install -g eas-cli`
- iOS Simulator (macOS) or Android Emulator / physical device

### Install & Run

```bash
git clone https://github.com/parth-valia/aitv-lms
cd aitv-lms
npm install
npx expo start
```

Press `i` for iOS Simulator, `a` for Android Emulator, or scan the QR code with Expo Go.

### Development Build (recommended for native features)

```bash
eas build --platform ios --profile development
eas build --platform android --profile development
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Public API base (freeapi.app)
EXPO_PUBLIC_API_BASE_URL=https://api.freeapi.app/api/v1

# Sentry DSN — from your Sentry project settings (optional, app works without it)
EXPO_PUBLIC_SENTRY_DSN=

# Claude AI API key — from console.anthropic.com (optional, falls back to local algorithm)
EXPO_PUBLIC_ANTHROPIC_API_KEY=

# Disables Sentry source map upload during local builds (set to true for dev)
SENTRY_DISABLE_AUTO_UPLOAD=true
```

All `EXPO_PUBLIC_` variables are inlined at build time. Never commit `.env` to version control.

---

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage report (requires >70% across branches/functions/lines/statements)
npm run test:coverage

# Watch mode
npm run test:watch
```

Test files live in `/tests/`. Coverage is collected from `src/store/`, `src/services/`, `src/utils/`, `src/hooks/`, and `src/components/`.

### CI Secrets required for GitHub Actions

| Secret | Purpose |
| --- | --- |
| `ANTHROPIC_API_KEY` | Claude AI in test suite |
| `CODECOV_TOKEN` | Coverage upload to Codecov |
| `EXPO_TOKEN` | EAS preview builds |

---

## Architecture

### Modular Layered Architecture

```text
src/
├── app/            File-based routing (Expo Router)
│   ├── (auth)/     Login, Register, Forgot/Reset Password
│   ├── (tabs)/     Discover, Bookmarks, Profile
│   ├── course/     Course Detail modal
│   └── webview/    Embedded video player (full-screen modal)
├── components/
│   ├── course/     CourseFeedCard (swipe-to-bookmark), CourseCard, Skeleton
│   ├── ui/         Button, Input, Avatar, Badge, EmptyState, ErrorBoundary, OfflineBanner
│   └── webview/    WebViewBridge (typed bidirectional postMessage)
├── services/
│   ├── api/        apiClient (auth, retry, timeout), courses, auth, Zod schemas
│   ├── ai/         Claude Haiku recommendations + semantic search (local fallback)
│   ├── notifications/  Milestone alerts, 24h inactivity reminder
│   ├── security/   CertificatePinner (host allowlist + fingerprint validation)
│   └── storage/    SecureStore (tokens), MMKV (app data)
├── store/          Zustand: authStore, courseStore, preferencesStore, uiStore
├── hooks/          useCourses, useDebounce, useNetwork
├── utils/          sanitize (XSS/injection prevention for all input types)
└── types/          Course, AuthUser, AuthTokens — shared domain models
```

### Key Architectural Decisions

**1. Server state vs. client state split**
TanStack Query owns all server data (course lists, user profile). Zustand owns local user actions (bookmarks, enrollments, progress, theme). This prevents stale-closure bugs and keeps each store focused.

**2. Token refresh lock**
A promise-based queue prevents race conditions when multiple API calls simultaneously hit a 401. Only one refresh fires; all others wait and retry with the new token. Implemented in `apiClient.ts`.

**3. TextInput outside FlashList**
The search bar lives in a stable `View` above the FlashList. FlashList remounts `ListHeaderComponent` on every data change — placing `TextInput` there causes focus loss on every keystroke. The header component contains only non-interactive content.

**4. AI graceful degradation**
`AIService` tries the Claude API first. If `EXPO_PUBLIC_ANTHROPIC_API_KEY` is unset or the call fails, it silently falls back to a deterministic local algorithm. The UI never knows the difference.

**5. Certificate pinning (defence in depth)**
JS-layer pinning validates request URLs against an allowlist and checks the `X-Certificate-Fingerprint` response header in production. For full TLS-layer pinning, `NSPinnedDomains` (iOS) and `network_security_config.xml` (Android) should be added to the native project.

**6. Data merging strategy**
`freeapi.app` has no dedicated course endpoint, so `/public/randomproducts` is treated as course catalog and `/public/randomusers` as instructors. Both are fetched in parallel and zipped by index. Ratings and enrollment counts are generated deterministically from product ID to remain stable across fetches.

---

## Feature Overview

| Requirement | Status | Notes |
| --- | --- | --- |
| Login / Register | ✅ | JWT + SecureStore, auto-login on restart |
| Token refresh | ✅ | Race-condition-safe refresh queue |
| Biometric login | ✅ | `expo-local-authentication`, gated by preference |
| Profile screen | ✅ | Avatar upload, stats, dark mode toggle |
| Course catalog | ✅ | FlashList, pull-to-refresh, skeleton loaders |
| Search | ✅ | 700ms debounce, stable focus (TextInput outside list) |
| Category filter | ✅ | `keepPreviousData` prevents flicker on switch |
| Bookmarks | ✅ | MMKV-persisted, swipe-to-bookmark gesture |
| Course detail | ✅ | Hero image, curriculum accordion, enroll CTA |
| WebView player | ✅ | Thumbnail → play, bidirectional bridge, JS injection |
| Local notifications | ✅ | Milestone (5/10/15 bookmarks), 24h inactivity reminder |
| Offline banner | ✅ | NetInfo real-time monitoring |
| Error boundaries | ✅ | Sentry-integrated, recovery UI |
| API retry / timeout | ✅ | Exponential backoff (3 attempts), 10s AbortController |
| AI recommendations | ✅ | Claude Haiku + local fallback |
| Swipe gesture | ✅ | Reanimated + GestureHandler pan |
| Dark mode | ✅ | NativeWind `dark:` classes, system-aware |
| Input sanitization | ✅ | XSS/injection prevention for all input types |
| Certificate pinning | ✅ | JS-layer host allowlist + fingerprint validation |
| Jailbreak detection | ✅ | `expo-device` `isRootedExperimentalAsync` |
| Test suite | ✅ | Jest + Testing Library, >70% coverage threshold |
| CI/CD pipeline | ✅ | GitHub Actions: lint → test → EAS preview build |
| TypeScript strict | ✅ | `strict`, `noUncheckedIndexedAccess`, `noImplicitReturns` |

---

## Known Issues / Limitations

1. **Mock curriculum data** — `MOCK_LESSONS` and `MOCK_MODULES` in `course/[id].tsx` and `webview/[id].tsx` are static placeholders. A real LMS would fetch curriculum from the API.

2. **Synthetic course ratings** — `freeapi.app` products don't have ratings. They are generated deterministically from the product ID (`3.5 + (id % 16) / 10`), so they look realistic but are not real user ratings.

3. **Certificate pin placeholders** — `certificatePinner.ts` ships with placeholder SHA-256 hashes. Before going to production, replace them with the actual public-key fingerprints for `api.freeapi.app` using: `openssl s_client -connect api.freeapi.app:443 | openssl x509 -pubkey -noout | openssl pkey -pubin -outform DER | openssl dgst -sha256 -binary | base64`.

4. **No E2E tests** — Detox integration was not added. Unit + integration tests (Jest + Testing Library) provide >70% coverage. Detox would require a native build target.

5. **EAS build requires Expo account** — The CI `build` job needs a valid `EXPO_TOKEN` secret. Without it the job is skipped (it only runs on push to `main`).

6. **`orientation: "default"`** — Landscape layout is functional but not specifically optimised; some screens (e.g. WebView player) benefit from it naturally; profile/discover are portrait-first.

---

## APK Build

```bash
# Install EAS CLI
npm install -g eas-cli
eas login

# Preview APK (Android)
eas build --platform android --profile preview

# The APK link is printed on completion and also emailed to your Expo account.
```

For a local build without EAS:

```bash
npx expo run:android --variant release
```

---

## CI/CD Pipeline

Three-job GitHub Actions workflow (`.github/workflows/ci.yml`):

```text
push/PR to main or master
        │
        ├── quality   Lint (ESLint) + TypeScript check
        │
        ├── test      Jest with coverage (>70%) + Codecov upload
        │
        └── build     EAS preview build iOS + Android
                      (only on push to main, after quality + test pass)
```
