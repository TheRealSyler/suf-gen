import { template } from '../../templates';

test('[Template]: snowpack', () => {
  const noOpt = template('snowpack', { preact: false });

  expect(noOpt).toEqual(`
module.exports = {
  mount: {
    public: '/',
    src: '/_dist_',
  },
  plugins: [
    '@prefresh/snowpack',
    '@snowpack/plugin-dotenv',
    '@snowpack/plugin-typescript',
    '@snowpack/plugin-sass',
    './snowpack-plugin-add-import.js'
  ],
  install: [
    /* ... */
  ],
  installOptions: {
    /* ... */
  },
  devOptions: {
    open: 'none'
  },
  buildOptions: {
    /* ... */
  },
  proxy: {
    /* ... */
  },
  alias: {
  },
};
`);
  const preact = template('snowpack', { preact: true });
  expect(preact).toEqual(`
module.exports = {
  mount: {
    public: '/',
    src: '/_dist_',
  },
  plugins: [
    '@prefresh/snowpack',
    '@snowpack/plugin-dotenv',
    '@snowpack/plugin-typescript',
    '@snowpack/plugin-sass',
    './snowpack-plugin-add-import.js'
  ],
  install: [
    /* ... */
  ],
  installOptions: {
    /* ... */
  },
  devOptions: {
    open: 'none'
  },
  buildOptions: {
    /* ... */
  },
  proxy: {
    /* ... */
  },
  alias: {
    react: 'preact/compat',
    'react-dom/test-utils': 'preact/test-utils',
    'react-dom': 'preact/compat',
  },
};
`);
});
