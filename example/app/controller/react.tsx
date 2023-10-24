import * as React from 'react';
import { mapping } from '../../../src';

function alert(s: string) {}

export class XXX {
  @mapping({ path: '/jsx' })
  index() {
    const btn = <div id="ddd" onClick={() => alert('Hello')} style={{ backgroundColor: 'red' }}>
      <button>Hello</button>
    </div>;
    console.log({btn})
    return btn;
  }
}
