import { Range } from "https://deno.land/x/semver/mod.ts";

export default class Consumer {
  keyPath: string;
  versionRange: Range;
  callback: Function;
  constructor(keyPath: string, versionRange: string, callback: Function) {
    this.callback = callback;
    this.versionRange = new Range(versionRange);
    this.keyPath = keyPath;
  }
}
