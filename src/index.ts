import { SetupFunction } from '@zenweb/core';
export * from './controller';
export * from './crud';

export default function setup(): SetupFunction {
  return function router(setup) {
    setup.checkCoreProperty('router', '@zenweb/router');
    setup.checkCoreProperty('injector', '@zenweb/inject');
  }
}
