'use strict'

const path = require('path')
const webpack = require('webpack')

module.exports = {

  debug: true,
  devtool: 'cheap-module-eval-source-map',

  context: path.join(__dirname, '../src'),
  entry: {
    comms: [
      'webpack-hot-middleware/client?path=http://localhost:3004/__webpack_hmr&reload=true',
      './comms'
    ]
  },

  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: 'http://localhost:3004/',
    filename: '[name].bundle.js',
    chunkFilename: '[id].bundle.js'
  },

  resolve: {
    root: [
      path.join(__dirname, 'src')
    ],
    extensions: ['', '.js', '.jsx'],
    modulesDirectories: [
      'node_modules'
    ]
  },

  externals: {
    remote: 'require(\'remote\')',
    usb: 'require(\'usb\')'
  },

  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader?cacheDirectory'
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.css$/,
        exclude: /.*\.min.css/,
        loaders: ['style-loader', 'css-loader']
      },
      {
        test: /\.(scss|sass)$/,
        loaders: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.(ttf)$/,
        loader: 'file-loader?prefix=fonts/'
      },
      {
        test: /\.(png)$/,
        loader: 'file-loader?prefix=images/'
      }
    ]
  }

}
