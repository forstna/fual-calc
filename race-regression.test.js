'use strict';

function parseLapTime(s) {
  s = (s || '').trim();
  if (s.includes(':')) {
    const [m, sec] = s.split(':');
    const mins = parseFloat(m);
    const secs = parseFloat(sec || 0);
    const total = mins * 60 + secs;
    return Number.isFinite(total) && total > 0 ? total : 0;
  }
  const total = parseFloat(s);
  return Number.isFinite(total) && total > 0 ? total : 0;
}

function calcRace(input) {
  const mode = input.mode;
  const ltSec = parseLapTime(input.lapTime);

  const fplRaw = Number.parseFloat(input.fuelPerLap);
  const tankRaw = Number.parseFloat(input.tankSize);
  const mgRaw = Number.parseInt(input.safetyMargin, 10);

  const fpl = Number.isFinite(fplRaw) && fplRaw >= 0 ? fplRaw : 0;
  const tank = Number.isFinite(tankRaw) && tankRaw > 0 ? tankRaw : 0;
  const mg = Number.isFinite(mgRaw) ? Math.max(0, mgRaw) : 0;

  let raceLaps;
  if (mode === 'time') {
    const minsRaw = Number.parseFloat(input.raceDuration);
    const mins = Number.isFinite(minsRaw) && minsRaw > 0 ? minsRaw : 0;
    raceLaps = ltSec > 0 ? Math.ceil((mins * 60) / ltSec) : 0;
  } else {
    const lapsRaw = Number.parseInt(input.raceLaps, 10);
    raceLaps = Number.isFinite(lapsRaw) && lapsRaw > 0 ? lapsRaw : 0;
  }

  const totalLaps = raceLaps + mg;
  const fuelBase = raceLaps * fpl;
  const fuelTot = totalLaps * fpl;
  const pct = tank > 0 ? (fuelTot / tank) * 100 : 0;
  const minPits = tank > 0 ? Math.max(0, Math.ceil(fuelTot / tank) - 1) : 0;
  const overflow = tank > 0 ? fuelTot > tank : false;

  const warnings = [];
  if (tank <= 0) warnings.push('tank');
  if (fpl <= 0) warnings.push('fpl');
  if (mode === 'time' && ltSec <= 0) warnings.push('lapTime');
  if (overflow) warnings.push('overflow');

  return {
    raceLaps,
    totalLaps,
    fuelBase,
    fuelTot,
    pct,
    minPits,
    overflow,
    warnings,
  };
}

function almostEqual(a, b, eps = 1e-9) {
  return Math.abs(a - b) <= eps;
}

function runScenario(s) {
  const out = calcRace(s.input);
  const checks = [];

  if (typeof s.expect.raceLaps === 'number') checks.push(out.raceLaps === s.expect.raceLaps);
  if (typeof s.expect.totalLaps === 'number') checks.push(out.totalLaps === s.expect.totalLaps);
  if (typeof s.expect.fuelTot === 'number') checks.push(almostEqual(out.fuelTot, s.expect.fuelTot));
  if (typeof s.expect.minPits === 'number') checks.push(out.minPits === s.expect.minPits);
  if (typeof s.expect.overflow === 'boolean') checks.push(out.overflow === s.expect.overflow);
  if (Array.isArray(s.expect.warnings)) {
    const a = [...out.warnings].sort().join(',');
    const b = [...s.expect.warnings].sort().join(',');
    checks.push(a === b);
  }

  return {
    id: s.id,
    name: s.name,
    pass: checks.every(Boolean),
    output: out,
    expected: s.expect,
  };
}

const scenarios = [
  {
    id: 'S1',
    name: '60min Standard (Overflow + 1 Pit)',
    input: { mode: 'time', raceDuration: 60, lapTime: '1:45', fuelPerLap: 2.8, tankSize: 75, safetyMargin: 2 },
    expect: { raceLaps: 35, totalLaps: 37, fuelTot: 103.6, minPits: 1, overflow: true, warnings: ['overflow'] },
  },
  {
    id: 'S2',
    name: '30min exakte Teilbarkeit',
    input: { mode: 'time', raceDuration: 30, lapTime: '1:30', fuelPerLap: 2.2, tankSize: 50, safetyMargin: 1 },
    expect: { raceLaps: 20, totalLaps: 21, fuelTot: 46.2, minPits: 0, overflow: false, warnings: [] },
  },
  {
    id: 'S3',
    name: 'Laps-Mode ignoriert ungültige LapTime',
    input: { mode: 'laps', raceLaps: 42, lapTime: 'abc', fuelPerLap: 2.5, tankSize: 120, safetyMargin: 2 },
    expect: { raceLaps: 42, totalLaps: 44, fuelTot: 110, minPits: 0, overflow: false, warnings: [] },
  },
  {
    id: 'S4',
    name: 'Time-Mode mit ungültiger LapTime',
    input: { mode: 'time', raceDuration: 45, lapTime: 'abc', fuelPerLap: 2.0, tankSize: 70, safetyMargin: 1 },
    expect: { raceLaps: 0, totalLaps: 1, fuelTot: 2.0, minPits: 0, overflow: false, warnings: ['lapTime'] },
  },
  {
    id: 'S5',
    name: 'Tankgröße 0',
    input: { mode: 'laps', raceLaps: 10, lapTime: '1:40', fuelPerLap: 2.5, tankSize: 0, safetyMargin: 1 },
    expect: { raceLaps: 10, totalLaps: 11, fuelTot: 27.5, minPits: 0, overflow: false, warnings: ['tank'] },
  },
  {
    id: 'S6',
    name: 'Verbrauch 0',
    input: { mode: 'laps', raceLaps: 10, lapTime: '1:40', fuelPerLap: 0, tankSize: 50, safetyMargin: 2 },
    expect: { raceLaps: 10, totalLaps: 12, fuelTot: 0, minPits: 0, overflow: false, warnings: ['fpl'] },
  },
  {
    id: 'S7',
    name: 'Edge: negative Safety-Margin wird auf 0 geclamped',
    input: { mode: 'laps', raceLaps: 20, lapTime: '1:30', fuelPerLap: 3.0, tankSize: 100, safetyMargin: -3 },
    expect: { raceLaps: 20, totalLaps: 20, fuelTot: 60, minPits: 0, overflow: false, warnings: [] },
  },
  {
    id: 'S8',
    name: 'Sehr kurze Rundenzeit (hohe Lap-Anzahl)',
    input: { mode: 'time', raceDuration: 60, lapTime: '0:30', fuelPerLap: 1.2, tankSize: 100, safetyMargin: 0 },
    expect: { raceLaps: 120, totalLaps: 120, fuelTot: 144, minPits: 1, overflow: true, warnings: ['overflow'] },
  },
  {
    id: 'S9',
    name: 'LapTime mit Leerzeichen + Dezimalstellen',
    input: { mode: 'time', raceDuration: 10, lapTime: ' 1:45.5 ', fuelPerLap: 2.0, tankSize: 30, safetyMargin: 0 },
    expect: { raceLaps: 6, totalLaps: 6, fuelTot: 12, minPits: 0, overflow: false, warnings: [] },
  },
  {
    id: 'S10',
    name: 'Große Werte (Numerik-Stabilität)',
    input: { mode: 'laps', raceLaps: 1000, lapTime: '2:00', fuelPerLap: 3.33, tankSize: 120, safetyMargin: 5 },
    expect: { raceLaps: 1000, totalLaps: 1005, fuelTot: 3346.65, minPits: 27, overflow: true, warnings: ['overflow'] },
  },
];

const results = scenarios.map(runScenario);

console.log('Race Regression Matrix');
console.log('ID   | Ergebnis | Szenario');
console.log('-----|----------|-----------------------------------------------');
for (const r of results) {
  console.log(`${r.id.padEnd(4)} | ${(r.pass ? 'PASS' : 'FAIL').padEnd(8)} | ${r.name}`);
}

const failed = results.filter(r => !r.pass);
if (failed.length > 0) {
  console.log('\nFehlerdetails:');
  for (const f of failed) {
    console.log(`- ${f.id} ${f.name}`);
    console.log(`  expected: ${JSON.stringify(f.expected)}`);
    console.log(`  got     : ${JSON.stringify(f.output)}`);
  }
  process.exitCode = 1;
} else {
  console.log('\nAlle 10 Szenarien bestanden.');
}
