import * as assert from 'assert';
import * as vscode from 'vscode';
import sinon from 'sinon';

import { StatusBarManager } from './status-bar-manager';
import { StatusBarState } from './status-bar-manager.types';

suite('StatusBarManager', () => {
  let context: vscode.ExtensionContext;
  let statusBarManager: StatusBarManager;
  let disposeStub: sinon.SinonStub;

  setup(() => {
    context = {
      subscriptions: [],
    } as unknown as vscode.ExtensionContext;

    sinon.stub(vscode.window, 'createStatusBarItem').returns({
      show: sinon.stub(),
      dispose: sinon.stub(statusBarManager['statusBarItem'], 'dispose'),
    } as unknown as vscode.StatusBarItem);

    statusBarManager = StatusBarManager.getInstance(context);
  });

  teardown(() => {
    sinon.restore();
    StatusBarManager.disposeInstance();
  });

  suite('getInstance', () => {
    test('should return the singleton instance', () => {
      const instance1 = StatusBarManager.getInstance(context);
      const instance2 = StatusBarManager.getInstance();
      assert.strictEqual(instance1, instance2);
    });
  });

  suite('updateState', () => {
    test('should update the status bar item state and tooltip', () => {
      const state = StatusBarState.Idle;
      const tooltip = 'Idle';
      statusBarManager.updateState(state, tooltip);
      assert.strictEqual(statusBarManager['statusBarItem'].text, `$(idle)`);
      assert.strictEqual(
        statusBarManager['statusBarItem'].tooltip,
        `i18nWeave - ${tooltip}`
      );
    });
  });

  suite('setIdle', () => {
    test('should set the status bar to the idle state', () => {
      statusBarManager.setIdle();
      assert.strictEqual(statusBarManager['statusBarItem'].text, `$(idle)`);
      assert.strictEqual(
        statusBarManager['statusBarItem'].tooltip,
        `i18nWeave - Idle`
      );
    });
  });

  suite('disposeInstance', () => {
    test('should dispose the status bar item and set instance to null', () => {
      StatusBarManager.disposeInstance();
      sinon.assert.calledOnce(disposeStub);
      assert.strictEqual(StatusBarManager['instance'], null);
    });
  });
});
