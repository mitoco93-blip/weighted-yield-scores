import {readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){const p=dir+'/'+e.name;if(e.isDirectory())await walk(p);else if(p.endsWith('.js')){const r=spawnSync(process.execPath,['--check',p],{encoding:'utf8'});if(r.status!==0)throw Error(r.stderr);}}}
await walk('ui');await walk('ui-next');console.log('All release JavaScript syntax checks passed.');
