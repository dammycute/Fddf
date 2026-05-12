const path = require('path');

const isDev = process.env.NODE_ENV !== 'production';

/** @type {import('webpack').Configuration[]} */
module.exports = [
  // ── Main process ──────────────────────────────────────────
  {
    name: 'main',
    mode: isDev ? 'development' : 'production',
    target: 'electron-main',
    entry: './src/main.ts',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'main.js',
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    externals: {
      electron: 'commonjs electron',
    },
    devtool: isDev ? 'source-map' : false,
    node: {
      __dirname: false,
      __filename: false,
    },
  },

  // ── Preload script ────────────────────────────────────────
  {
    name: 'preload',
    mode: isDev ? 'development' : 'production',
    target: 'electron-preload',
    entry: './src/preload.ts',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'preload.js',
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    externals: {
      electron: 'commonjs electron',
    },
    devtool: isDev ? 'source-map' : false,
    node: {
      __dirname: false,
      __filename: false,
    },
  },
];
