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

### 自动路径映射规则

如果开启 `autoControllerPrefix` 功能，则会自动为控制器方法添加路径前缀，等同于自动给控制器类添加 `@controller({ prefix })` 选项

#### 文件名规则

控制器扫描目录为 `src/controller` 下的文件结构

| 文件名 | 映射路径 | 说明 |
| --- | --- | --- |
| index.ts | / | index 名称为特殊名称，代表首页，所以默认为根路径 `/` |
| user.ts | /user | 非 index 文件名都会被映射为路径名 |
| user/index.ts | /user | 同理即使是子目录下面的 index 文件名会当成子目录的根路径处理 |
| user/profile.ts | /user/profile | 子目录下面的文件名会当成子目录的子路径处理 |

#### prefix 的处理规则

映射路径会自动修改控制器的 `prefix` 配置项，但是有如下几种特殊的处理规则：
1. `prefix` 值没有设置时直接使用自动路径值
2. 已经设置的 `prefix` 值如果开头为 `/`（例如: `prefix: '/admin'`）则不做任何处理（忽略）
3. 已经设置的 `prefix` 值没有使用 `/` 开头（例如: `prefix: 'admin'`），则会在原来已经设置的结果前添加自动路径值。例如自动路径为 `/manage/some` 控制器值 `prefix: 'admin'` 则会变为 `prefix: '/manage/some/admin'`

#### 控制器内方法映射规则

即使没有开启 `autoControllerPrefix` 功能也不会影响控制器内方法的映射规则

```ts
class SomeController {
  @mapping() // 默认映射路径为 /
  index() {}

  @mapping() // 默认映射路径为 /detail
  detail() {}

  @mapping() // 默认映射路径为 /detail_by_id
  detail_by_id() {}

  @mapping() // 默认映射路径为 /detail/:id
  'detail/:id'(ctx: Context) { return ctx.params.id }
}
```

### 使用技巧

#### 统一管理后台接口
例如后台管理接口中需要统一添加 /admin 作为前缀，并且需要验证管理员身份，则可以这样使用

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
 * 管理后台路径统一映射
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
