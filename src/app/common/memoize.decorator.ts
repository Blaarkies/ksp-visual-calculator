import memoize, {
  Cache,
  MemoizeFunc,
  Options,
  Serializer,
} from 'fast-memoize';

type Func = (...args: unknown[]) => unknown;
type DecoratorReturn<T> = (target: T,
                           propertyKey: string,
                           descriptor: PropertyDescriptor) => PropertyDescriptor;

interface MemoizationOptions<F extends Func> {
  cache?: Cache<string, ReturnType<F>>;
  serializer?: Serializer;
  strategy?: 'variadic' | 'monadic';
}

let stringToFastMemoStrategiesMap = new Map<MemoizationOptions<any>['strategy'], MemoizeFunc>([
  ['variadic', memoize.strategies.variadic],
  ['monadic', memoize.strategies.monadic],
]);

export function Memoize<Klass extends Func>(options: MemoizationOptions<Klass> = {}): DecoratorReturn<unknown> {
  return function (
    target: Klass,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    let originalMethod = descriptor.value;

    if (typeof originalMethod === 'function') {
      descriptor.value = function (this: Klass, ...args: unknown[]) {
        // Ensure `this` is bound correctly
        let boundFunction = originalMethod.bind(this);
        let fastMemoOptions: Options<Klass> = {
          ...options,
          strategy: stringToFastMemoStrategiesMap.get(options.strategy),
        };
        let memoizedFunction = memoize(boundFunction, fastMemoOptions);

        // Replace the original method with the memoized version
        Object.defineProperty(this, propertyKey, {
          value: memoizedFunction,
          configurable: true,
          writable: true,
        });

        // Call the memoized function with the provided arguments
        return memoizedFunction(...args);
      };

      return descriptor;
    }

    throw new Error(`@Memoize decorator can only be applied to methods`);
  };
}
