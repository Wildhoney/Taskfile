const path = require('path');

module.exports = {
    entry: './src/cli.js',
    target: 'node',
    mode: process.env.NODE_ENV || 'development',
    output: {
        filename: './bin/index.js',
        path: path.resolve('./'),
        libraryTarget: 'commonjs2',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/i
            }
        ]
    }
};
