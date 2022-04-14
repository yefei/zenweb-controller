import { Router, RouterPath } from "@zenweb/router";
import { Controller, ControllerClass } from "./controller";

export class CrudController extends Controller {
  /**
   * GET 请求 - 获取
   */
  get?(): void | Promise<void>;

  /**
   * POST 请求 - 创建
   */
  post?(): void | Promise<void>;

  /**
   * PATCH 请求 - 更新
   */
  patch?(): void | Promise<void>;

  /**
   * DELETE 请求 - 删除
   */
  delete?(): void | Promise<void>;
}

/**
 * CRUD 控制器注解
 * @param router 路由对象
 * @param path 路径
 */
export function crudController<C extends CrudController>(router: Router, path: RouterPath, ...middleware: Router.Middleware[]) {
  return function (controllerClass: ControllerClass<C>) {
    function reg(method: 'get' | 'post' | 'patch' | 'delete') {
      router[method](path, ...(middleware || []), async ctx => {
        const controller = await ctx.injector.getInstance(controllerClass);
        await controller[method]();
      });
    }
    for (const method of Object.getOwnPropertyNames(controllerClass.prototype)) {
      if (['get', 'post', 'patch', 'delete'].includes(method)) {
        reg(<any>method);
      }
    }
  }
}
