/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

enum PROXY_MODE {
  REWRITE,
  API_FUNCTION
}

const proxyWhiteList = [
  "/inject.ts",
  "/inject.js",
]

async function proxy(mode: PROXY_MODE, req: Request, client: Client): Promise<Response> {
  const clientURL = client.url.match("^((?:http|https):)//([^/]+)/page/(http|https)/([^/]+)(/.*)$");
  if(!clientURL) return await fetch(req);
  let [scheme, host, proxyScheme, proxyHost, proxyPath] = clientURL.slice(1);
  proxyScheme += ":";

  const requestURL = new URL(req.url);
  
  // 使用白名单机制处理相对路径引用
  if(requestURL.host === host) {
    if(proxyWhiteList.includes(requestURL.pathname)) return await fetch(req);
    
    if(!requestURL.pathname.startsWith('/_immersed_')) {
      requestURL.port = '';
      requestURL.host = proxyHost;
      requestURL.protocol = proxyScheme;
    }
  }
  
  let uri = `/${requestURL.protocol.slice(0, -1)}/${requestURL.host}${requestURL.pathname}${requestURL.search}`;

  // 使用 Vercel 的 rewrite 转发请求，缺点是无法伪装 referer，所以这里使用 no-referrer 策略
  if(mode === PROXY_MODE.REWRITE) {
    return await fetch('/_immersed_rewrite' + uri, new Request(req, {
      referrerPolicy: 'no-referrer',
      mode: 'same-origin'
    }));
  }

  if(mode === PROXY_MODE.API_FUNCTION) {
    let url = '/_immersed_proxy' + uri;
    // 避免 CSS 引用导致的嵌套代理，如：http://localhost/_immersed_proxy/http/localhost/_immersed_proxy/xxx.jpg
    if(requestURL.host === host && requestURL.pathname.startsWith('/_immersed_proxy')) {
      url = requestURL.pathname;
    }

    const headers = new Headers(req.headers);
    
    // 修正 referer
    if(req.referrer) {
      const refererURL = new URL(req.referrer);
      
      if(refererURL.host === host) {
        refererURL.port = '';
        refererURL.protocol = proxyScheme;
        refererURL.host = proxyHost;

        if(refererURL.pathname.startsWith('/_immersed_')) {
          function getPosition(string: string, subString: string, index: number) {
            return string.split(subString, index).join(subString).length;
          }

          refererURL.pathname = refererURL.pathname.slice(getPosition(refererURL.pathname, '/', 4));
        }

        if(req.referrer === client.url) {
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

self.addEventListener('message', console.debug);
self.addEventListener('install', console.debug);
self.addEventListener('fetch', e=> {
  const allowSchemes = ['http://', 'https://'];
  if(!allowSchemes.some(i=>e.request.url.startsWith(i))) return;

  e.respondWith((async ()=>{
    let client = await self.clients.get(e.clientId);
    if(!client?.url) return await fetch(e.request);
    
    return await proxy(PROXY_MODE.API_FUNCTION, e.request, client);
  })())
});

export type {}