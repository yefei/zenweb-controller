# Changelog

## [4.0.0] - 2024-9-5
- 更新 @zenweb/inject

## [3.17.0] - 2024-8-22
- 新增 autoControllerPrefix 选项，可以自动为控制器类添加路径前缀
- @mapping() 方法增加 { prefix } 参数。并给出使用场景

## [3.16.6] - 2024-1-3
- 去除 debug 依赖

## [3.16.3] - 2024-1-3
- 去除 peerDependencies

## [3.16.2] - 2024-1-2
- peerDependencies

## 3.16.1
- patterns 匹配 jsx,tsx

## 3.16.0
- 新增 patterns 选项

## 3.15.0
- 导出 mappingDecorator, controllerDecorator
- 统一方法 discoverControllerClass

## 3.14.0
- 主动调用 ctx.success 方法并等待处理，解决中间件无法取得返回结果问题

## 3.13.0
- 不再主动调用 ctx.success 方法
- 删除 Core.controllerRegister 改为使用注入依赖初始化

## 3.12.0
- 完善 Core.controllerRegister

## 3.11.0
- 新增 Core.controllerRegister

## 3.10.0
- discoverPaths 支持使用 "./" 开头的相对路径
- 增加 debug 信息

## 3.9.1
- null 检查

## 3.9.0
- 适配:
  - @zenweb/core: ^3.5.0
  - @zenweb/inject: ^3.18.0
  - @zenweb/result: ^3.0.0
