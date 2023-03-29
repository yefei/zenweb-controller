import { RouterOptions } from '@koa/router';
import { Middleware } from '@zenweb/core';
import { RouterMethod, RouterPath } from '@zenweb/router';
import { MethodDescriptor } from 'decorator-make';

/**
 * 控制器类描述
 */
export interface ControllerClass {
  new (): object;
}

/**
 * 方法路由映射
 */
export interface MappingItem extends MethodDescriptor {
  methods: RouterMethod[];
  path: RouterPath;
  middleware: Middleware[];
}

/**
 * 控制器选项
 */
export interface ControllerOption extends RouterOptions {
  middleware?: Middleware | Middleware[];
}

/**
 * 控制器项
 */
export interface ControllerItem {
  /**
   * 控制器类
   */
  target: ControllerClass;

  /**
   * 控制器选项
   */
  option?: ControllerOption;

  /**
   * 控制器中间件
   */
  middlewares?: Middleware[];

  /**
   * 控制器路由映射列表
   */
  mappingList: MappingItem[];
}

/**
 * 控制器安装选项
 */
export interface ControllerSetupOption {
  discoverPaths?: string[];
}
