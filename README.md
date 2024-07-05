# Async MDC

A lightweight, type-safe Mapped Diagnostic Context (MDC) implementation for Node.js applications using async hooks. This library provides a clean way to manage contextual data across asynchronous operations, making it perfect for request tracing, logging, and maintaining application state throughout the call chain.

## Features

- 🚀 **Zero Dependencies** - Built on Node.js native `AsyncLocalStorage`
- 🔒 **Type Safe** - Full TypeScript support with custom store interfaces
- 🛡️ **Safe Operations** - Both throwing and non-throwing variants for all operations
- 🔄 **Logger Integration** - Works seamlessly with Pino, Bunyan, Winston, and other loggers

## Install

```sh
$ npm i --save @bluegroundltd/async-mdc     # NPM
$ yarn add --save @bluegroundltd/async-mdc  # Yarn
$ bun add --save @bluegroundltd/async-mdc   # Bun
$ pnpm add --save @bluegroundltd/async-mdc  # PNPM
```

## Basic Usage

```typescript
// mdc.ts
import {MDC} from '@bluegroundltd/async-mdc';
export {MDC};

// You can define your own MDC store or use the default Record<string, any>
export interface MDCStore extends Record<string, unknown> {
  correlationId: string;
  user: {
    userId: string;
    email: string;
  };
  ip: string;
  meta?: {
    foo?: string;
    bar?: string;
  };
}

export const mdc = new MDC<MDCStore>();

// middleware.ts
import {mdc} from 'mdc.js';
app.get((req, res, next) => {
  mdc.set('user', req.session.user);
  next();
});

// service.ts
function foo() {
  // access user
  const user = mdc.safeGet('user');
}
```

## API

### new MDC([storage]): MDC

```typescript
import {MDC} from '@bluegroundltd/async-mdc';
export {MDC};

// You can define your own MDC store or use the default Record<string, any>
export interface MDCStore extends Record<string, unknown> {
  color: string;
  height?: number;
}

const mdc = new MDC<MDCStore>();

// or define your own storage
const asl = new AsyncLocalStorage<MDCStore>();
const mdc = new MDC<MDCStore>(asl);
```

### get(key, [defaultValue])

Get the value associated with `key`.

`get` throws if the underlying [AsyncLocalStorage](https://nodejs.org/api/async_context.html#class-asynclocalstorage) is not initialized

```typescript
mdc.get('color');
mdc.get('color', 'black');
```

### safeGet(key, [defaultValue])

Get the value associated with `key`.

`safeGet` never throws and returns `undefined` or `defaultValue` if given instead

```typescript
mdc.safeGet('color');
mdc.safeGet('color', 'black');
```

### set(key, value)

Adds or updates an entry in this mdc with a specified key and a value.

`set` throws if the underlying [AsyncLocalStorage](https://nodejs.org/api/async_context.html#class-asynclocalstorage) is not initialized

```typescript
mdc.set('color', 'white');
```

### safeSet(key, value)

Adds or updates an entry in this mdc with a specified key and a value.

`safeSet` never throws and behaves as a noop instead

```typescript
mdc.safeSet('color', 'white');
```

### getCopyOfStore(): Store

`getCopyOfStore` returns a shallow copy of the async context's store

```typescript
mdc.getCopyOfStore();
```

### clear()

Clears the store by removing all of its keys

```typescript
mdc.clear();
```

### run<R>(store: Store, callback: () => R, ...args): R

Delegates to the underlying [asyncLocalStorage.run](https://nodejs.org/api/async_context.html#asynclocalstoragerunstore-callback-args)

## Usage with loggers

### Pino

https://github.com/pinojs/pino

```typescript
// logger.ts
import {pino} from 'pino';
import {MDC} from '@bluegroundltd/async-mdc';

// Import from another module e.g. mdc.js
import {mdc} from 'mdc.js';
// Or create and export from here
export const mdc = new MDC();

// Enrich every log message with bindings from the MDC store
// @see {@link https://github.com/pinojs/pino/blob/main/docs/api.md#mixin-function}
function mixin() {
  return mdc.getCopyOfStore();
}

export const logger = pino({
  mixin
});
```

### Bunyan

https://github.com/trentm/node-bunyan

```typescript
// logger.ts
import bunyan from 'bunyan';
import {MDC} from '@bluegroundltd/async-mdc';

// Import from another module e.g. mdc.js
import {mdc} from 'mdc.js';
// Or create and export from here
export const mdc = new MDC();

const logger = bunyan.createLogger({
  name: 'myapp',
  mdc,
  serializers: {
    ...bunyan.stdSerializers,
    mdc(_mdc) {
      return _mdc.getCopyOfStore();
    }
  }
});
```

### Winston 3.x

https://github.com/winstonjs/winston

```typescript
// logger.ts
import winston from 'winston';
import {MDC} from '@bluegroundltd/async-mdc';

// Import from another module e.g. mdc.js
import {mdc} from 'mdc.js';
// Or create and export from here
export const mdc = new MDC();

const mdcFormat = winston.format((info, opts) => {
  return {
    ...mdc.getCopyOfStore(),
    ...info
  };
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.json(), mdcFormat)
});
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

**Copyright © 2025 Blueground Ltd. All rights reserved.**
