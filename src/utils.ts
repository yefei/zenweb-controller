import * as path from 'path';
import * as globby from 'globby';
import Debugger from 'debug';
import { ControllerClass } from './types';

export const debug = Debugger('zenweb:controller');

export async function *discoverControllerClass(dir: string, patterns?: string | readonly string[]) {
  if (dir.startsWith('./')) {
    dir = path.join(process.cwd(), dir.slice(2));
  }
  for (const file of await globby(patterns || '**/*.{js,ts}', { cwd: dir, absolute: true })) {
    debug('load:', file);
    const mod = require(file.slice(0, -3));
    for (const i of Object.values(mod)) {
      if (typeof i === 'function') {
        yield {
          class: <ControllerClass> i,
          file,
          name: file.slice(dir.length + 1, file.length - 3),
        };
      }
    }
  }
}
