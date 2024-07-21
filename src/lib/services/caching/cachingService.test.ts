import assert from 'assert';
import sinon from 'sinon';
import * as vscode from 'vscode';

import { CacheEntry } from './cacheEntry';
import { CachingService } from './cachingService';

suite('CachingService', () => {
  let extensionContext: vscode.ExtensionContext;
  let globalStateGetStub: sinon.SinonStub;
  let globalStateUpdateStub: sinon.SinonStub;

  setup(() => {
    extensionContext = {
      globalState: {
        get: sinon.stub(),
        update: sinon.stub(),
      },
      workspaceState: {
        get: sinon.stub(),
        update: sinon.stub(),
      },
      subscriptions: [],
    } as unknown as vscode.ExtensionContext;

    globalStateGetStub = extensionContext.globalState.get as sinon.SinonStub;
    globalStateUpdateStub = extensionContext.globalState
      .update as sinon.SinonStub;
  });

  teardown(() => {
    sinon.restore();
  });

  suite('set', () => {
    test('should set a cache entry with the given key and value', () => {
      const key = 'testKey';
      const value = 'testValue';
      CachingService.set(extensionContext, key, value);

      const expectedCacheEntry = {
        value: 'testValue',
        timestamp: sinon.match.string,
      };

      assert(
        globalStateUpdateStub.calledWith(key, sinon.match(expectedCacheEntry))
      );
    });
  });

  suite('get', () => {
    test('should retrieve a valid cache entry', async () => {
      const key = 'testKey';
      const cacheEntry: CacheEntry<string> = {
        value: 'testValue',
        timestamp: new Date().toISOString(),
      };

      globalStateGetStub.withArgs(key).returns(cacheEntry);

      const result = await CachingService.get(
        extensionContext,
        key,
        async () => 'newValue'
      );
      assert.strictEqual(result, 'testValue');
    });

    test('should call onCacheMiss if the cache entry does not exist', async () => {
      const key = 'testKey';
      globalStateGetStub.withArgs(key).returns(undefined);

      const onCacheMiss = sinon.stub().resolves('newValue');

      const result = await CachingService.get(
        extensionContext,
        key,
        onCacheMiss
      );

      assert.strictEqual(result, 'newValue');
      assert(onCacheMiss.calledOnce);
      assert(
        globalStateUpdateStub.calledWith(
          key,
          sinon.match({ value: 'newValue', timestamp: sinon.match.string })
        )
      );
    });

    test('should call onCacheMiss if the cache entry is expired', async () => {
      const key = 'testKey';
      const cacheEntry: CacheEntry<string> = {
        value: 'testValue',
        timestamp: new Date(
          Date.now() - 15 * 24 * 60 * 60 * 1000
        ).toISOString(),
      };

      globalStateGetStub.withArgs(key).returns(cacheEntry);

      const onCacheMiss = sinon.stub().resolves('newValue');

      const result = await CachingService.get(
        extensionContext,
        key,
        onCacheMiss
      );

      assert.strictEqual(result, 'newValue');
      assert(onCacheMiss.calledOnce);
      assert(
        globalStateUpdateStub.calledWith(
          key,
          sinon.match({ value: 'newValue', timestamp: sinon.match.string })
        )
      );
    });

    test('should not call onCacheMiss if the cache entry is not expired', async () => {
      const key = 'testKey';
      const cacheEntry: CacheEntry<string> = {
        value: 'testValue',
        timestamp: new Date().toISOString(),
      };

      globalStateGetStub.withArgs(key).returns(cacheEntry);

      const onCacheMiss = sinon.stub().resolves('newValue');

      const result = await CachingService.get(
        extensionContext,
        key,
        onCacheMiss
      );

      assert.strictEqual(result, 'testValue');
      assert(onCacheMiss.notCalled);
    });
  });

  suite('clear', () => {
    test('should clear a cache entry', () => {
      const key = 'testKey';
      CachingService.clear(extensionContext, key);

      assert(globalStateUpdateStub.calledWith(key, undefined));
    });
  });

  suite('setDefaultExpirationDays', () => {
    test('should set the default expiration days for cache entries', () => {
      CachingService.setDefaultExpirationDays(10);
      assert.strictEqual((CachingService as any).expirationDays, 10);
    });
  });
});
