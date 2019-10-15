const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    port: '10000',
    disableHostCheck: true,
    https: true,
    hot: true,
    host: 'localhost'
  }
});
