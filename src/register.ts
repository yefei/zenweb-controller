/// <reference types="@zenweb/result" />
import { Injectable } from '@zenweb/inject';
import { Router } from '@zenweb/router';
import { controllerDecorator, mappingDecorator } from './controller.js';
import { ControllerClass, ControllerItem } from './types.js';
import { debug } from './utils.js';

/**
 * 注册控制器路由
 */
export function registerControllerRouter(router: Router, { option, mappingList, target }: ControllerItem) {
  debug('@Controller(%o) %o', option, target);
  const controllerMiddlewares = option.middleware ? (Array.isArray(option.middleware) ? option.middleware : [option.middleware]) : [];
  for (const item of mappingList) {
    debug('@Mapping(%o)', item);
    router.register({
      prefix: option.prefix,
      path: item.path,
      method: item.methods,
      middleware: [
        ...controllerMiddlewares,
        ...item.middleware,
        async (ctx, next) => {
          const controller = await ctx.injector.getInstance(target);
          const data = await ctx.injector.apply(controller, item);
          if (typeof data !== 'undefined') {
            if (ctx.success) {
              await ctx.success(data);
            } else {
              ctx.body = data;
            }
          }
          return next();
        },
      ],
    });
  }
  return router;
}

/**
 * 控制器注册器
 */
@Injectable('singleton')
export class ControllerRegister {
  /**
   * 已注册的控制器类
   */
  public controllers: ControllerItem[] = [];

  /**
   * 注册控制器
   */
  register(controller: ControllerItem) {
    this.controllers.push(controller);
    return this;
  }

  /**
   * 注册控制器类
   * @param target 控制器类
   * @param prefix 路由前缀
   * @returns
   *  - true 注册成功
   *  - false 无效控制器
   */
  registerClass(target: ControllerClass, prefix?: string) {
    debug('registerClass(%o)', target);
    Injectable('request', false)(target);
    const mappingList = mappingDecorator.getMethods(target.prototype);
    if (mappingList.length > 0) {
      const option = controllerDecorator.getValue(target) || {};
      const controllerItem: ControllerItem = {
        target,
        option,
        mappingList,
      };
      if (prefix) {
        if (!prefix.startsWith('/')) {
          prefix = `/${prefix}`;
        }
        if (!option.prefix) {
          option.prefix = prefix;
        } else if (!option.prefix.startsWith('/')) {
          option.prefix = `${prefix}/${option.prefix}`;
        }
      }
      this.register(controllerItem);
      return true;
    } else {
      debug('ignore no mapping: %o', target);
    }
    return false;
  }

  /**
   * 添加所有控制器到路由中
   * @param router 目标路由
   */
  addToRouter(router: Router) {
    debug('addToRouter(%o)', router)
    for (const item of this.controllers) {
      registerControllerRouter(router, item);
    }
  }
}
