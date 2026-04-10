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
 *   \@Mapping(opt?) someMethod(ctx: Context) {}
 * }
 * ```
 * 
 * #### 在 JavaScript 中使用
 * ```js
 * class Target {
 *   someMethod(ctx) {}
 * }
 * Mapping(opt?)(Target.prototype, 'someMethod', [Context]);
 * ```
 */
export function Mapping({
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

/**
 * 简单路由映射方法
 * 
 * 大部分情况下较为常用，提供给下方常见方法
 * 
 * @param method 方法
 * @param path 路径或中间件
 * @param middleware 中间件
 */
function SimpleMapping(method?: RouterMethod, path?: RouterPath | Middleware, ...middleware: Middleware[]) {
  if (typeof path === 'function') {
    middleware.unshift(path);
    path = undefined;
  }
  return Mapping({ method: 'GET', path, middleware });
}

/**
 * GET 请求方法路由映射
 * @param path 路径或中间件
 * @param middleware 中间件
 */
export function Get(path_or_middleware?: RouterPath | Middleware, ...middleware: Middleware[]) {
  return SimpleMapping('GET', path_or_middleware, ...middleware);
}

/**
 * POST 请求方法路由映射
 * @param path 路径或中间件
 * @param middleware 其他中间件
 */
export function Post(path_or_middleware?: RouterPath | Middleware, ...middleware: Middleware[]) {
  return SimpleMapping('POST', path_or_middleware, ...middleware);
}

/**
 * PUT 请求方法路由映射
 * @param path 路径或中间件
 * @param middleware 其他中间件
 */
export function Put(path_or_middleware?: RouterPath | Middleware, ...middleware: Middleware[]) {
  return SimpleMapping('PUT', path_or_middleware, ...middleware);
}

/**
 * PATCH 请求方法路由映射
 * @param path 路径或中间件
 * @param middleware 其他中间件
 */
export function Patch(path_or_middleware?: RouterPath | Middleware, ...middleware: Middleware[]) {
  return SimpleMapping('PATCH', path_or_middleware, ...middleware);
}

/**
 * DELETE 请求方法路由映射
 * @param path 路径或中间件
 * @param middleware 其他中间件
 */
export function Delete(path_or_middleware?: RouterPath | Middleware, ...middleware: Middleware[]) {
  return SimpleMapping('DELETE', path_or_middleware, ...middleware);
}

/**
 * 任何请求方法路由映射
 * @param path 路径或中间件
 * @param middleware 其他中间件
 */
export function All(path_or_middleware?: RouterPath | Middleware, ...middleware: Middleware[]) {
  return SimpleMapping('ALL', path_or_middleware, ...middleware);
}

export const controllerDecorator = makeClassDecorator<ControllerOption>();

/**
 * 控制器选项
 * 
 * #### 在 TypeScript 中使用
 * ```ts
 * \@Controller(opt?)
 * class Target {
 * }
 * ```
 * 
 * #### 在 JavaScript 中使用
 * ```js
 * class Target {
 * }
 * Controller(opt?)(Target);
 * ```
 */
export function Controller(opt: ControllerOption) {
  return controllerDecorator.wrap(() => {
    return opt;
  });
}
