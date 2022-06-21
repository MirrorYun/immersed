// 实现计划
// - [ ] 1. Cookie, LocalStorage 隔离
// - [ ] 2. dom 链接替换
// - [ ] 3. location 替换
// - [ ] 4. 其他 API 模拟
// - [ ] n. SessionStorage, IndexedDB, WebSQL, WebWorker, ServiceWorker, CacheStorage

console.log('Hello World');

delete Object.getPrototypeOf(window.navigator).serviceWorker;

Object.defineProperty(window.document, 'domain', {
  set() {}
});

const allowSchemes = ['http://', 'https://'];
const checkNode = (node: HTMLElement)=> {
  const local = `${location.protocol}//${location.host}`;

  function pageURL(url: string) {
    const _url = new URL(url);
    return `${local}/page/${_url.protocol.slice(0, -1)}/${_url.host}${_url.pathname}${_url.search}`;
  }

  function needProxy(url: string): boolean {
    if(url.indexOf('://') != -1 && !allowSchemes.some(i=>url.startsWith(i))) return false;
    if(url.startsWith(local)) return false;
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