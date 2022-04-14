import { inject, Context } from '@zenweb/inject';
import { Router, RouterMethod, RouterPath } from '@zenweb/router';

const MAPPING = Symbol('Controller#mapping');

interface MappingItem {
  method: RouterMethod;
  path: RouterPath;
  middleware?: Router.Middleware[];
  handle: () => Promise<void> | void;
}

export class Controller {
  @inject
  ctx?: Context;
}

export interface ControllerClass<T> {
  new (): T;
}

/**
 * 路由映射
 * @param method HTTP 方法
 * @param path 路径。如不指定则使用方法名
 * @param middleware 可选中间件
 */
export function mapping(method: RouterMethod = 'get', path?: RouterPath, ...middleware: Router.Middleware[]) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const list: MappingItem[] = Reflect.getMetadata(MAPPING, target) || [];
    list.push({ method, path: path || `/${propertyKey}`, middleware, handle: descriptor.value });
    Reflect.defineMetadata(MAPPING, list, target);
  }
}

/**
 * 控制器
 * @param router 路由对象
 * @param middleware 控制器中间件
 */
export function controller<C>(router: Router, ...middleware: Router.Middleware[]) {
  return function (controllerClass: ControllerClass<C>) {
    const mappingList: MappingItem[] = Reflect.getMetadata(MAPPING, controllerClass.prototype);
    if (mappingList) {
      for (const item of mappingList) {
        router[item.method](item.path, ...item.middleware, ...middleware, async ctx => {
          const controller = await ctx.injector.getInstance(controllerClass);
          await item.handle.call(controller);
        });
      }
    }
  };
}
