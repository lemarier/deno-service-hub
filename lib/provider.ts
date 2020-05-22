import { CompositeDisposable } from "https://raw.githubusercontent.com/lemarier/deno-event-kit/master/mod.ts";
import * as semver from "https://deno.land/x/semver/mod.ts";

export type ServicesByVersion = Record<string, any>;

export default class Provider {
  consumersDisposable: CompositeDisposable = new CompositeDisposable();
  servicesByVersion: ServicesByVersion = {};
  versions: string[] = [];

  constructor(keyPath: string, servicesByVersion: ServicesByVersion) {
    this.versions.sort((a: any, b: any) => b.compare(a));

    for (const iVersion in servicesByVersion) {
      // always overwrite pre-existing for this version
      this.servicesByVersion[iVersion] = {};
      const validVersion = semver.valid(iVersion);
      if (!validVersion) {
        throw new TypeError(
          "Version is invalid",
        );
      }
      this.versions.push(validVersion);

      this.servicesByVersion[iVersion][keyPath] = servicesByVersion[iVersion];
    }
  }

  provide(consumer: any) {
    this.versions.forEach((version) => {
      if (!consumer.versionRange.test(version)) {
        return;
      }
      const value = this.servicesByVersion[version][consumer.keyPath];
      const consumerDisposable = consumer.callback.call(null, value);

      if (
        consumerDisposable && consumerDisposable.dispose &&
        typeof consumerDisposable.dispose === "function"
      ) {
        this.consumersDisposable.add(consumerDisposable);
      }
    });
  }

  destroy() {
    this.consumersDisposable.dispose();
  }
}
