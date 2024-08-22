# zenweb 控制器与路由

## 演示
### 简单使用

在 src/controller 目录下新建一个文件 simple.ts
```ts
import { Context, mapping } from 'zenweb';

export class Controller {
  @mapping()
  index(ctx: Context) { // 如果函数名称为 index 则路径名称为 /，否则路径名称默认为函数名称
    return 'Hello zenweb';
  }

  @mapping() // 不指定 path 参数则默认使用函数名称 /path2
  path2(ctx: Context) {
    return 'Hello path2';
  }

  @mapping({ path: '/p3' }) // 指定 path 值为 /p3
  path3(ctx: Context) {
    return 'Hello path3';
  }

  @mapping({ method: 'POST' }) // 指定请求方法
  post(ctx: Context) {
    return 'Hello post';
  }
}
```

:::tip 注意
控制器方法中 `return` 数据如果需要统一处理需要安装 `@zenweb/result@^3.5.0` 模块，否则 `return` 数据会被设置到 `ctx.body` 上
:::

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
  simple() {
    return 'simple';
  }
}

// 控制器中间件，作用与所有控制器方法上
@controller({
  middleware: actionLog,
})
export class Controller2 {
  @mapping()
  simple() {
    return 'simple';
  }
}
```

### 统一前缀
例如后台管理接口中需要统一添加 /admin 作为前缀，则可以这样使用

```ts file=src/controller/admin/_helper.ts
import { mapping, Middleware, RouterMethod, RouterPath } from 'zenweb';

/**
 * 管理员验证中间件
 */
export function adminRequired(): Middleware {
  return function (ctx, next) {
    if (!ctx.admin) {
      fail('没有权限');
    }
    return next();
  }
}

/**
 * 管理后台路径映射
 */
export function adminMapping(method?: RouterMethod, path?: RouterPath, ...middleware: Middleware[]) {
  return mapping({
    method,
    prefix: '/admin',
    path,
    middleware: [adminRequired(), ...middleware],
  });
}
```

```ts file=src/controller/admin/index.ts
import { Context, Next, mapping, controller } from 'zenweb';
import { adminMapping } from './_helper';

export class IndexController {
  // 等同于 @mapping({ path: '/admin/', method: 'GET', middleware: [adminRequired()] })
  @adminMapping()
  index() {
    return 'admin index';
  }

  // 等同于 @mapping({ path: '/admin/create_user', method: 'POST', middleware: [adminRequired()] })
  @adminMapping('POST')
  create_user() {
    return 'create user';
  }
}
```
