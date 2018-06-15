const path = require('path');

module.exports = {
    entry: './src/index.mjs',
    mode: process.env.NODE_ENV || 'development',
    target: 'node',
    output: {
        path: path.resolve(__dirname, 'bin'),
        filename: 'index.js',
        libraryTarget: 'commonjs2',
    },
    module: {
        rules: [{ test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/i }]
    }
};
