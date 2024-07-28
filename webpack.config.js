const path = require('path');
const Dotenv = require('dotenv');

// Load the environment variables from the specified .env file
Dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || '.env.production' });

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';

    return {
        entry: './src/extension.ts', // This should be your main file
        devtool: 'source-map',
        output: {
            filename: 'extension.js',
            path: path.resolve(__dirname, 'out'),
            libraryTarget: 'commonjs2'
        },
        target: 'node',
        mode: isProduction ? 'production' : 'development',
        resolve: {
            extensions: ['.ts', '.js'],
            alias: {
                '@i18n-weave/core': path.resolve(__dirname, 'src/core'),
                '@i18n-weave/commands': path.resolve(__dirname, 'src/commands'),
                '@i18n-weave/feature': path.resolve(__dirname, 'src/feature'),
                '@i18n-weave/util': path.resolve(__dirname, 'src/util'),
                '@i18n-weave/data-access': path.resolve(__dirname, 'src/data-access'),
                '@i18n-weave/ui': path.resolve(__dirname, 'src/ui'),
            }
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: 'ts-loader',
                    exclude: /node_modules/
                }
            ]
        },
        externals: {
            vscode: 'commonjs vscode'
        }
    };
};
