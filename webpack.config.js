const path = require('path');
const Dotenv = require('dotenv');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

// Load the environment variables from the specified .env file
Dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || '.env.production' });

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';

    return {
        entry: './src/core/extension.ts',
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
            plugins: [
                new TsconfigPathsPlugin({
                    configFile: path.resolve(__dirname, 'tsconfig.json')
                })
            ]
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
