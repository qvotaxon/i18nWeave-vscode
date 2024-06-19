import * as assert from 'assert';
import sinon from 'sinon';

import GeneralConfiguration from '../../lib/entities/configuration/general/generalConfiguration';
import I18nextScannerService from '../../lib/services/i18nextScannerService';
import ConfigurationStoreManager from '../../lib/stores/configuration/configurationStoreManager';

suite('I18nextScannerService', () => {
  let scannerService: I18nextScannerService;
  let getConfigStub: sinon.SinonStub;

  setup(() => {
    scannerService = I18nextScannerService.getInstance();
    getConfigStub = sinon.stub(
      ConfigurationStoreManager.getInstance(),
      'getConfig'
    );
  });

  teardown(() => {
    sinon.restore();
  });

  suite('getInstance', () => {
    test('should return the singleton instance', () => {
      const instance1 = I18nextScannerService.getInstance();
      const instance2 = I18nextScannerService.getInstance();
      assert.strictEqual(instance1, instance2);
    });
  });

  suite('scanCodeAsync', () => {
    test('should scan code for translation keys', async () => {
      const pathsConfiguration = {
        packageJsonAbsoluteFolderPath: 'some/path',
      } as GeneralConfiguration['pathsConfiguration'];
      getConfigStub.returns({ pathsConfiguration });

      const executeScannerStub = (scannerService['executeScanner'] = sinon
        .stub()
        .resolves());

      scannerService.scanCode();

      sinon.assert.calledOnce(getConfigStub);
      sinon.assert.calledOnce(executeScannerStub);
    });
  });
});
