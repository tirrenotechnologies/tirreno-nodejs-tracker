import Koa from 'koa';
import Router from '@koa/router';

import mount from 'koa-mount';
import session from 'koa-session';
import serve from 'koa-static';

import views from '@ladjs/koa-views';

import tracker from 'node-tracker/koa';

// NOTE: __dirname backports for node.js < 24, for node.js >= 24 use import.meta.dirname
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = new Koa();
const router = new Router();
const render = views(join(__dirname, 'views'), { map: { hbs: 'handlebars' } });

app.keys = ['session_key'];
app.context.render = render();

router.all('/', (ctx) => {
  return ctx.render('index.hbs');
});

app.use(session(app));
app.use(mount('/static', serve(join(__dirname, 'public'))));
app.use(router.routes()).use(router.allowedMethods());

app.use(
  tracker({
    url: process.env.TRACKER_URL || 'https://example.com',
    key: process.env.TRACKER_KEY,
  }),
);

// app.use(router.routes()).use(router.allowedMethods());

app.listen(3003, () => {
  console.info('🚀 test koa.js app is running and available on port 3003');
  console.info('');
});
