import { InjectModule } from "./base";

export default class IsolatedCookie extends InjectModule {
  name = 'isolated-cookie';

  init() {
    Object.defineProperty(document, 'cookie', {
      get() {
        return '';
      },
      set(value) {}
    })
  }
};