import * as Sentry from '@sentry/node';
import * as assert from 'assert';
import sinon from 'sinon';

import { TraceMethod } from '@i18n-weave/util/util-decorators';

suite('TraceMethod Decorator', () => {
  let startSpan: sinon.SinonStub;
  let captureException: sinon.SinonStub;

  setup(() => {
    startSpan = sinon.stub(Sentry, 'startSpan').callsFake((_, callback) => {
      return callback({} as Sentry.Span); // Call the callback directly to execute the decorated method
    });
    captureException = sinon.stub(Sentry, 'captureException');
  });

  teardown(() => {
    sinon.restore();
  });

  test('should start and finish a Sentry span', async () => {
    // Define a class with a method decorated with TraceMethod
    class TestService {
      @TraceMethod
      async myMethod(arg: string): Promise<string> {
        return `Processed ${arg}`;
      }
    }

    const service = new TestService();
    await service.myMethod('test');

    assert.strictEqual(
      startSpan.calledOnce,
      true,
      'Sentry.startSpan should be called once'
    );
    assert.deepStrictEqual(
      startSpan.firstCall.args[0],
      { op: 'myMethod', name: 'Executing myMethod' },
      'Sentry.startSpan should be called with correct arguments'
    );
  });

  test('should capture exceptions with Sentry', async () => {
    class TestService {
      @TraceMethod
      async myMethod(_: string): Promise<string> {
        throw new Error('Test Error');
      }
    }

    const service = new TestService();

    try {
      await service.myMethod('test');
      assert.fail('Expected error was not thrown');
    } catch (e) {
      assert.strictEqual(
        captureException.calledOnce,
        true,
        'Sentry.captureException should be called once'
      );
      assert.deepStrictEqual(
        captureException.firstCall.args[0].message,
        'Test Error',
        'Sentry.captureException should be called with the correct error'
      );
    }
  });
});
