import { Context, Middleware } from '@zenweb/core';
import { init, inject, scope } from '@zenweb/inject';
import { controller, mapping } from '../../../src';

function actionLog(): Middleware {
  return function (ctx, next) {
    console.log('actionLog middleware')
    return next();
  }
}

function loginRequired(): Middleware {
  return function (ctx, next) {
    console.log('loginRequired middleware')
    return next();
  }
}

// 控制器全局中间件
@controller({
  prefix: '/prefix',
  middleware: actionLog(),
})
export class Simple {
  // 自动注入
  @inject
  ctx: Context;

  @init // 控制器每次被请求时候都会执行
  init(ctx: Context) {
    console.log('init:', ctx.path);
  }

  @mapping()
  index() {
    return 'index';
  }

  // 映射一个路径， 不指定参数默认为 `GET /方法名`
  @mapping()
  simple() {
    return 'simple';
  }

  // 每个方法都可以自定义中间件
  @mapping({
    method: ['POST', 'GET'],
    path: ['/aaa', '/bbb'],
    middleware: loginRequired(),
  })
  aaa() {
    return 'aaa';
  }

  @mapping({ method: 'ALL' })
  all() {
    return 'any method';
  }
}

@scope('request')
export class RequestController {
  @mapping()
  req() {
    return 'req';
  }
}

@scope('singleton')
export class SingletonController {
  i = 0;

  @mapping()
  counter() {
    return this.i++;
  }
}
