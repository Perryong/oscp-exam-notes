import { expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { extractLegacy } from '../../scripts/extract-reference.mjs';
import ladder from './ladder.json';
import cheatsheet from './cheatsheet.json';
import ids from './machine-ids.json';
const original = readFileSync('tests/fixtures/legacy-index.html','utf8');
test('preserves every ladder field and cheat-sheet section',()=>{
 expect(ladder).toEqual(extractLegacy(original).PLAN);
 expect(cheatsheet).toEqual(extractLegacy(original).CHEAT);
 expect(ladder.length).toBeGreaterThan(10);
});
test('assigns a stable unique ID to every legacy machine',()=>{
 const keys = [...new Set(ladder.flatMap(w=>w.boxes.map(b=>b.platform+'|'+b.name)))];
 expect(Object.keys(ids).sort()).toEqual(keys.sort());
 expect(new Set(Object.values(ids)).size).toBe(keys.length);
});
