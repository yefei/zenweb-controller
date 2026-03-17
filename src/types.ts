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
export interface ControllerOption {
  /**
   * 在控制器中的每个 \@mapping path 上添加前缀
   */
  prefix?: string;

  /**
   * 在控制器中的每个 \@mapping 上添加前置中间件
   */
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
  option: ControllerOption;

  /**
   * 控制器路由映射列表
   */
  mappingList: MappingItem[];
}

/**
 * 控制器安装选项
 */
export interface ControllerSetupOption {
  /**
   * 发现目录
   */
  discoverPaths?: string[];

  /**
   * 文件匹配规则
   * @default '**\/*.{js,ts,jsx,tsx}'
   */
  patterns?: string | string[];

  /**
   * 是否自动添加控制器前缀
   * - 自动前缀是根据路径名自动生成的
   * - 如果文件名使用 index 则自动忽略
   * - 如果 \@controller({ prefix: '/somepath' }) 前缀为 '/' 也会忽略
   * @default false
   */
  autoControllerPrefix?: boolean;
}
