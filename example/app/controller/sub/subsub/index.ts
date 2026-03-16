import { mapping } from '../../../../../src/index.js';

export class IndexController {

  @mapping()
  list() {
    return 'subsub-list'
  }
}
