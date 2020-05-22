import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import ServiceHub from "./mod.ts";

Deno.test("test with different version range", () => {
  const hub = new ServiceHub();
  let totalProcessed: number = 0;

  hub.provide("run-test", "4.1.0", {
    runTest: () => {
      totalProcessed++;
    },
  });

  hub.provide("run-test", "1.0.1", {
    runTest: () => {
      totalProcessed++;
    },
  });

  hub.consume(
    "run-test",
    ">=4.0.0",
    (consumer: { runTest: Function }) => {
      consumer.runTest();
    },
  );
  assertEquals(totalProcessed, 1);

  hub.clear();
  assertEquals(hub.providers.length, 0);
  assertEquals(hub.consumers.length, 0);
});
