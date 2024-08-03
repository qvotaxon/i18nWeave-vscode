import { BaseActionModule } from '@i18n-weave/module/module-base-action';

import * as assert from 'assert';
import sinon from 'sinon';
import vscode from 'vscode';

import { ModuleContext } from './ibase-action-module-context';

class TestActionModule extends BaseActionModule {
  public doExecuteAsync = sinon.stub().resolves();
}

suite('BaseActionModule', () => {
  let extensionContext: vscode.ExtensionContext;
  let firstModule: TestActionModule;
  let secondModule: TestActionModule;
  let context: ModuleContext;

  setup(() => {
    extensionContext = {} as vscode.ExtensionContext;
    firstModule = new TestActionModule(extensionContext);
    secondModule = new TestActionModule(extensionContext);
    context = {} as ModuleContext;
  });

  suite('setNext', () => {
    test('should set the next action module', () => {
      firstModule.setNext(secondModule);
      assert.strictEqual(firstModule['nextModule'], secondModule);
    });
  });

  suite('executeAsync', () => {
    test('should execute the current module', async () => {
      await firstModule.executeAsync(context);
      sinon.assert.calledOnce(firstModule.doExecuteAsync);
    });

    test('should execute the next module if set', async () => {
      firstModule.setNext(secondModule);
      await firstModule.executeAsync(context);
      sinon.assert.calledOnce(firstModule.doExecuteAsync);
      sinon.assert.calledOnce(secondModule.doExecuteAsync);
    });

    test('should not execute the next module if not set', async () => {
      await firstModule.executeAsync(context);
      sinon.assert.calledOnce(firstModule.doExecuteAsync);
      sinon.assert.notCalled(secondModule.doExecuteAsync);
    });
  });
});
