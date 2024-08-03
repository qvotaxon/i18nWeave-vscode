import assert from 'assert';
import sinon from 'sinon';
import vscode from 'vscode';

import * as prompts from '@i18n-weave/util/util-prompt-utilities';

import * as configurationHandlers from './configuration-handlers';
import ConfigurationWizardService from './configuration-wizard-service';
import * as nextI18nextConfigHandlers from './next-i18next-config-handlers';

suite('ConfigurationWizardService', () => {
  let sandbox: sinon.SinonSandbox;
  let service: ConfigurationWizardService;

  setup(() => {
    sandbox = sinon.createSandbox();
    service = new ConfigurationWizardService();
  });

  teardown(() => {
    sandbox.restore();
  });

  test('should return undefined for MonoRepo project type', async () => {
    sandbox
      .stub(prompts, 'selectProjectTypeAsync')
      .resolves('Mono-repo (not supported yet)');

    const result = await service.startConfigurationWizardAsync();

    assert.strictEqual(result, undefined);
  });

  test('should return undefined when no project type is selected', async () => {
    sandbox.stub(prompts, 'selectProjectTypeAsync').resolves(undefined);

    const result = await service.startConfigurationWizardAsync();

    assert.strictEqual(result, undefined);
  });

  test('should return undefined when no framework is selected', async () => {
    sandbox.stub(prompts, 'selectProjectTypeAsync').resolves('Single project');
    sandbox.stub(prompts, 'selectFrameworkAsync').resolves(undefined);

    const result = await service.startConfigurationWizardAsync();

    assert.strictEqual(result, undefined);
  });

  test('should handle custom project configuration', async () => {
    sandbox.stub(prompts, 'selectProjectTypeAsync').resolves('Single project');
    sandbox.stub(prompts, 'selectFrameworkAsync').resolves('Custom');
    sandbox
      .stub(configurationHandlers, 'configureCustomProjectAsync')
      .resolves(true);
    sandbox
      .stub(configurationHandlers, 'configureGeneralSettingsAsync')
      .resolves(true);
    sandbox.stub(configurationHandlers, 'setConfigurationAsync').resolves();

    const result = await service.startConfigurationWizardAsync();

    assert.ok(result);
  });

  //TODO: Disabled until finding a way to test this using simulated user input. Currently it fails because no user input is provided.
  test.skip('should handle NextJS configuration', async () => {
    sandbox.stub(prompts, 'selectProjectTypeAsync').resolves('Single project');
    sandbox
      .stub(prompts, 'selectFrameworkAsync')
      .resolves('Next.js (next-i18next)');
    sandbox
      .stub(nextI18nextConfigHandlers, 'scanNextI18nextConfigFileAsync')
      .resolves('/path/to/config');
    sandbox
      .stub(nextI18nextConfigHandlers, 'readNextI18nextConfigFileAsync')
      .resolves({
        defaultLanguage: 'en',
        languages: ['en', 'fr'],
        namespaces: ['common'],
        fileExtensions: ['ts', 'tsx', 'js', 'jsx'],
        translationFunctionNames: ['t', 'i18next.t'],
      });

    const confirmativeOption: vscode.MessageItem = {
      title: `, lead the way!`,
    };

    sandbox
      .stub(prompts, 'showConfigurationToUserAsync')
      .resolves(confirmativeOption);
    sandbox.stub(configurationHandlers, 'setConfigurationAsync').resolves();

    const result = await service.startConfigurationWizardAsync();

    assert.ok(result);
  });

  test('should handle user choosing to configure NextJS manually', async () => {
    sandbox.stub(prompts, 'selectProjectTypeAsync').resolves('Single project');
    sandbox
      .stub(prompts, 'selectFrameworkAsync')
      .resolves('Next.js (next-i18next)');
    sandbox
      .stub(nextI18nextConfigHandlers, 'scanNextI18nextConfigFileAsync')
      .resolves('/path/to/config');
    sandbox
      .stub(nextI18nextConfigHandlers, 'readNextI18nextConfigFileAsync')
      .resolves({
        defaultLanguage: 'en',
        languages: ['en', 'fr'],
        namespaces: ['common'],
        fileExtensions: ['ts', 'tsx', 'js', 'jsx'],
        translationFunctionNames: ['t', 'i18next.t'],
      });

    const dismissiveOption: vscode.MessageItem = {
      title: `, I'll configure it myself.`,
    };

    sandbox
      .stub(prompts, 'showConfigurationToUserAsync')
      .resolves(dismissiveOption);
    sandbox
      .stub(configurationHandlers, 'configureCustomProjectAsync')
      .resolves(true);
    sandbox
      .stub(configurationHandlers, 'configureGeneralSettingsAsync')
      .resolves(true);
    sandbox.stub(configurationHandlers, 'setConfigurationAsync').resolves();

    const result = await service.startConfigurationWizardAsync();

    assert.ok(result);
  });
});
