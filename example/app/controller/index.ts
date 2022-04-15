import { Next } from 'koa';
import { Context, init, inject } from '@zenweb/inject';
import { controller, mapping } from '../../../src';

function actionLog(ctx: Context, next: Next) {
  console.log('actionLog middleware')
  return next();
}

function loginRequired(ctx: Context, next: Next) {
  console.log('loginRequired middleware')
  return next();
}

// 控制器全局中间件
@controller(actionLog)
export class Simpe {
  // 自动注入
  @inject
  ctx: Context;

  @init // 控制器每次被请求时候都会执行
  init(ctx: Context) {
    console.log('init:', ctx.path);
  }

  // 映射一个路径， 不指定参数默认为 `GET /方法名`
  @mapping()
  simple(ctx: Context) {
    ctx.body = 'simple';
  }

  // 每个方法都可以自定义中间件
  @mapping({
    method: ['POST', 'GET'],
    path: ['/aaa', '/bbb'],
    middleware: loginRequired,
  })
  aaa() {
    this.ctx.body = 'aaa';
  }
}
