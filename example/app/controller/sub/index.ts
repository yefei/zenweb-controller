import { Mapping } from '../../../../src/index.js';

export class IndexController {
  @Mapping()
  index() {
    return 'sub-index'
  }

  @Mapping()
  list() {
    return 'sub-list'
  }
}
