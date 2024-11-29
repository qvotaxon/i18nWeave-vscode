import * as Sentry from '@sentry/node';

export function TraceMethod(
  _: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    Sentry.startSpan(
      { op: propertyKey, name: `Executing ${propertyKey}` },
      async () => {
        try {
          const result = await originalMethod.apply(this, args);
          return result;
        } catch (error) {
          Sentry.captureException(error);

          return Promise.reject((error as Error).message);
        }
      }
    );
  };
}
