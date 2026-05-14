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
  /'grid-label': Object\.freeze\(\{ x: 8, y: 58 \}\)/,
  'day clear idle grid label should sit high enough to stay inside the card'
);

assert.match(
  source,
  /<text class="flow-pct" id="flow-battery-pct" x="8" y="97" text-anchor="start">--%<\/text>/,
  'battery percent should sit on the same baseline as battery power, Tesla-app style'
);

assert.equal(
  gzipSource,
  source,
  'the gzip artifact should contain the same updated JavaScript that Home Assistant may serve'
);
