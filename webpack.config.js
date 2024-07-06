const path = require('path');
const Dotenv = require('dotenv');

// Load the environment variables from the specified .env file
Dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || '.env.production' });
console.log('DOTENV_CONFIG_PATH:', process.env.DOTENV_CONFIG_PATH);

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
