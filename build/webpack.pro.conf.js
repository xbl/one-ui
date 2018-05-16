const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpackConfig = require('./webpack.base.conf')

module.exports = merge(webpackConfig, {
  mode: 'production',
  plugins: [
    new CleanWebpackPlugin(['dist'])
  ]
});
