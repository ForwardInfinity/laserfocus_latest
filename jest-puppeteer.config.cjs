const path = require('path');

module.exports = {
  launch: {
    headless: 'new',
    args: [
      `--disable-extensions-except=${path.resolve(__dirname)}`,
      `--load-extension=${path.resolve(__dirname)}`,
      '--no-sandbox',
    ],
  },
  server: {
    command: 'npx serve', // you can use any static server
    port: 3000,
    launchTimeout: 10000,
    debug: true,
  },
}; 