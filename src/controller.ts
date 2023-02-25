import { Context } from '@zenweb/core';
import { inject } from '@zenweb/inject';
import { Router, RouterMethod, RouterPath } from '@zenweb/router';
import { makeClassDecorator, makeMethodDecorator } from 'decorator-make';

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

const mappingDecorator = makeMethodDecorator<MappingItem>();

/**
 * 路由映射
 * 如果方法中存在参数，则自动注入
 * 
 * @param arg0.method HTTP 方法，默认 GET
 * @param arg0.path 路径，默认 /{方法名}
 * @param arg0.middleware 中间件
 * 
 * #### 在 TypeScript 中使用
 * ```ts
 * class Target {
 *   \@mapping(opt?) someMethod(ctx: Context) {}
 * }
 * ```
 * 
 * #### 在 JavaScript 中使用
 * ```js
 * class Target {
 *   someMethod(ctx) {}
 * }
 * mapping(opt?)(Target.prototype, 'someMethod', [Context]);
 * ```
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
  return mappingDecorator.wrap((descriptor, target, propertyKey) => {
    if (!path) {
      if (typeof propertyKey === 'symbol') {
        throw new Error('Symbol method must be set path');
      }
      if (propertyKey === 'index') {
        path = '/';
      } else {
        path = `/${propertyKey}`;
      }
    }
    return {
      methods: method ? (Array.isArray(method) ? method : [method]) : ['GET'],
      path,
      middleware: middleware ? (Array.isArray(middleware) ? middleware : [middleware]) : [],
      handle: descriptor.handle,
      params: descriptor.params,
    };
  });
}

interface ControlleOption extends Router.RouterOptions {
  middleware?: Router.Middleware | Router.Middleware[];
}

const controllerDecorator = makeClassDecorator<ControlleOption>();

/**
 * 控制器选项
 * 
 * #### 在 TypeScript 中使用
 * ```ts
 * \@controller(opt?)
 * class Target {
 * }
 * ```
 * 
 * #### 在 JavaScript 中使用
 * ```js
 * class Target {
 * }
 * controller(opt?)(Target);
 * ```
 */
export function controller(opt: ControlleOption) {
  return controllerDecorator.wrap(() => {
    return opt;
  });
}

/**
 * 将控制器中的路由配置添加到指定路由中
 * @param router 路由实例
 * @param target 控制器
 */
export function addToRouter(router: Router, target: any) {
  const mappingList = mappingDecorator.getMethods(target.prototype);
  if (mappingList.length > 0) {
    const option = controllerDecorator.getValue(target);
    const _router = new Router(option);
    if (option && option.middleware) {
      _router.use(...(Array.isArray(option.middleware) ? option.middleware : [option.middleware]));
    }
    for (const item of mappingList) {
      const middlewares = [...item.middleware, async (ctx: Context) => {
        const controller = await ctx.injector.getInstance(target);
        await ctx.injector.apply(controller, item);
      }];
      if (item.methods.includes('ALL')) {
        _router.all(item.path, ...middlewares);
      } else {
        // <any>item.path 实际上路由参数支持数组形式，只是 ts 文件没有正确描述
        _router.register(<any>item.path, item.methods, middlewares);
      }
    }
    router.use(_router.routes());
  }
}
