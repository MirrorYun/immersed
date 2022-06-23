import { InjectModule, FixElement, InjectConfig, IsolatedCookie, IsolatedLocalStorage, NoServiceWorker, FixDocument } from './src/inject';

console.log('[Inject] Initing...');
if(!navigator.serviceWorker.controller) {
  location.href = `/init?from=inject&uri=` + encodeURIComponent(`${location.pathname}${location.search}`);
  throw new Error('[Inject] Service worker has not been registered.');
}

const serviceWorker = window.navigator.serviceWorker.controller!;
serviceWorker.postMessage({
  type: 'register',
  url: location.href,
});

const regex = location.href.match(`^(?:http|https)://[^/]+${__PAGE_URI__}/(http|https)/([^/]+)(/[^?]*)(\\?.*)?$`);
if(!regex) throw new Error('Invalid url');

const injectConfig: InjectConfig = {
  serviceWorker,
  scheme: regex[1],
  host: regex[2],
  path: regex[3],
  search: regex[4],
}

interface InjectConstructor {
  new (config: InjectConfig): InjectModule;
}

const modules: InjectConstructor[] = [
  FixElement,
  FixDocument,
  IsolatedCookie,
  IsolatedLocalStorage,
  NoServiceWorker,
]

for (const _module of modules) {
  const module = new _module(injectConfig);
  try {
    module.init();
    console.log('[Inject] Applied module: ' + module.name);
  } catch (error) {
    console.warn('[Inject] Failed to apply module: ' + module.name, error);
  }
}

export type {}