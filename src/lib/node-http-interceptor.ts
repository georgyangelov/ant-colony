import http, { IncomingMessage, RequestOptions } from 'http';
import https from 'https';
import { EventEmitter } from 'eventemitter3';
// import { inherits } from 'util';
import { URL } from 'url';

// const OriginalClientRequest: any = http.ClientRequest;

function wrapClientRequest(
  config: RequestOptions,
  request: http.ClientRequest
) {
  const startedAtUnixMs = Date.now();

  request.on('response', response => {
    const responseTimeMs = Date.now() - startedAtUnixMs;

    NodeHTTPInterceptor.events.emit('response', {
      request: config,
      response,
      startedAtUnixMs,
      responseTimeMs
    });
  });
}

// function InterceptedClientRequest(this: any, ...args: any[]) {
//   const request: http.ClientRequest = OriginalClientRequest.apply(this, ...args);
//
//   wrapClientRequest(request);
//
//   return request;
// };
//
// inherits(InterceptedClientRequest, OriginalClientRequest);

export interface InterceptedResponse {
  request: RequestOptions;
  response: IncomingMessage;
  startedAtUnixMs: number;
  responseTimeMs: number;
}

export const NodeHTTPInterceptor = {
  intercepting: false,
  events: new EventEmitter<{
    response: [InterceptedResponse];
  }>(),

  hook() {
    const originalHttpRequest: any = http.request;
    (http as any).request = function request(
      this: any,
      url: any,
      options: any,
      callback: any
    ) {
      const clientRequest = originalHttpRequest.apply(this, [
        url,
        options,
        callback
      ]);

      if (NodeHTTPInterceptor.intercepting) {
        const { options: requestConfig } = normalizeOptions(
          url,
          options,
          callback
        );

        wrapClientRequest(requestConfig, clientRequest);
      }

      return clientRequest;
    };

    const originalHttpsRequest: any = https.request;
    (https as any).request = function request(
      this: any,
      url: any,
      options: any,
      callback: any
    ) {
      const clientRequest = originalHttpsRequest.apply(this, [
        url,
        options,
        callback
      ]);

      if (NodeHTTPInterceptor.intercepting) {
        const { options: requestConfig } = normalizeOptions(
          url,
          options,
          callback
        );

        wrapClientRequest(requestConfig, clientRequest);
      }

      return clientRequest;
    };
  },

  startIntercepting() {
    NodeHTTPInterceptor.intercepting = true;
  },

  stopIntercepting() {
    NodeHTTPInterceptor.intercepting = false;
    // (http as any).ClientRequest = OriginalClientRequest;
  }
};

function normalizeOptions(url: any, options: any, callback: any) {
  if (typeof url === 'string') {
    url = urlToOptions(new URL(url));
  } else if (url instanceof URL) {
    url = urlToOptions(url);
  } else {
    callback = options;
    options = url;
    url = null;
  }

  if (typeof options === 'function') {
    callback = options;
    options = url || {};
  } else {
    options = Object.assign(url || {}, options);
  }

  return { options, callback };
}

function urlToOptions(url: URL) {
  const options: http.RequestOptions = {
    protocol: url.protocol,
    hostname:
      typeof url.hostname === 'string' && url.hostname.startsWith('[')
        ? url.hostname.slice(1, -1)
        : url.hostname,
    // hash: url.hash,
    // search: url.search,
    // pathname: url.pathname,
    path: `${url.pathname}${url.search || ''}`
    // href: url.href,
  };

  if (url.port !== '') {
    options.port = Number(url.port);
  }

  if (url.username || url.password) {
    options.auth = `${url.username}:${url.password}`;
  }

  return options;
}
