import { Context, Middleware } from '@zenweb/core';
import { Component, Init } from '@zenweb/inject';
import { All, Controller, Get, Mapping } from '../../../src/index.js';

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
@Controller({
  prefix: '/prefix',
  middleware: actionLog(),
})
export class Simple {
  // 自动注入
  constructor(
    private ctx: Context,
  ) {}

  @Init // 控制器每次被请求时候都会执行
  init(ctx: Context) {
    console.log('init:', ctx.path);
  }

  @Get()
  index() {
    console.log('index')
    return 'index:' + this.ctx.ip;
  }

  // 映射一个路径， 不指定参数默认为 `GET /方法名`
  @Get()
  @Get('/s2')
  simple() {
    console.log('simple')
    return 'simple';
  }

  // 每个方法都可以自定义中间件
  @Mapping({
    method: ['POST', 'GET'],
    path: ['/aaa', '/bbb'],
    middleware: loginRequired(),
  })
  aaa() {
    return 'aaa';
  }

  @All()
  all() {
    return 'any method';
  }
}

@Component('request')
export class RequestController {
  @Get()
  req() {
    return 'req';
  }
}

@Controller({ prefix: '/singleton' })
@Component('singleton')
export class SingletonController {
  i = 0;

  @Get()
  index() {
    return this.i++;
  }
}
