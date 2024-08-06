import * as fs from 'fs';
import * as Mocha from 'mocha';
import * as os from 'os';
import * as path from 'path';
import { Uri, commands, workspace } from 'vscode';

let testWorkspace: string;

/**
 * Recursively traverse the test files directory, create corresponding folders
 * and add files to the workspace.
 */
async function createTestWorkspace() {
  testWorkspace = fs.mkdtempSync(
    path.join(os.tmpdir(), 'vscode-test-workspace-')
  );

  // Path to the directory containing test files
  const testFilesDir = path.join(__dirname, 'path/to/test/files');

  // Recursively traverse the directory
  traverseDirectory(testFilesDir, testWorkspace);

  // Update the workspace folders
  await workspace.updateWorkspaceFolders(0, 0, {
    uri: Uri.file(testWorkspace),
  });
}

/**
 * Recursively traverse the directory, create corresponding folders and add files to the workspace.
 */
function traverseDirectory(dir: string, workspaceDir: string) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      // Recursively traverse nested directories
      const folderName = path.basename(filePath);
      const nestedWorkspaceDir = path.join(workspaceDir, folderName);
      fs.mkdirSync(nestedWorkspaceDir);
      traverseDirectory(filePath, nestedWorkspaceDir);
    } else {
      // Add files to the workspace
      const fileName = path.basename(filePath);
      const destPath = path.join(workspaceDir, fileName);
      fs.copyFileSync(filePath, destPath);
    }
  });
}

/**
 * Remove the temporary workspace directory.
 */
function removeTestWorkspace() {
  if (testWorkspace) {
    fs.rmdirSync(testWorkspace, { recursive: true });
  }
}

// Global setup for Mocha
Mocha.before(async function () {
  await createTestWorkspace();
});

// Global teardown for Mocha
Mocha.after(function () {
  removeTestWorkspace();
});
