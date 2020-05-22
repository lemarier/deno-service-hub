import Provider, { ServicesByVersion } from "./provider.ts";
import Consumer from "./consumer.ts";
import { Disposable } from "https://raw.githubusercontent.com/lemarier/deno-event-kit/master/mod.ts";

export class ServiceHub {
  consumers: Consumer[] = [];
  providers: Provider[] = [];

  provide(keyPath: string, version: string, service: {}) {
    // build our object with version as key
    const servicesByVersion: ServicesByVersion = {};
    servicesByVersion[version] = service;

    const provider = new Provider(keyPath, servicesByVersion);
    this.providers.push(provider);

    this.consumers.forEach((consumer) => {
      provider.provide(consumer);
    });

    return new Disposable(() => {
      const index = this.providers.indexOf(provider);
      provider.destroy();
      this.providers.splice(index, 1);
    });
  }

  consume(keyPath: string, versionRange: string, callback: Function) {
    const consumer = new Consumer(keyPath, versionRange, callback);

    this.consumers.push(consumer);

    this.providers.forEach((provider) => {
      provider.provide(consumer);
    });

    return new Disposable(() => {
      const index = this.consumers.indexOf(consumer);
      if (index >= 0) {
        this.consumers.splice(index, 1);
      }
    });
  }

  clear() {
    this.providers.forEach((provider) => {
      provider.destroy();
    });

    this.providers = [];
    this.consumers = [];
  }
}
