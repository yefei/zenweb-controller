import { Next } from 'koa';
import { Context, init, inject } from '@zenweb/inject';
import { Router } from '@zenweb/router';
import { controller, CrudController, crudController, mapping } from '../../../src';
export const router = new Router();

router.get('/', ctx => {
  ctx.body = {
    hello: 'world',
    time: Date.now(),
  };
});

router.get('/err', ctx => {
  throw new Error('E!!');
});

function actionLog(ctx: Context, next: Next) {
  console.log('actionLog middleware')
  return next();
}

function loginRequired(ctx: Context, next: Next) {
  console.log('loginRequired middleware')
  return next();
}

// 控制器全局中间件
@controller(router, actionLog)
class Simpe {
  // 自动注入
  @inject
  ctx: Context;

  @init // 控制器每次被请求时候都会执行
  init() {
    console.log('init');
  }

  // 映射一个路径， 不指定参数默认为 `GET /方法名`
  @mapping()
  simple() {
    this.ctx.body = 'simple';
  }

  // 每个方法都可以自定义中间件
  @mapping('get', '/aaa', loginRequired)
  aaa() {
    this.ctx.body = 'aaa';
  }
}

@crudController(router, '/crud')
class CrudTest extends CrudController {
  @init // 控制器每次被请求时候都会执行
  init() {
    console.log('init');
  }

  get() {
    this.ctx.body = 'get';
  }

  post() {
    this.ctx.body = 'post';
  }
}
