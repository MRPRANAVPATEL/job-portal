process.env.BROWSER = process.env.BROWSER || 'none';
process.env.HOST = process.env.HOST || '127.0.0.1';

const configPath = require.resolve('react-scripts/config/webpackDevServer.config');
const createConfig = require(configPath);
// CRA 5 omits the allowed host when bound to an explicit address.
require.cache[configPath].exports = (proxy, allowedHost) =>
  createConfig(proxy, allowedHost || process.env.HOST);

require('react-scripts/scripts/start');
