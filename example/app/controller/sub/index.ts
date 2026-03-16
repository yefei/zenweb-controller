import { mapping } from '../../../../src/index.js';

export class IndexController {
  @mapping()
  index() {
    return 'sub-index'
  }

  @mapping()
  list() {
    return 'sub-list'
  }
}
