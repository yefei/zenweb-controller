import { Core } from '@zenweb/core';
import modInject from '@zenweb/inject';
import modRouter from '@zenweb/router';
import modController from '../src';

const app = new Core();
app.setup(modInject());
app.setup(modRouter());
app.setup(modController());
app.start();
