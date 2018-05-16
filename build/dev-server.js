const webpack = require('webpack');
const middleware = require('webpack-dev-middleware');

const config = require('./webpack.base.conf.js');

Object.keys(config.entry).forEach(function (name) {
  config.entry[name] = ['./build/dev-client'].concat(config.entry[name])
})

const compiler = webpack(config);
const express = require('express');
const app = express();

app.use(middleware(compiler, {
  log: false,
  heartbeat: 1000
}));

app.use(require('webpack-hot-middleware')(compiler));

app.listen(3000, () => console.log('Example app listening on port 3000!'))
