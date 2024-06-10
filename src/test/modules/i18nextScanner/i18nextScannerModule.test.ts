import sinon from 'sinon';

import I18nextScannerModule from '../../../modules/i18nextScanner/i18nextScannerModule';
import I18nextScannerModuleContext from '../../../modules/i18nextScanner/i18nextScannerModuleContext';
import I18nextScannerService from '../../../services/i18nextScannerService';

suite('I18nextScannerModule', () => {
  let scannerModule: I18nextScannerModule;
  let scannerServiceStub: sinon.SinonStubbedInstance<I18nextScannerService>;
  let scannerServiceScanCodeStub: sinon.SinonStub;

  setup(() => {
    scannerModule = new I18nextScannerModule();
    scannerServiceStub = sinon.createStubInstance(I18nextScannerService);
    scannerServiceScanCodeStub = scannerServiceStub.scanCode = sinon.stub();
    sinon
      .stub(I18nextScannerService, 'getInstance')
      .returns(scannerServiceStub);
  });

  teardown(() => {
    sinon.restore();
  });

  test('should call scanCode on I18nextScannerService', async () => {
    const context = {} as I18nextScannerModuleContext;

    await scannerModule.executeAsync(context);

    sinon.assert.calledOnce(scannerServiceScanCodeStub);
  });
});
