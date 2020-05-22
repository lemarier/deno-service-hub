# service-hub

A semantically versioned provider/consumer system for global application services for Deno

[![Test CI](https://github.com/lemarier/deno-service-hub/workflows/Test%20CI/badge.svg)](https://github.com//lemarier/deno-service-hub/actions)

```ts
import ServiceHub from "https://deno.land/x/service_hub/mod.ts";

const serviceHub = new ServiceHub();

// Create our provider (worker) with the supported version
serviceHub.provide("order-pizza", "1.0.0", {
  placeOrder: (size: string, topping: string) => {
    console.log({ size, topping });
  },
});

// Then you can dispatch to all valid worker
serviceHub.consume(
  "order-pizza",
  "^1.0.0",
  (orderPizza: { placeOrder: Function }) => {
    orderPizza.placeOrder("large", "pepperoni");
  }
);

// -> { size: "large", topping: "pepperoni" }

// Now the author of the order-pizza makes a breaking change
// They start providing another instance of the service associated
// with the next major version number, converting the old service
// to a shim for compatibility:
serviceHub.provide("order-pizza", "2.0.0", {
  placeOrder: (size: string, topping: string) => {
    console.log({ size, toppings: [topping] });
  },
});

serviceHub.consume(
  "order-pizza",
  ">=2.0.0",
  (orderPizza: { placeOrder: Function }) => {
    orderPizza.placeOrder("large", "pepperoni");
  }
);

// -> { size: "large", toppings: [ "pepperoni" ] }
```

## API

### ServiceHub()

Returns a new service-hub instance.

#### .provide(keyPath, version, service)

Provide a service by invoking the callback of all current and future consumers matching the given key path and version range.

- `keyPath` : A {String} indicating the services's location in the namespace of all services
- `version` : A {String} containing a [semantic version](http://semver.org/) for the service's API.
- `service` An {Object} exposing the service API.

Returns a {Disposable} on which `.dispose()` can be called to remove the provided service.

#### .consume(keyPath, versionRange, callback)

Consume a service by invoking the given callback for all current and future provided services matching the given key path and version range.

- `keyPath` : A {String} indicating the services's location in the namespace of all services
- `versionRange` : A {String} containing a [semantic version range](https://www.npmjs.org/doc/misc/semver.html) that any provided services for the given key path must satisfy.
- `callback` A {Function} to be called with current and future matching service objects.

Subscribe to an event.

#### .clear()

Clear out all service consumers and providers, disposing of any disposables returned by previous consumers.
