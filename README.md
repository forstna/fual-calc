# fuel-calc
Fuel calculator for simracing.

## Capacitor iOS setup
1. `npm install`
2. `npm run cap:add:ios` (first time only)
3. `npm run cap:sync:ios`
4. `npm run cap:open:ios`
5. In Xcode immer `ios/App/App.xcworkspace` verwenden (nicht `App.xcodeproj`)
6. Für den Simulator ein iPhone-Device wählen und `Run` ausführen

The web app is still the source of truth (`index.html`, `sw.js`, `manifest.json`).
`npm run build` copies the web bundle into `dist/`, and Capacitor uses `dist` as `webDir`.
