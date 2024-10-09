import { Context } from '@zenweb/core';
import { controller, mapping } from '../../../../src/index.js';

export class SubTestController {
  @mapping()
  index() {
    return 'sub/index';
  }
}

@controller({
  prefix: 'sub2', // 注意这里 sub2 没有 / 前缀，会在注册时候自动加上文件路径前缀
})
export class SubTest2Controller {
  @mapping()
  index() {
    return 'sub2/index';
  }

  @mapping()
  'sub3/:id'(ctx: Context) {
    return 'sub3/' + ctx.params.id;
  }
}
