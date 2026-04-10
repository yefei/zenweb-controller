import React from 'react';
import { Mapping } from '../../../src/index.js';

function alert(s: string) {}

export class XXX {
  @Mapping({ path: '/jsx' })
  index() {
    const btn = <div id="ddd" onClick={() => alert('Hello')} style={{ backgroundColor: 'red' }}>
      <button>Hello</button>
    </div>;
    console.log({btn})
    return btn;
  }
}
