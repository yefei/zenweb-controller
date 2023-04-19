/// <reference types="@zenweb/result" />
import { Context } from '@zenweb/core';
import { scope } from '@zenweb/inject';
import { Router } from '@zenweb/router';
import { controllerDecorator, mappingDecorator } from './controller';
import { ControllerClass, ControllerItem } from './types';
import { debug } from './utils';

/**
 * 取得控制器路由对象
 */
export function getControllerRouter({ option, middlewares, mappingList, target }: ControllerItem) {
  debug('@controller(%o) %o', option, target);
  const router = new Router(option);
  if (middlewares && middlewares.length > 0) {
    router.use(...middlewares);
  }
  for (const item of mappingList) {
    debug('@mapping(%o)', item);
    const mappingMiddlewares = [
      ...item.middleware,
      async (ctx: Context) => {
        const controller = await ctx.injector.getInstance(target);
        const data = await ctx.injector.apply(controller, item);
        if (typeof data !== 'undefined') {
          if (ctx.success) {
            await ctx.success(data);
          } else {
            ctx.body = data;
          }
        }
      },
    ];
    if (item.methods.includes('ALL')) {
      router.all(item.path, ...mappingMiddlewares);
    } else {
      // <any>item.path 实际上路由参数支持数组形式，只是 ts 文件没有正确描述
      router.register(<any>item.path, item.methods, mappingMiddlewares);
    }
  }
  return router;
}

/**
 * 控制器注册器
 */
@scope('singleton')
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
   * @returns
   *  - true 注册成功
   *  - false 无效控制器
   */
  registerClass(target: ControllerClass) {
    debug('registerClass(%o)', target);
    const mappingList = mappingDecorator.getMethods(target.prototype);
    if (mappingList.length > 0) {
      scope('prototype', false)(target);
      const option = controllerDecorator.getValue(target);
      const controllerItem: ControllerItem = {
        target,
        option,
        mappingList,
      };
      if (option && option.middleware) {
        controllerItem.middlewares = (Array.isArray(option.middleware) ? option.middleware : [option.middleware]);
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
      router.use(getControllerRouter(item).routes());
    }
  }
}
