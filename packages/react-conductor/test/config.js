const base = require('./config.base.json');

module.exports = Object.assign(base, {
  collectCoverageFrom: ['src/**/*.{js,jsx}'],
  coverageReporters: ['text']
});
