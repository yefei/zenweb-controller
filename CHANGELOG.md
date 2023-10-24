# Changelog

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
