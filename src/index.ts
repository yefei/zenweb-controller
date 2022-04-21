import path = require('path');
import globby = require('globby');
import { SetupFunction } from '@zenweb/core';
import { addToRouter } from './controller';
export { Controller, controller, mapping } from './controller';

export interface ControllerOption {
  discoverPaths?: string[];
}

const defaultRouterOption: ControllerOption = {
  discoverPaths: [path.join(process.cwd(), 'app', 'controller')],
};

export default function setup(option?: ControllerOption): SetupFunction {
  option = Object.assign({}, defaultRouterOption, option);
  return async function controller(setup) {
    setup.debug('option: %o', option);
    setup.checkCoreProperty('router', '@zenweb/router');
    setup.checkCoreProperty('injector', '@zenweb/inject');
    setup.defineCoreProperty('controller', { value: true });
    if (option.discoverPaths && option.discoverPaths.length) {
      for (const p of option.discoverPaths) {
        for (const file of await globby('**/*.{js,ts}', { cwd: p, absolute: true })) {
          const mod = require(file.slice(0, -3));
          for (const i of Object.values(mod)) {
            if (typeof i === 'function') {
              addToRouter(setup.core.router, i);
            }
          }
        }
      }
    }
  }
}
