import sinon from 'sinon';
import vscode from 'vscode';

import { I18nextScannerService } from '@i18n-weave/feature/feature-i18next-scanner-service';

import { ConfigurationStoreManager } from '@i18n-weave/util/util-configuration';

import { I18nextScannerModule } from './i18next-scanner-module';
import I18nextScannerModuleContext from './i18next-scanner-module-context';

suite('I18nextScannerModule', () => {
  let extensionContext: vscode.ExtensionContext;
  let scannerModule: I18nextScannerModule;
  let scannerServiceStub: sinon.SinonStubbedInstance<I18nextScannerService>;
  let scannerServiceScanCodeStub: sinon.SinonStub;
  let scannerServiceScanFileStub: sinon.SinonStub;

  setup(() => {
    const getConfigStub = sinon.stub(
      ConfigurationStoreManager.getInstance(),
      'getConfig'
    );
    getConfigStub.withArgs('i18nextScannerModule').returns({ enabled: true });
    extensionContext = {} as vscode.ExtensionContext;

    extensionContext = {
      globalState: {
        get: sinon.stub().callsFake((key: string) => {
          if (key === 'i18nWeave.isPaused') {
            return false;
          }
          return undefined;
        }),
        update: sinon.stub().resolves(),
      },
    } as unknown as vscode.ExtensionContext;
    scannerModule = new I18nextScannerModule(extensionContext);
    scannerServiceStub = sinon.createStubInstance(I18nextScannerService);
    scannerServiceScanCodeStub = scannerServiceStub.scanCode = sinon.stub();
    scannerServiceScanFileStub = scannerServiceStub.scanFile = sinon.stub();
    sinon
      .stub(I18nextScannerService, 'getInstance')
      .returns(scannerServiceStub);
  });

  teardown(() => {
    sinon.restore();
  });

  test('should call scanCode on I18nextScannerService', async () => {
    const context = {
      hasChanges: true,
      hasDeletions: true,
    } as I18nextScannerModuleContext;

    await scannerModule.executeAsync(context);

    sinon.assert.calledOnce(scannerServiceScanCodeStub);
  });

  test('should call scanFile on I18nextScannerService when changes are only additions', async () => {
    const context = {
      hasChanges: true,
      hasDeletions: false,
      hasRenames: false,
    } as I18nextScannerModuleContext;

    await scannerModule.executeAsync(context);

    sinon.assert.calledOnce(scannerServiceScanFileStub);
  });
});
