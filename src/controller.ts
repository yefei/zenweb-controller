import { inject, Context } from '@zenweb/inject';
import { Router, RouterMethod, RouterPath } from '@zenweb/router';

const MAPPING = Symbol('Controller#mapping');
const OPTION = Symbol('Controller#option');

interface MappingItem {
  methods: RouterMethod[];
  path: RouterPath;
  middleware: Router.Middleware[];
  handle: (...args: any[]) => Promise<void> | void;
  params: any[];
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
 * 如果方法中存在参数，则自动注入
 * @param arg0.method HTTP 方法，默认 GET
 * @param arg0.path 路径，默认 /{方法名}
 * @param arg0.middleware 中间件
 */
export function mapping({
  method,
  path,
  middleware,
}: {
  method?: RouterMethod | RouterMethod[],
  path?: RouterPath,
  middleware?: Router.Middleware | Router.Middleware[],
} = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const params = Reflect.getMetadata('design:paramtypes', target, propertyKey) || [];
    addControllerMapping(target, {
      methods: method ? (Array.isArray(method) ? method : [method]) : ['GET'],
      path: path || (propertyKey === 'index' ? '/' : `/${propertyKey}`),
      middleware: middleware ? (Array.isArray(middleware) ? middleware : [middleware]) : [],
      handle: descriptor.value,
      params,
    });
  }
}

interface ControlleOption extends Router.RouterOptions {
  middleware?: Router.Middleware | Router.Middleware[];
}

/**
 * 控制器选项
 */
export function controller<C>(opt: ControlleOption) {
  return function (target: ControllerClass<C>) {
    Reflect.defineMetadata(OPTION, opt, target);
  };
}

/**
 * 取得控制器选项
 */
export function getControllerOption(target: any): ControlleOption {
  return Reflect.getMetadata(OPTION, target);
}

/**
 * 将控制器中的路由配置添加到指定路由中
 * @param router 路由实例
 * @param target 控制器
 */
export function addToRouter(router: Router, target: any) {
  const mappingList = getControllerMapping(target.prototype);
  if (mappingList) {
    const option = getControllerOption(target);
    const _router = new Router(option);
    if (option && option.middleware) {
      _router.use(...(Array.isArray(option.middleware) ? option.middleware : [option.middleware]));
    }
    for (const item of mappingList) {
      // <any>item.path 实际上路由参数支持数组形式，只是 ts 文件没有正确描述
      _router.register(<any>item.path, item.methods, [...item.middleware, async ctx => {
        const controller = await ctx.injector.getInstance(target);
        const args = await Promise.all(item.params.map(i => ctx.injector.getInstance(i)));
        await item.handle.apply(controller, args);
      }]);
    }
    router.use(_router.routes());
  }
}
