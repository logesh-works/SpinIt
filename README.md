# SpinIt

SpinIt is for random spin that choose random value

## Table of contents
- [Quick start](#quick-start)
- [Development](#development)
- [Contributing](#contributing)
- [Reporting issues](#reporting-issues)
- [Pull request checklist](#pull-request-checklist)
- [Code of conduct](#code-of-conduct)
- [License](#license)

## Quick start
These instructions assume you have a working React Native environment. If not, follow the official React Native docs for environment setup: https://reactnative.dev/docs/environment-setup

Prerequisites
- Node.js (LTS recommended)
- npm or Yarn
- Android Studio (for Android)
- Xcode + CocoaPods (for iOS, macOS only)

Install dependencies

```powershell
npm install
```

iOS (macOS only)

```powershell
cd ios
pod install
cd ..
```

Run the app

```powershell
npm start

npm run android

npm run ios
```

Run tests

```powershell
npm test
```

## Development
Source is in `src/`. Key folders:
- `src/components` - reusable components
- `src/screens` - screen components
- `src/services` - API and data services
- `src/utils` - helpers and utilities

Keep changes small and focused. Run the app locally to verify UI and behavior.

## Contributing
We welcome contributions! Please follow these simple steps:

1. Fork the repository.
2. Create a feature branch named `feature/short-description` or `fix/short-description`.
3. Install dependencies and run the app/tests locally.
4. Make your changes and add tests where appropriate.
5. Commit with a clear message:
   - Use the present tense: "Add", "Fix", "Update"
   - Example: `feat: add spinner detail screen`
6. Push your branch and open a Pull Request against `main` (or the default branch).

Be responsive to review comments. Small PRs are easier to review.

## Reporting issues
Please open an issue if you find a bug or want to request a feature. A good issue includes:
- Title: short summary
- Description: what happened and why you think it's a problem
- Steps to reproduce: exact steps to see the bug
- Expected vs actual behavior
- Environment: OS, device/emulator, Node/npm versions, app version
- Logs or screenshots (if helpful)

Example issue body:
```
**Title**: App crashes when opening spinner detail

**Describe the bug**
The app crashes when tapping a spinner in the home list.

**Steps to reproduce**
1. Open app
2. Tap the first spinner in the list

**Expected**
Spinner detail screen opens

**Actual**
App crashes with a red error screen

**Environment**
- OS: Android 13 emulator
- Node: 18.16.0
- App branch: main
```

---