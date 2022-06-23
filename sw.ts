/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

enum PROXY_MODE {
  /**
   * Forward requests using the "rewrite" rule in vercel.json
   * It's faster than the API function, but headers cannot be changed, so some sites may not work correctly.
   */
  REWRITE,
  API_FUNCTION
}

const proxyWhiteList = [
  '^/inject.js$',
]


const clientURLMap = new Map<string, string>();

function join(...args: string[]): string {
  return '/' + args.map(i=>i.replace(/^\/|\/$/g, '')).filter(i=>i).join('/');
}

async function proxy(mode: PROXY_MODE, req: Request, clientURL: string): Promise<Response> {
  const regex = clientURL.match(`^((?:http|https):)//([^/]+)${__PAGE_URI__}/(http|https)/([^/]+)(/[^?]*)(\\?.*)?$`);
  if(!regex) return await fetch(req);
  let [scheme, host, proxyScheme, proxyHost, proxyPath, proxySearch] = regex.slice(1);
  proxyScheme += ":";

  const requestURL = new URL(req.url);
  
  // Handle base path references with whitelist
  if(requestURL.host === host && requestURL.protocol === scheme) {
    if(proxyWhiteList.some(i=>new RegExp(i).test(requestURL.pathname))) return await fetch(req);

    // For example, current page is http://localhost/https/example.com/abc/xxx,
    // a script want to request relative url "def", that is: http://localhost/https/example.com/abc/def.
    // In this case, we need to change the request URL to: http://localhost/abc/def
    let baseURL = clientURL.slice(0, clientURL.lastIndexOf("/")) + '/';
    if(req.url.startsWith(baseURL)) {
      requestURL.pathname = join(proxyPath, req.url.slice(baseURL.length));
      console.debug('[SW] base URL:', baseURL, ', request URL:', req.url);
    }

    // Then, change the request URL to: https://example.com/abc/def
    if(!requestURL.pathname.startsWith('/_immersed_')) {
      requestURL.port = '';
      requestURL.host = proxyHost;
      requestURL.protocol = proxyScheme;
    }
  }
  
  let uri = `/${requestURL.protocol.slice(0, -1)}/${requestURL.host}${requestURL.pathname}${requestURL.search}`;

  // using no-referrer strategy here
  if(mode === PROXY_MODE.REWRITE) {
    return await fetch('/_immersed_rewrite' + uri, new Request(req, {
      referrerPolicy: 'no-referrer',
      mode: 'same-origin'
    }));
  }

  if(mode === PROXY_MODE.API_FUNCTION) {
    let url = __PROXY_URI__ + uri;
    // Avoid nested proxies caused by CSS references, like: http://localhost/_immersed_proxy/http/localhost/_immersed_proxy/xxx.jpg
    if(requestURL.host === host && requestURL.pathname.startsWith(__PROXY_URI__)) {
      url = requestURL.pathname;
    }

    const headers = new Headers(req.headers);
    
    // Fix referer
    if(req.referrer) {
      const refererURL = new URL(req.referrer);
      
      if(refererURL.host === host) {
        refererURL.port = '';
        refererURL.protocol = proxyScheme;
        refererURL.host = proxyHost;

        if(refererURL.pathname.startsWith(__PROXY_URI__)) {
          refererURL.pathname = refererURL.pathname.slice(__PROXY_URI__.length);
          refererURL.pathname = refererURL.pathname.slice(refererURL.pathname.indexOf('/', 1));
          refererURL.pathname = refererURL.pathname.slice(refererURL.pathname.indexOf('/', 1));
        }

        if(req.referrer === clientURL) {
          refererURL.pathname = proxyPath;
        }
        
        headers.set('x-immersed-referer', refererURL.toString());
      }
    }

    let data = await req.arrayBuffer();
    return await fetch(new Request(url, req), {
      headers,
      mode: 'same-origin',
      body: data.byteLength ? data : undefined
    });
  }
  
  return await fetch(req);
}

self.addEventListener('message', e => {
  if(!(e.source instanceof WindowClient)) return;
  if(e.data.type === 'register') {
    clientURLMap.set(e.source.id, e.data.url);
  }
});

self.addEventListener('install', e=>e.waitUntil(self.skipWaiting()));
self.addEventListener('fetch', e=> {
  const allowSchemes = ['http://', 'https://'];
  if(!allowSchemes.some(i=>e.request.url.startsWith(i))) return;

  let clientURL = clientURLMap.get(e.clientId);

  e.respondWith((async ()=>{
    if(!clientURL) {
      clientURL = (await self.clients.get(e.clientId))?.url;
      if(!clientURL) return await fetch(e.request);
    }
    
    return await proxy(PROXY_MODE.API_FUNCTION, e.request, clientURL);
  })())
});

export type {}