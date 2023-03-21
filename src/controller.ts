/// <reference types="@zenweb/result" />
import { Context, Middleware, SetupHelper } from '@zenweb/core';
import { inject, scope } from '@zenweb/inject';
import { Router, RouterMethod, RouterOptions, RouterPath } from '@zenweb/router';
import { makeClassDecorator, makeMethodDecorator, MethodDescriptor } from 'decorator-make';

interface MappingItem extends MethodDescriptor {
  methods: RouterMethod[];
  path: RouterPath;
  middleware: Middleware[];
}

export class Controller {
  @inject protected ctx!: Context;
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
  middleware?: Middleware | Middleware[],
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

interface ControlleOption extends RouterOptions {
  middleware?: Middleware | Middleware[];
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
 * @param setup 安装助手
 * @param target 控制器
 */
export function addToRouter(setup: SetupHelper, target: any) {
  const mappingList = mappingDecorator.getMethods(target.prototype);
  if (mappingList.length > 0) {
    scope('prototype', false)(target);
    const option = controllerDecorator.getValue(target);
    setup.debug('controller option: %o', option);
    const _router = new Router(option);
    if (option && option.middleware) {
      const middlewares = (Array.isArray(option.middleware) ? option.middleware : [option.middleware]);
      _router.use(...middlewares);
    }
    for (const item of mappingList) {
      setup.debug('controller mapping: %o', item);
      const middlewares = [
        ...item.middleware,
        async (ctx: Context) => {
          const controller = await ctx.injector.getInstance(target);
          const result = await ctx.injector.apply(controller, item);
          if (result !== undefined) {
            if (typeof ctx.success === 'function') {
              ctx.success(result);
            } else {
              ctx.body = result;
            }
          }
        },
      ];
      if (item.methods.includes('ALL')) {
        _router.all(item.path, ...middlewares);
      } else {
        // <any>item.path 实际上路由参数支持数组形式，只是 ts 文件没有正确描述
        _router.register(<any>item.path, item.methods, middlewares);
      }
    }
    setup.core.router.use(_router.routes());
  } else {
    setup.debug('ignore no mapping: %o', target);
  }
}
