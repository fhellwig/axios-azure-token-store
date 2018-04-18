# axios-azure-token-store

This module is for use by web applications that are secured using the [Azure App Service Authentication and Authorization](https://docs.microsoft.com/en-us/azure/app-service/app-service-authentication-overview) feature and make API calls using the [axios HTTP client](https://www.npmjs.com/package/axios). It obtains an access token from the [Azure App Service Token Store](https://cgillum.tech/2016/03/07/app-service-token-store/) and adds it as the bearer token to all axios requests. In addition, it can also be used as a [Vue.js](https://vuejs.org/) plugin (see the Vue.js Plugin section below).

## Installation

Install this package into your web application, making sure that it is part of your distribution using a tool such as [webpack](https://webpack.js.org/) or [brunch](https://brunch.io/).

```
npm install axios-azure-token-store
```

## Usage

The recommended approach is to create a new axios instance that handles all of your API requests. Then, use the `axios-azure-token-store` utility to add the interceptor as follows:

```javascript
import tokenStore from 'axios-azure-token-store';

const client = axios.create();

tokenStore.addInterceptor(client); // adds the axios interceptor
```

Now, for every request, the `Authorization` header is added with the access token obtained from the `/.auth/me` endpoint as the bearer token. The access token is refreshed if required by a call to the `/.auth/refresh` endpoint.

```javascript
client.get('/api/data'); // authentication is handled automatically
```

## Utility Methods

There are two utility methods, `getTokens()` and `getClaim(typ)`. Each of these returns a promise.

### getTokens()

Returns a promise resolved with the tokens returned from the `/.auth/me` endpoint. This is the same method that is called internally by the axios interceptor.

### getClaim(typ)

First calls `getTokens()` and then finds the claim having the specified `typ`. Returns a promise resolved with the claim's `val` property or `null` if no such claim is found. (It is assumed that the tokens returned from the `/.auth/me` endpoint has a `user_claims` property.)

## Vue.js Plugin

This module can also be used as a Vue.js plugin.

```javascript
import tokenStore from `axios-azure-token-store`;

Vue.use(tokenStore);
```

The token store instance is now available on the Vue instance.

```javascript
this.$tokenStore.getClaim('name').then(name => {
  console.log(name);
});
```

## License

MIT License

Copyright (c) 2018 Frank Hellwig

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
