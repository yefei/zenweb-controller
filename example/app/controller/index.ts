import { Context, Middleware } from '@zenweb/core';
import { component, init } from '@zenweb/inject';
import { controller, mapping } from '../../../src/index.js';

function actionLog(): Middleware {
  return async function (ctx, next) {
    await next();
    console.log('actionLog middleware')
    console.log('status:', ctx.status);
    console.log('success:', ctx.success);
    console.log('body:', ctx.body);
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
  constructor(
    private ctx: Context,
  ) {}

  @init // 控制器每次被请求时候都会执行
  init(ctx: Context) {
    console.log('init:', ctx.path);
  }

  @mapping()
  index() {
    console.log('index')
    return 'index:' + this.ctx.ip;
  }

  // 映射一个路径， 不指定参数默认为 `GET /方法名`
  @mapping()
  @mapping({ path: '/s2' })
  simple() {
    console.log('simple')
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

@component('request')
export class RequestController {
  @mapping()
  req() {
    return 'req';
  }
}

@controller({ prefix: '/singleton' })
@component('singleton')
export class SingletonController {
  i = 0;

  @mapping()
  counter() {
    return this.i++;
  }
}
