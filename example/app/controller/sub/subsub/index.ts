import { Mapping } from '../../../../../src/index.js';

export class IndexController {

  @Mapping()
  list() {
    return 'subsub-list'
  }
}
