# auk-config

```js
import Koa from 'koa';
import config from 'auk-config';

const app = new Koa();
config(__dirname + '/config')(app);
```
