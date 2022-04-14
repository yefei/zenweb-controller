import { Core } from '@zenweb/core';
import inject from '@zenweb/inject';
import router from '@zenweb/router';

const app = new Core();
app.setup(inject());
app.setup(router());
app.start();
