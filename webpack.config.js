const path = require('path')
const CopyPlugin = require("copy-webpack-plugin")
const CleanPlugin = require('clean-webpack-plugin').CleanWebpackPlugin
const ZipPlugin = require('zip-webpack-plugin')


var options = {
  mode: 'production',
  entry: {
    'background': './src/background.js',
    'leboncoin-plus': './src/leboncoin-plus.js',
  },
  target: 'web',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
  },
  plugins: [
    new CleanPlugin(),
    new CopyPlugin({
      patterns: [
        { from: './src/manifest.json' },
        { from: './src/icons/*', to: 'icons/[name][ext]' },
      ],
    }),
    new ZipPlugin({ filename: 'leboncoin-plus.zip'}),
  ],
}

module.exports = options;
