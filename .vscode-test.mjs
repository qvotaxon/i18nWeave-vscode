import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
	files: [
		'out/lib/**/*.test.js',
		'out/extension.test.js'
	],
	workspaceFolder: './src/test/mock-workspace',
});
