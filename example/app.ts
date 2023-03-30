import { Core } from '@zenweb/core';
import modInject from '@zenweb/inject';
import modRouter from '@zenweb/router';
import modResult from '@zenweb/result';
import messagecode from '@zenweb/messagecode';
import modController from '../src';

const app = new Core();
app.setup(modInject());
app.setup(modRouter());
app.setup(messagecode());
app.setup(modResult());
app.setup(modController());
app.start();
