module.exports = {
    entry: ['babel-polyfill', './src/cli.js'],
    target: 'node',
    output: {
        filename: './bin/index.js',
        libraryTarget: 'commonjs2',
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/i
            }
        ]
    }
};
