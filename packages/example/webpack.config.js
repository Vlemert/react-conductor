module.exports = {
  target: 'electron-main',
  entry: ['babel-polyfill', `${__dirname}/src/index.jsx`],

  output: {
    path: `${__dirname}/dist/`,
    filename: `bundle.js`
  },

  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.jsx']
  },

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  }
};
