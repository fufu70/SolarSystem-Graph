const webpack = require('webpack');
const path = require('path');
const AssetsPlugin = require('assets-webpack-plugin');

module.exports = {

    entry: {
        app: path.resolve(__dirname, 'lib/index.js'),
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        publicPath: '/build/',
        filename: 'solarsystem-graph.js',
        chunkFilename: 'solarsystem-graph.[name].js'
    },
    resolve: {
        extensions: ['.js']
    }
};
