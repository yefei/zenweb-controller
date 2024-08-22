import * as path from 'path';
import * as globby from 'globby';
import { Debugger, debug as _debug } from '@zenweb/core';
import { ControllerClass } from './types';

export const debug: Debugger = _debug.extend('controller');

export async function *discoverControllerClass(dir: string, patterns?: string | readonly string[]) {
  if (dir.startsWith('./')) {
    dir = path.join(process.cwd(), dir.slice(2));
  }
  for (const file of await globby(patterns || '**/*.{js,ts,jsx,tsx}', { cwd: dir })) {
    debug('load:', file);
    const lastDot = Math.max(0, file.lastIndexOf('.'));
    const filename = lastDot ? file.slice(0, lastDot) : file;
    const mod = require(path.join(dir, filename));
    for (const i of Object.values(mod)) {
      if (typeof i === 'function') {
        yield { filename, class: <ControllerClass> i };
      }
    }
  }
}
