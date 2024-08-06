import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
	files: [
		'out/libs/**/*.test.js',
		'out/core/extension.test.js'
	],
	workspaceFolder: './src/test/mock-workspace',
	env: {
		DOTENV_CONFIG_PATH: './src/.env.vscode-test',
		NODE_ENV: "development"
	}
});
