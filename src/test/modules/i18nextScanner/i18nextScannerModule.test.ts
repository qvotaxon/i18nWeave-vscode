// import * as assert from 'assert';
// import * as mock from 'mock-fs';
// import ModuleContext from '../../../interfaces/moduleContext';
// import I18nextScannerModule from '../../../modules/i18nextScanner/i18nextScannerModule';

// suite('I18nextScannerModule Tests', () => {
//   teardown(() => {
//     mock.restore();
//   });

//   test('doExecuteAsync should throw an error', async () => {
//     const module = new I18nextScannerModule();
//     const context = {} as ModuleContext;

//     try {
//       await module.executeAsync(context);
//       assert.fail('Expected an error to be thrown');
//     } catch (error) {
//       assert.strictEqual(error instanceof Error, true);
//       assert.strictEqual((error as Error).message, 'Method not implemented.');
//     }
//   });
// });

// test('doExecuteAsync should throw an error', async () => {
//   const module = new I18nextScannerModule();
//   const context = {} as ModuleContext;

//   try {
//     await module.executeAsync(context);
//     assert.fail('Expected an error to be thrown');
//   } catch (error) {
//     assert.strictEqual(error instanceof Error, true);
//     assert.strictEqual((error as Error).message, 'Method not implemented.');
//   }
// });
