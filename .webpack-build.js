var webpack = require('webpack')
var path    = require('path')

var config = {
  devtool: 'cheap-module-eval-source-map',
  output: {
    filename: 'script.js'
  },
  module: {
    loaders: [{
      test: /\.jsx?/,
      include: path.join(__dirname, 'build/jsx'),
      loader: 'babel',
      query: {
        cacheDirectory: true
      }
    }, {
      test: /\.json$/,
      loader: 'json-loader'
    }]
  }
}

module.exports = config
