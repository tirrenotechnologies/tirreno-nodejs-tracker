import express from 'express';
import session from 'express-session';

import tracker from 'node-tracker/express';

// NOTE: __dirname backports for node.js < 24, for node.js >= 24 use import.meta.dirname
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.set('view engine', 'hbs');
app.use('/static', express.static(join(__dirname, 'public')));

app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
  }),
);

app.use(function (req, res, next) {
  if (!req.session.user) {
    req.session.user = { username: 'usrnm', email: 'example@example.com' };
  }

  next();
});

app.use(
  tracker({
    url: process.env.TRACKER_URL || 'https://example.com',
    key: process.env.TRACKER_KEY,

    settings: {
      //   populated: true,
      fields: ['emailAddress'],
      mapper: {
        from: 'session.user',
        fields: {
          userName: 'username',
          emailAddress: 'email',
        },
      },
    },
  }),
);

app.all('/', (req, res) => {
  const checkResponse =
    req.query?.check === 'true'
      ? {
          headers: req.headers,
          status: res.statusCode,
          url: process.env.TRACKER_URL,
          ok: true,
        }
      : false;
  // NOTE: overwrite any event field, for example here for `userName`
  req.tracker.userName = 'setUsrn';

  res.render('index', {
    session: req.session.user,
    isAbout: false,
    checkResponse,
  });
});

app.get('/about', (_req, res) => {
  res.render('index', { isAbout: true });
});

app.listen(3001, () => {
  console.info('🚀 test express.js app is running and available on port 3001');
  console.info('');
});
