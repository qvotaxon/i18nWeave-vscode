const path = require('path');
const Dotenv = require('dotenv');

// Load the environment variables from the specified .env file
Dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || '.env.production' });

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';

    return {
        entry: './src/core/extension.ts', // This should be your main file
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
                '@i18n-weave/feature': path.resolve(__dirname, 'src/libs/feature/feature-*/src'),
                '@i18n-weave/file-io': path.resolve(__dirname, 'src/libs/file-io/file-io-*/src'),
                '@i18n-weave/http': path.resolve(__dirname, 'src/libs/http/http-*/src'),
                '@i18n-weave/module': path.resolve(__dirname, 'src/libs/module/module-*/src'),
                '@i18n-weave/store': path.resolve(__dirname, 'src/libs/store/store-*/src'),
                '@i18n-weave/util': path.resolve(__dirname, 'src/libs/util/util-*/src'),
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
