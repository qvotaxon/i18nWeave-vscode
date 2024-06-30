const path = require('path');

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';

    return {
        entry: './src/extension.ts', // This should be your main file
        output: {
            filename: 'extension.js',
            path: path.resolve(__dirname, 'out'),
            libraryTarget: 'commonjs2'
        },
        target: 'node',
        mode: isProduction ? 'production' : 'development',
        resolve: {
            extensions: ['.ts', '.js']
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
