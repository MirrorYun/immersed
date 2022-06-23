import { InjectModule } from "./base";

export default class FixDocument extends InjectModule {
  name = 'fix-document';

  init() {
    Object.defineProperty(document, 'domain', {
      get() {
        return '';
      },
      set(value) {}
    })
  }
};