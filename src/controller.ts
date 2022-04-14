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
 * 取得控制器的路由配置
 * @param target 
 * @returns 
 */
export function getControllerMapping(target: any): MappingItem[] {
  return Reflect.getMetadata(MAPPING, target);
}

/**
 * 在控制器中添加路由配置
 * @param target 
 * @param item 
 */
export function addControllerMapping(target: any, item: MappingItem) {
  const list = getControllerMapping(target) || [];
  list.push(item);
  Reflect.defineMetadata(MAPPING, list, target);
}

/**
 * 路由映射
 * @param method HTTP 方法
 * @param path 路径。如不指定则使用方法名
 * @param middleware 可选中间件
 */
export function mapping(method: RouterMethod = 'GET', path?: RouterPath, ...middleware: Router.Middleware[]) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    addControllerMapping(target, {
      method,
      path: path || `/${propertyKey}`,
      middleware,
      handle: descriptor.value,
    });
  }
}

/**
 * 控制器
 * @param middleware 控制器中间件
 */
export function controller<C>(...middleware: Router.Middleware[]) {
  return function (controllerClass: ControllerClass<C>) {
    const mappingList = getControllerMapping(controllerClass.prototype);
    if (mappingList) {
      for (const item of mappingList) {
        // 把控制器的中间件推到方法前
        item.middleware.unshift(...middleware);
      }
    }
  };
}

/**
 * 将控制器中的路由配置添加到指定路由中
 * @param router 路由实例
 * @param target 控制器
 */
export function addToRouter(router: Router, target: any) {
  const mappingList = getControllerMapping(target.prototype);
  if (mappingList) {
    for (const item of mappingList) {
      router[<'all'>item.method.toLowerCase()](item.path, ...item.middleware, async ctx => {
        const controller = await ctx.injector.getInstance(target);
        await item.handle.call(controller);
      });
    }
  }
}
