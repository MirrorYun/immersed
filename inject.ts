// 实现计划
// - [ ] 1. Cookie, LocalStorage, History 隔离
// - [ ] 2. dom 链接替换
// - [ ] 3. location 替换
// - [ ] 4. 其他 API 模拟
// - [ ] n. SessionStorage, IndexedDB, WebSQL, WebWorker, ServiceWorker, CacheStorage

console.log('[Inject] Initing...');
if(!navigator.serviceWorker.controller) {
  console.warn('[Inject] No Service Worker');
  location.href = `/init?from=inject&uri=` + encodeURIComponent(`${location.pathname}${location.search}`);
}

const serviceWorker = window.navigator.serviceWorker.controller!;
serviceWorker.postMessage({
  type: 'register',
  url: location.href,
});

delete Object.getPrototypeOf(window.navigator).serviceWorker;

Object.defineProperty(window.document, 'domain', {
  set() {}
});

// Object.defineProperty(window, 'history', {
//   get() {},
//   set() {}
// });

const allowSchemes = ['http://', 'https://'];
const checkNode = (node: HTMLElement)=> {
  function pageURL(url: string) {
    if(url.startsWith('//')) url = window.location.protocol + url;
    const _url = new URL(url);
    return `${location.protocol}//${location.host}${__PAGE_URI__}/${_url.protocol.slice(0, -1)}/${_url.host}${_url.pathname}${_url.search}`;
  }

  function needProxy(url: string): boolean {
    if(new RegExp(`^(${location.protocol})?//${location.host}\\b`).test(url)) return false;
    if(!allowSchemes.some(i=>url.startsWith(i))) return false;
    if(!/^\w*:?\/\/\b/.test(url)) return false;
    return true;
  }

  if(node instanceof HTMLIFrameElement && needProxy(node.src)) {
    node.src = pageURL(node.src);
  }

  if(node instanceof HTMLAnchorElement && needProxy(node.href)) {
    node.href = pageURL(node.href);
  }
}

const observer = new MutationObserver(mutations => {
  for(const mutation of mutations) {
    if(mutation.type === 'attributes' && mutation.target.nodeType === Node.ELEMENT_NODE) {
      checkNode(mutation.target as HTMLElement);
    }

    if(mutation.type === 'childList') {
      for (const node of mutation.addedNodes) {
        if(mutation.target.nodeType !== Node.ELEMENT_NODE) continue;
        checkNode(node as HTMLElement)
      }
    }
  }
});
observer.observe(document.documentElement, { attributes: true, childList: true, subtree: true });

export type {}