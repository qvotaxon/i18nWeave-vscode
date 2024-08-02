import assert from 'assert';
import fs from 'fs';
import path from 'path';
import sinon from 'sinon';
import vscode from 'vscode';

import ConfigurationStoreManager from '../../../util-configuration/src/lib/configuration-store-manager/configuration-store-manager';
// import {
//   determineOutputPath,
//   extractFilePathParts,
//   extractLocale,
//   findProjectRoot,
//   getFileExtension,
//   getProjectRootFolder,
//   getRelativePath,
// } from './filePathUtilities';
import * as filePathUtilities from './file-path-utilities';

suite('filePathUtilities', () => {
  let getConfigStub: sinon.SinonStub;

  teardown(() => {
    sinon.restore();
  });

  suite('extractLocale', () => {
    test('should extract the locale from the file path', () => {
      const config = {
        i18nextScannerModule: {
          translationFilesLocation: 'locales',
        },
      };

      getConfigStub = sinon //NOSONAR
        .stub(ConfigurationStoreManager.getInstance(), 'getConfig')
        .returns(config.i18nextScannerModule);

      const filePath = 'C:\\locales\\en\\file.po';
      const locale = filePathUtilities.extractLocale(filePath);
      assert.equal(locale, 'en');
    });

    test('should extract the locale from the file path with nested translation files location', () => {
      const config = {
        i18nextScannerModule: {
          translationFilesLocation: 'src/i18n',
        },
      };

      getConfigStub = sinon //NOSONAR
        .stub(ConfigurationStoreManager.getInstance(), 'getConfig')
        .returns(config.i18nextScannerModule);

      const filePath = 'C:\\src\\i18n\\en\\file.po';
      const locale = filePathUtilities.extractLocale(filePath);
      assert.equal(locale, 'en');
    });

    test('should throw an error for invalid file path format', () => {
      const config = {
        i18nextScannerModule: {
          translationFilesLocation: 'src/i18n',
        },
      };

      getConfigStub = sinon //NOSONAR
        .stub(ConfigurationStoreManager.getInstance(), 'getConfig')
        .returns(config.i18nextScannerModule);

      const filePath = 'C:\\invalid\\file.path';
      assert.throws(() => filePathUtilities.extractLocale(filePath), {
        message: 'Invalid file path format',
      });
    });
  });

  suite('determineOutputPath', () => {
    test('should determine the output path for .po file', () => {
      const filePath = 'C:\\locales\\en\\file.po';
      const outputPath = filePathUtilities.determineOutputPath(filePath);
      assert.deepStrictEqual(
        outputPath,
        vscode.Uri.file('C:\\locales\\en\\file.json')
      );
    });

    test('should determine the output path for .json file', () => {
      const filePath = 'C:\\locales\\en\\file.json';
      const outputPath = filePathUtilities.determineOutputPath(filePath);

      assert.deepStrictEqual(
        outputPath,
        vscode.Uri.file('C:\\locales\\en\\file.po')
      );
    });

    test('should throw an error for invalid file extension', () => {
      const filePath = 'C:\\locales\\en\\file.txt';

      assert.throws(() => filePathUtilities.determineOutputPath(filePath), {
        message:
          'Invalid file extension. Only .po and .json files are supported.',
      });
    });
  });

  suite('extractFilePathParts', () => {
    test('should extract the locale and output path from the file path', () => {
      const config = {
        i18nextScannerModule: {
          translationFilesLocation: 'locales',
        },
      };

      getConfigStub = sinon //NOSONAR
        .stub(ConfigurationStoreManager.getInstance(), 'getConfig')
        .returns(config.i18nextScannerModule);

      const filePath = 'C:\\locales\\en\\file.po';
      const filePathParts = filePathUtilities.extractFilePathParts(filePath);

      assert.deepStrictEqual(filePathParts, {
        locale: 'en',
        outputPath: vscode.Uri.file('C:\\locales\\en\\file.json'),
      });
    });

    test('should extract the locale and output path from the file path with nested translation files location', () => {
      const config = {
        i18nextScannerModule: {
          translationFilesLocation: 'src/i18n',
        },
      };

      getConfigStub = sinon //NOSONAR
        .stub(ConfigurationStoreManager.getInstance(), 'getConfig')
        .returns(config.i18nextScannerModule);

      const filePath = 'C:\\src\\i18n\\en\\file.po';
      const filePathParts = filePathUtilities.extractFilePathParts(filePath);

      assert.deepStrictEqual(filePathParts, {
        locale: 'en',
        outputPath: vscode.Uri.file('C:\\src\\i18n\\en\\file.json'),
      });
    });
  });

  suite('getFileExtension', () => {
    test('should get the file extension from the URI', () => {
      const uri = vscode.Uri.file('C:\\locales\\en\\file.po');
      const fileExtension = filePathUtilities.getFileExtension(uri);

      assert.strictEqual(fileExtension, 'po');
    });
  });

  suite('findProjectRoot', () => {
    test('should find project root by locating package.json downward', () => {
      const rootDir = 'C:\\workspace';
      const projectDir = path.join(rootDir, 'project');
      const localesDir = path.join(projectDir, 'public', 'locales');

      sinon.stub(fs, 'existsSync').callsFake(p => {
        return (
          p === path.join(projectDir, 'package.json') ||
          p === localesDir ||
          p === projectDir ||
          p === rootDir
        );
      });

      sinon.stub(fs, 'lstatSync').callsFake((p): any => {
        return {
          isDirectory: () => p === projectDir, //NOSONAR
        };
      });

      sinon.stub(fs, 'readdirSync').callsFake((dir): any => {
        if (dir === rootDir) {
          return ['project'];
        }
        if (dir === projectDir) {
          return ['public', 'package.json'];
        }
        if (dir === path.join(projectDir, 'public')) {
          return ['locales'];
        }
        return [];
      });

      const projectRoot = filePathUtilities.findProjectRoot(rootDir);
      assert.strictEqual(projectRoot, projectDir);
    });

    test('should stop searching when node_modules is found', () => {
      const rootDir = 'C:\\workspace';
      const projectDir = path.join(rootDir, 'project');
      const nodeModulesDir = path.join(projectDir, 'node_modules');

      sinon.stub(fs, 'existsSync').callsFake(p => {
        return p === nodeModulesDir || p === projectDir || p === rootDir;
      });

      sinon.stub(fs, 'lstatSync').callsFake((p): any => {
        return {
          isDirectory: () => p === nodeModulesDir || p === projectDir, //NOSONAR
        };
      });

      sinon.stub(fs, 'readdirSync').callsFake((dir): any => {
        if (dir === rootDir) {
          return ['project'];
        }
        if (dir === projectDir) {
          return ['node_modules'];
        }
        return [];
      });

      const projectRoot = filePathUtilities.findProjectRoot(rootDir);
      assert.strictEqual(projectRoot, projectDir);
    });
  });

  suite('getProjectRootFolder', () => {
    test('should get project root folder from workspace', () => {
      const workspaceFolder = {
        uri: vscode.Uri.file('C:\\workspace'),
      } as vscode.WorkspaceFolder;
      const projectDir = path.join(workspaceFolder.uri.fsPath, 'project');

      sinon.stub(vscode.workspace, 'workspaceFolders').value([workspaceFolder]);
      sinon.stub(fs, 'existsSync').callsFake(p => {
        return (
          p === path.join(projectDir, 'package.json') ||
          p === workspaceFolder.uri.fsPath ||
          p === projectDir
        );
      });
      sinon.stub(fs, 'lstatSync').callsFake((p): any => {
        return {
          isDirectory: () => p === projectDir, //NOSONAR
        };
      });

      sinon.stub(fs, 'readdirSync').callsFake((dir): any => {
        if (dir === workspaceFolder.uri.fsPath) {
          return ['project'];
        }
        if (dir === projectDir) {
          return ['package.json'];
        }
        return [];
      });

      const projectRoot = filePathUtilities.getProjectRootFolder();
      assert.strictEqual(projectRoot, projectDir);
    });

    test('should throw an error if no project root is found', () => {
      const rootDir = 'c:\\workspace';
      const workspaceFolder = {
        uri: vscode.Uri.file(rootDir),
      } as vscode.WorkspaceFolder;

      sinon.stub(vscode.workspace, 'workspaceFolders').value([workspaceFolder]);
      sinon.stub(fs, 'existsSync').returns(false);
      sinon.stub(fs, 'lstatSync').callsFake((p): any => {
        return {
          isDirectory: () => p === rootDir, //NOSONAR
        };
      });
      sinon.stub(fs, 'readdirSync').callsFake((dir): any => {
        if (dir === rootDir) {
          return ['project'];
        }
      });

      assert.throws(
        () => {
          filePathUtilities.getProjectRootFolder();
        },
        {
          message: 'Project root folder not found',
        }
      );
    });
  });

  // suite('getRelativePath', () => {
  //   test('should get the relative path of a folder from the project root folder', () => {
  //     const projectRootFolder = 'C:\\workspace\\project';
  //     const folderPath = 'C:\\workspace\\project\\src\\components';

  //     sinon
  //       .stub(filePathUtilities, 'getProjectRootFolder')
  //       .returns(projectRootFolder);

  //     const relativePath = filePathUtilities.getRelativePath(folderPath);
  //     assert.strictEqual(relativePath, 'src/components');
  //   });
  // });
});
