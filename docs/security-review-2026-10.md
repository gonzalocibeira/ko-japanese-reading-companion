# October 2026 security review

Reviewed on 24 October 2026 against vendor advisories and the npm advisory registry. Scope: this Kō checkout, its locked dependencies, and the Node.js runtime used to build and test it.

## Findings and fixes

- The active Homebrew Node.js was 26.10.0, below the fixed 26.12.1 release. The [Node.js October 21 advisory](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases) lists ten fixes, including Brotli memory corruption (CVE-2026-111497), DNS input validation, TLS hostname verification, HTTP connection reuse, entropy caches, ZIP parsing, and filesystem permission checks. It also updates bundled dependencies and certificate trust. These are runtime vulnerabilities; npm audit does not detect them.
- Installed the official Node.js 26.12.1 macOS arm64 binary through the existing nvm installation; nvm verified its download checksum. `.nvmrc` selects it for this repository. This does not replace the Homebrew installation or change other projects' runtime selection: run `nvm use` when entering this repository.
- Added a shared Node version check and npm engine enforcement. Supported release floors are 22.23.4, 24.22.1, and 26.12.1. Later updates within these major versions are accepted; other major versions and prereleases require review. Builds check before deleting `dist`; packaging imports that guarded build. Typecheck and test commands also check the runtime.
- A live `npm audit --json` returned **0 known vulnerabilities** across 63 reported dependencies, including development and optional dependencies. No dependency version changes were indicated.
- Kō is a browser extension and ships no Node.js runtime, PHP server, LiteLLM package, or GitLab server. The PHP2Shell advisories therefore do not require application changes here. See the [NCSC PHP advisory](https://www.ncsc.gov.uk/news/critical-security-issue-affecting-php) for the separate affected server software.

The Node.js flaws concern development tooling in this repository. Kō's packaged dictionary decompression uses Chromium's gzip implementation rather than Node's Brotli decoder. No conclusion about a past compromise, unrelated host software, hosting accounts, or external services follows from this review. A clean dependency audit covers published advisories, not undisclosed vulnerabilities.

## Validation

- `npm run typecheck` and `npm run build` passed using Node.js 26.12.1.
- 21 focused Playwright tests passed: runtime version boundaries, internal-message authentication, Docs initialization, packaged-code CSP checks, preference mutations, cancellation isolation, dictionary search, grammar integrity, and query validation.
- The actual Node.js 26.10.0 build was rejected before changing any `dist` file. npm installation, typecheck, and test commands also rejected that runtime; the installation check left the lockfile unchanged.
- Regenerated executable bundles match their pre-review bytes. Only generated README/technical documentation and this review changed. Original icon bytes were preserved after the patched runtime's zlib produced different PNG compression.
- `git diff --check` passed. The initial tooling-only review did not run the full browser integration suite. Existing release ZIPs and published versions were not changed.

## WIP integration verification on 24 October

The owner authorized committing and merging the existing Kō 1.4 work together with this security patch, while keeping 1.4 unreleased. The first full run passed 89 tests; sandbox restrictions blocked 13 browser-suite setup checks and left 171 tests unrun. Rerunning the affected suites with temporary Brave profiles and localhost access passed all 190 selected tests, including six repeated checks. This covers all 273 unique tests successfully across the two runs, including the native popup test that previously had a focus failure. No assertions were weakened. See `qa/release-1.4/wip-security-validation.json` for the recorded counts.

After marking and regenerating the 1.4 notes as unreleased WIP, all three native-popup/update-announcement smoke checks passed again.
