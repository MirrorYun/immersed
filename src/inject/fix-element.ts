import { InjectModule } from "./base";

const allowSchemes = ['http://', 'https://'];

export default class FixElement extends InjectModule {
  name = 'fix-element';

  private checkNode(node: HTMLElement) {
    const pageURL = (url: string)=> {
      const prefix = `${location.protocol}//${location.host}`;

      if(/^\w*:?\/\/\b/.test(url)) {
        if(url.startsWith('//')) url = location.protocol + url;
        const _url = new URL(url);
        return `${prefix}${__PAGE_URI__}/${_url.protocol.slice(0, -1)}/${_url.host}${_url.pathname}${_url.search}`;
      }

      if(url.startsWith('/')) {
        return `${prefix}${__PAGE_URI__}/${this._config.scheme}/${this._config.host}${url}`;
      }

      let baseURI = this._config.path;
      baseURI = baseURI.slice(0, baseURI.lastIndexOf('/'));
      return `${prefix}${__PAGE_URI__}/${this._config.scheme}/${this._config.host}${baseURI}/${url}`;
    }
  
    function needProxy(url: string): boolean {
      if(new RegExp(`^(${location.protocol})?//${location.host}\\b`).test(url)) return false;
      if(/^\w+:\/\/\b/.test(url) && !allowSchemes.some(i=>url.startsWith(i))) return false;
      return true;
    }
  
    if(node instanceof HTMLIFrameElement) {
      const url = node.getAttribute('src');
      if(url && needProxy(url)) node.setAttribute('src', pageURL(url));
    }
  
    if(node instanceof HTMLAnchorElement) {
      const url = node.getAttribute('href');
      if(url && needProxy(url)) node.setAttribute('href', pageURL(url));
    }
  }

  init() {
    const observer = new MutationObserver(mutations => {
      for(const mutation of mutations) {
        if(mutation.type === 'attributes' && mutation.target.nodeType === Node.ELEMENT_NODE) {
          this.checkNode(mutation.target as HTMLElement);
        }
    
        if(mutation.type === 'childList') {
          for (const node of mutation.addedNodes) {
            if(mutation.target.nodeType !== Node.ELEMENT_NODE) continue;
            this.checkNode(node as HTMLElement)
          }
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true, childList: true, subtree: true });
  }
};
