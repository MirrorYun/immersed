import { InjectModule } from "./base";

export default class NoServiceWorker extends InjectModule {
  name = 'no-sw';

  init() {
    delete Object.getPrototypeOf(window.navigator).serviceWorker;
  }
};