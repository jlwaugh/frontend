/**
 * Webpack config for production electron main process
 */

import webpack from 'webpack'
import merge from 'webpack-merge'
import MinifyPlugin from 'babel-minify-webpack-plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import baseConfig from './webpack.config.base'
import CheckNodeEnv from './internals/scripts/CheckNodeEnv'

CheckNodeEnv('production')

export default merge.smart(baseConfig, {
  mode: 'production',
  devtool: 'source-map',
  target: 'electron-main',
  entry: './app/main.dev',

  // 'main.js' in root
  output: {
    path: __dirname,
    filename: './app/main.prod.js'
  },

  plugins: [
    /**
     * Babli is an ES6+ aware minifier based on the Babel toolchain (beta)
     */
    new MinifyPlugin({}, {
      sourceMap: null
    }),

    // https://github.com/bitinn/node-fetch/issues/41
    // new webpack.IgnorePlugin(/\/iconv-loader$/),

    new BundleAnalyzerPlugin({
      analyzerMode: process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
      openAnalyzer: process.env.OPEN_ANALYZER === 'true'
    }),

    /**
     * Create global constants which can be configured at compile time.
     *
     * Useful for allowing different behaviour between development builds and
     * release builds
     *
     * NODE_ENV should be production so that modules do not perform certain
     * development checks
     */
    new webpack.DefinePlugin({
      'process.env.ELECTRON': JSON.stringify('true'),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
      'process.env.DEBUG_PROD': JSON.stringify(process.env.DEBUG_PROD || false),
      'process.env.BASE_URL': JSON.stringify('http://localhost:2503'),
      'process.env.API_URL': JSON.stringify('http://localhost:2503'),
      'process.env.STATIC_ASSETS_URL': JSON.stringify('http://localhost:2503'),
      'process.env.SEGMENT_KEY': JSON.stringify('--nope--')
    }),

    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1 // disable creating additional chunks
    })
  ],

  /**
   * Disables webpack processing of __dirname and __filename.
   * If you run the bundle in node.js it falls back to these values of node.js.
   * https://github.com/webpack/webpack/issues/2010
   */
  node: {
    __dirname: false,
    __filename: false
  }
})
