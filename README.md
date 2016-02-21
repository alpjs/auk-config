# auk-config

```js
import packageConfig from './package.json';
import Koa from 'koa';
import config from 'auk-config';

const app = new Koa();
config(__dirname + '/config', { packageConfig })(app);
```
