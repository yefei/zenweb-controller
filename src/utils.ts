import path from 'node:path';
import globby from 'globby';
import { Debugger, debug as _debug } from '@zenweb/core';
import { ControllerClass } from './types.js';
import { pathToFileURL } from 'node:url';

export const debug: Debugger = _debug.extend('controller');

export async function *discoverControllerClass(dir: string, patterns?: string | readonly string[]) {
  if (dir.startsWith('./')) {
    dir = path.join(process.cwd(), dir.slice(2));
  }
  for (const file of await globby(patterns || '**/*.{js,ts,jsx,tsx}', { cwd: dir })) {
    debug('load:', file);
    const lastDot = Math.max(0, file.lastIndexOf('.'));
    const filename = lastDot ? file.slice(0, lastDot) : file;
    const importUrl = pathToFileURL(path.join(dir, file)).href;
    const mod = await import(importUrl);
    for (const i of Object.values(mod)) {
      if (typeof i === 'function') {
        yield { filename, class: <ControllerClass> i };
      }
    }
  }
}
