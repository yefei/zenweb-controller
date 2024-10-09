import { sep } from 'node:path';
import { SetupFunction } from '@zenweb/core';
import { ControllerSetupOption } from './types.js';
import { ControllerRegister } from './register.js';
import { debug, discoverControllerClass } from './utils.js';

export * from './controller.js';
export * from './types.js';
export {
  ControllerRegister,
  discoverControllerClass,
}

export default function setup(opt?: ControllerSetupOption): SetupFunction {
  const option = Object.assign({
    discoverPaths: ['./app/controller'],
  }, opt);
  return async function controller(setup) {
    debug('option: %o', option);
    setup.assertModuleExists('router');
    setup.assertModuleExists('inject');

    const controllerRegister = await setup.core.injector.getInstance(ControllerRegister);

    if (option.discoverPaths && option.discoverPaths.length) {
      for (let p of option.discoverPaths) {
        for await (const i of discoverControllerClass(p, option.patterns)) {
          controllerRegister.registerClass(
            i.class,
            option.autoControllerPrefix ? i.filename.split(sep).filter(i => i !== 'index').join('/') : undefined,
          );
        }
      }
    }

    setup.after(() => {
      controllerRegister.addToRouter(setup.core.router);
    });
  }
}
