import { Context } from '@zenweb/core';
import { Controller, Mapping } from '../../../../src/index.js';

export class SubTestController {
  @Mapping()
  index() {
    return 'sub/index';
  }
}

@Controller({
  prefix: 'sub2', // 注意这里 sub2 没有 / 前缀，会在注册时候自动加上文件路径前缀
})
export class SubTest2Controller {
  @Mapping()
  index() {
    return 'sub2/index';
  }

  @Mapping()
  'sub3/:id'(ctx: Context) {
    return 'sub3/' + ctx.params.id;
  }
}
