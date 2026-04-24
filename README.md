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

## TestFlight prep
1. `npm test`
2. `npm run cap:sync:ios`
3. `npm run ios:build:sim`
4. `npm run ios:archive`
5. In Xcode Organizer das Archive auswählen und über `Distribute App` nach App Store Connect hochladen.

Current iOS bundle id: `com.forstna.fuelcalc`
Current app version/build: `2.1.1` / `3`

The archive command creates `build/Fuel.xcarchive`. The `build/`, `dist/`, `ios/App/App/public`, `ios/App/Pods`, and `node_modules` folders are local build artifacts and are ignored by git.
