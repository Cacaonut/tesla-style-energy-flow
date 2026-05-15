import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'dist', 'tesla-style-energy-flow.js'), 'utf8');
const gzipSource = zlib.gunzipSync(
  fs.readFileSync(path.join(root, 'dist', 'tesla-style-energy-flow.js.gz'))
).toString('utf8');

assert.match(
  source,
  /const sceneScale = clamp\(safeNum\(cfg\.scene_scale, 1\), 0\.6, 1\.4\);/,
  'scene_scale should default to 1.0 to avoid clipping the SVG in Safari'
);

assert.doesNotMatch(
  source,
  /<svg viewBox="0 0 600 460" style="transform: scale/,
  'the SVG should not be scaled with CSS transform because ha-card clips the result'
);

assert.match(
  source,
  /'battery-label': Object\.freeze\(\{ x: -30, y: 82 \}\)/,
  'day clear idle battery label should sit high enough to stay inside the card'
);

assert.match(
  source,
  /'solar-label': Object\.freeze\(\{ x: 0, y: -94 \}\),\s*'solar-power': Object\.freeze\(\{ x: 0, y: -72 \}\),\s*'solar-guide': Object\.freeze\(\{ x1: -20, y1: -56, x2: -20, y2: 16 \}\)/,
  'day clear idle solar label, power and guide should sit closer to the PV modules'
);

assert.match(
  source,
  /'grid-label': Object\.freeze\(\{ x: 22, y: 68 \}\),\s*'grid-power': Object\.freeze\(\{ x: 22, y: 88 \}\),\s*'grid-guide': Object\.freeze\(\{ x1: 4, y1: 26, x2: 4, y2: 64 \}\)/,
  'day clear idle grid label and power should move down while keeping the guide line in place'
);

assert.match(
  source,
  /'load-label': Object\.freeze\(\{ x: -14, y: -64 \}\),\s*'load-power': Object\.freeze\(\{ x: -14, y: -42 \}\),\s*'load-guide': Object\.freeze\(\{ x1: -32, y1: -6, x2: -32, y2: 68 \}\)/,
  'day clear idle house label and power should move up while the guide line reaches farther upward'
);

assert.match(
  source,
  /<text class="flow-arrow" id="flow-battery-arrow" x="4" y="97" text-anchor="middle"><\/text>/,
  'battery charge direction should use a separate green arrow between power and percent'
);

assert.match(
  source,
  /<text class="flow-pct" id="flow-battery-pct" x="17" y="97" text-anchor="start">--%<\/text>/,
  'battery percent should sit directly after the green arrow on the same baseline'
);

assert.match(
  source,
  /_alignBatteryValueRow\(\) \{/,
  'battery value row should be realigned after scene profiles so old pct coordinates cannot break the layout'
);

assert.match(
  source,
  /setAligned\('#flow-battery-arrow', powerX \+ 12, powerY\);[\s\S]*setAligned\('#flow-battery-pct', powerX \+ 25, powerY\);/,
  'battery arrow and percent should stay locked to the battery power baseline'
);

assert.match(
  source,
  /_alignLabelPowerColumns\(\) \{/,
  'labels should be realigned after scene profiles so headings stay centered over their power values'
);

assert.match(
  source,
  /alignPair\('#flow-solar-label', '#flow-solar-power'\);[\s\S]*alignPair\('#flow-grid-label', '#flow-grid-power'\);[\s\S]*alignPair\('#flow-load-label', '#flow-load-power'\);[\s\S]*alignPair\('#flow-ev-label', '#flow-ev-power'\);[\s\S]*alignPair\('#flow-ev2-label', '#flow-ev2-power'\);/,
  'middle-anchored headings should share the same x coordinate as their power values'
);

assert.doesNotMatch(
  source,
  /\.flow-node\.inactive \.flow-node-guide\s*\{\s*opacity: 0;\s*\}/,
  'node guide lines should remain visible even when a value is below the flow threshold'
);

assert.match(
  source,
  /morning_clear_idle: '',[\s\S]*afternoon_clear_idle: '',[\s\S]*evening_clear_idle: '',[\s\S]*night_clear_idle: '',/,
  'background_map should expose time-of-day keys for cleaner morning, afternoon, evening and night assets'
);

assert.match(
  source,
  /_sceneTimeSlot\(period\) \{/,
  'the card should derive a time-of-day slot for background lookup and tone overlays'
);

assert.match(
  source,
  /data-scene-tone="afternoon"/,
  'the static render should default to a readable afternoon tone until live state is available'
);

assert.match(
  source,
  /<rect class="flow-sky-dim" x="0" y="0" width="600" height="260"><\/rect>/,
  'the SVG should include a sky dimming layer so text remains readable on bright backgrounds'
);

assert.equal(
  gzipSource,
  source,
  'the gzip artifact should contain the same updated JavaScript that Home Assistant may serve'
);
