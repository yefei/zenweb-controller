# zenweb 控制器与路由

## 演示
### 简单使用

在 src/controller 目录下新建一个文件 simple.ts
```ts
import { Context, mapping } from 'zenweb';

export class Controller {
  @mapping()
  index(ctx: Context) { // 如果函数名称为 index 则路径名称为 /，否则路径名称默认为函数名称
    ctx.body = 'Hello zenweb';
  }

  @mapping() // 不指定 path 参数则默认使用函数名称 /path2
  path2(ctx: Context) {
    ctx.body = 'Hello path2';
  }

  @mapping({ path: '/p3' }) // 指定 path 值为 /p3
  path3(ctx: Context) {
    ctx.body = 'Hello path3';
  }

  @mapping({ method: 'POST' }) // 指定请求方法
  post(ctx: Context) {
    ctx.body = 'Hello post';
  }
}
```

### 使用中间件
```ts
import { Context, Next, mapping, controller } from 'zenweb';

// 定义一个中间件处理函数
function actionLog(ctx: Context, next: Next) {
  console.log('actionLog middleware')
  return next();
}

export class Controller {
  // 方法上的中间件
  @mapping({ middleware: actionLog })
  simple(ctx: Context) {
    ctx.body = 'simple';
  }
}

// 控制器中间件，作用与所有控制器方法上
@controller({
  middleware: actionLog,
})
export class Controller2 {
  @mapping()
  simple(ctx: Context) {
    ctx.body = 'simple';
  }
}
```

## Changelog

### 3.9.0
- 适配:
  - @zenweb/core: ^3.5.0
  - @zenweb/inject: ^3.18.0
  - @zenweb/result: ^3.0.0
