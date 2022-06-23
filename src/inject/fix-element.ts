import { InjectModule } from "./base";

const allowSchemes = ['http://', 'https://'];

export default class FixElement extends InjectModule {
  name = 'fix-element';

  init() {
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
  }
};

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