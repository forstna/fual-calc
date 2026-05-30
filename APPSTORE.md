# App Store / TestFlight checklist

## Current app
- App name: Fuel — iRacing Calculator
- Bundle ID: `com.forstna.fuelcalc`
- Version/build: `2.1.1` / `3`
- Platform wrapper: Capacitor iOS
- Web source of truth: `index.html`, `sw.js`, `manifest.json`

## Preflight
- `node race-regression.test.js`
- `node scripts/build-web.mjs`
- `npm run cap:sync:ios` on Mac when dependencies are installed
- Open `ios/App/App.xcworkspace` in Xcode
- Archive Release for generic iOS device
- Upload archive via Xcode Organizer to App Store Connect / TestFlight

## App Store privacy answers draft
- Data collection: No data collected
- Tracking: No
- Third-party ads/analytics: No
- Account required: No
- Network/backend: No app backend; calculator runs locally
- Encryption/export compliance: Uses only standard Apple/web platform encryption; `ITSAppUsesNonExemptEncryption=false` is set.

## Suggested metadata draft
Name: Fuel — iRacing Calculator
Subtitle: Sim racing fuel strategy
Category: Sports or Utilities
Short description: Calculate race fuel, stint strategy, pit stops, safety margin, and live fuel projections for iRacing-style sim racing.
Support URL: use the Netlify app URL or a GitHub Pages/support page.
Privacy URL: add a simple no-data-collected privacy page before App Store submission.
