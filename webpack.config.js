const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const { codecovWebpackPlugin } = require("@codecov/webpack-plugin");

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';

    console.log(`Running webpack in ${isProduction ? '!!! Production Mode !!!' : 'Development Mode'}`);

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
        },
        plugins: [
            // Put the Codecov Webpack plugin after all other plugins
            codecovWebpackPlugin({
                enableBundleAnalysis: process.env.CODECOV_UPLOAD_TOKEN !== undefined,
                bundleName: "@qvotaxon/i18nWeave-vscode",
                uploadToken: process.env.CODECOV_UPLOAD_TOKEN,
                debug: true,
            }),
        ],
    };
};
