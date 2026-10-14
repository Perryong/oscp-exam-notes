import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
export function extractLegacy(html) {
 const parse = name => {
  const match = html.match(new RegExp('^const ' + name + ' = (\\[.*\\]);$', 'm'));
  if (!match) throw new Error('Missing reference array: '+name);
  return JSON.parse(match[1]);
 };
 return { PLAN: parse('PLAN'), CHEAT: parse('CHEAT') };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
 const {PLAN,CHEAT} = extractLegacy(readFileSync('tests/fixtures/legacy-index.html','utf8'));
 const ids = Object.fromEntries(PLAN.flatMap(w=>w.boxes.map(b=>{const key=b.platform+'|'+b.name; return [key,'seed-'+createHash('sha256').update(key).digest('hex').slice(0,24)]})));
 for (const [name,value] of Object.entries({ladder:PLAN,cheatsheet:CHEAT,'machine-ids':ids})) writeFileSync('src/reference/'+name+'.json',JSON.stringify(value,null,2)+'\n');
}
