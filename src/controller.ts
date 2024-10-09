import { Middleware } from '@zenweb/core';
import { RouterMethod, RouterPath } from '@zenweb/router';
import { makeClassDecorator, makeMethodDecorator } from 'decorator-make';
import { ControllerOption, MappingItem } from './types.js';

export const mappingDecorator = makeMethodDecorator<MappingItem>();

/**
 * 路由映射
 * 如果方法中存在参数，则自动注入
 * 
 * @param arg0.method HTTP 方法，默认 GET
 * @param arg0.path 路径，默认 /{方法名}
 * @param arg0.middleware 中间件
 * @param arg0.prefix 路径前缀，只有 `path` 为 `string` 才有效，正则则忽略
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
  prefix,
  middleware,
}: {
  method?: RouterMethod | RouterMethod[],
  path?: RouterPath,
  prefix?: string,
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
    if (prefix && typeof path === 'string') {
      path = `${prefix}${path}`;
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

export const controllerDecorator = makeClassDecorator<ControllerOption>();

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
export function controller(opt: ControllerOption) {
  return controllerDecorator.wrap(() => {
    return opt;
  });
}
