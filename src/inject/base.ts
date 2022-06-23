export interface InjectConfig {
  serviceWorker: ServiceWorker;
}

export abstract class InjectModule {
  public name: string = 'base';
  protected _config: InjectConfig

  constructor(config: InjectConfig) {
    this._config = config;
  }
  
  abstract init(): void;
}