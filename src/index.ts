import path = require('path');
import globby = require('globby');
import { SetupFunction } from '@zenweb/core';
import { ControllerRegister } from './controller';
export { Controller, controller, mapping } from './controller';

export interface ControllerOption {
  discoverPaths?: string[];
}

const defaultRouterOption: ControllerOption = {
  discoverPaths: ['./app/controller'],
};

export default function setup(opt?: ControllerOption): SetupFunction {
  const option = Object.assign({}, defaultRouterOption, opt);
  return async function controller(setup) {
    setup.debug('option: %o', option);
    setup.assertModuleExists('router');
    setup.assertModuleExists('inject');

    const controllerRegister = new ControllerRegister(setup);
    setup.defineCoreProperty('controllerRegister', { value: controllerRegister });

    if (option.discoverPaths && option.discoverPaths.length) {
      for (let p of option.discoverPaths) {
        if (p.startsWith('./')) {
          p = path.join(process.cwd(), p.slice(2));
        }
        for (const file of await globby('**/*.{js,ts}', { cwd: p, absolute: true })) {
          setup.debug('load:', file);
          const mod = require(file.slice(0, -3));
          for (const i of Object.values(mod)) {
            if (typeof i === 'function') {
              controllerRegister.registerByClass(i);
            }
          }
        }
      }
    }
  }
}

declare module '@zenweb/core' {
  interface Core {
    /**
     * 控制器注册器
     */
    controllerRegister: ControllerRegister;
  }
}
