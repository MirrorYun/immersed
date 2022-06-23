import { InjectModule, FixElement, InjectConfig, IsolatedCookie, IsolatedLocalStorage, NoServiceWorker, FixDocument } from './src/inject';

console.log('[Inject] Initing...');
if(!navigator.serviceWorker.controller) {
  console.warn('[Inject] Service worker has not been registered.');
  location.href = `/init?from=inject&uri=` + encodeURIComponent(`${location.pathname}${location.search}`);
}

const serviceWorker = window.navigator.serviceWorker.controller!;
serviceWorker.postMessage({
  type: 'register',
  url: location.href,
});

const injectConfig: InjectConfig = {
  serviceWorker
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