import type { SetupFunction } from '@zenweb/core';
import type { ControllerSetupOption } from './types';
import { ControllerRegister } from './register';
import { debug, discoverControllerClass } from './utils';
export * from './controller';
export * from './types';
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
        for await (const r of discoverControllerClass(p, option.patterns)) {
          controllerRegister.registerClass(r);
        }
      }
    }

    setup.after(() => {
      controllerRegister.addToRouter(setup.core.router);
    });
  }
}
