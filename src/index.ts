import path = require('path');
import globby = require('globby');
import { SetupFunction } from '@zenweb/core';
import { ControllerClass, ControllerSetupOption } from './types';
import { ControllerRegister } from './register';
import { debug } from './utils';
export { controller, mapping } from './controller';
export * from './types';

export default function setup(opt?: ControllerSetupOption): SetupFunction {
  const option = Object.assign({
    discoverPaths: ['./app/controller'],
  }, opt);
  return async function controller(setup) {
    debug('option: %o', option);
    setup.assertModuleExists('router');
    setup.assertModuleExists('inject');

    const controllerRegister = new ControllerRegister();
    setup.defineCoreProperty('controllerRegister', { value: controllerRegister });

    if (option.discoverPaths && option.discoverPaths.length) {
      for (let p of option.discoverPaths) {
        if (p.startsWith('./')) {
          p = path.join(process.cwd(), p.slice(2));
        }
        for (const file of await globby('**/*.{js,ts}', { cwd: p, absolute: true })) {
          debug('load:', file);
          const mod = require(file.slice(0, -3));
          for (const i of Object.values(mod)) {
            if (typeof i === 'function') {
              controllerRegister.registerClass(<ControllerClass> i);
            }
          }
        }
      }
    }

    setup.after(() => {
      controllerRegister.addToRouter(setup.core.router);
    });
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
