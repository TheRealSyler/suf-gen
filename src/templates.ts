interface Templates {
  'asyncRoute.tsx': [];
  'redirect.tsx': [];
  'app.tsx': [];
  'home.tsx': [];
  'mainLayout.tsx': [];
  '.babelrc': [{ preact: boolean }];
  'index.html': [{ preact: boolean; name: string; snowpack: boolean }];
  'index.sass': [];
  '.gitignore': [];
  'index.main': [{ preact: boolean }];
  webpack: [{ preact: boolean; snowpack: boolean }];
  tsconfig: [{ preact: boolean }];
  snowpack: [{ preact: boolean }];
  'snowpack-add-import-plugin': [];
  'package.json': [{ name: string; suf: boolean; author: undefined | string; snowpack: boolean }];
}

type Option<K extends keyof Templates> = Templates[K][0];

export function template<K extends keyof Templates>(name: K, ...options: Templates[K]): string {
  switch (name) {
    case 'asyncRoute.tsx':
      return generateAsyncRoute();
    case 'redirect.tsx':
      return generateRedirect();
    case '.babelrc':
      return generateBabelrc(options[0] as Option<'.babelrc'>);
    case 'index.sass':
      return generateIndexSass();
    case 'index.html':
      return generateIndexHtml(options[0] as Option<'index.html'>);
    case 'index.main':
      return generateMainIndex(options[0] as Option<'index.main'>);
    case 'webpack':
      return generateWebpack(options[0] as Option<'webpack'>);
    case 'tsconfig':
      return generateTsconfig(options[0] as Option<'tsconfig'>);
    case 'package.json':
      return generatePackageJson(options[0] as Option<'package.json'>);
    case '.gitignore':
      return 'node_modules\ndist';
    case 'app.tsx':
      return generateApp();
    case 'home.tsx':
      return generateHome();
    case 'mainLayout.tsx':
      return generateMainLayout();
    case 'snowpack':
      return generateSnowpackConf(options[0] as Option<'snowpack'>);
    case 'snowpack-add-import-plugin':
      return generateSnowpackAddImportPlugin();
  }
  return '';
}

function generatePackageJson(options: Option<'package.json'>) {
  const additionalSettings = {};
  if (options.suf) {
    additionalSettings['suf'] = 'suf';
  }

  return JSON.stringify(
    {
      name: options.name,
      version: '1.0.0',
      ...{ author: options.author },
      license: 'MIT',
      scripts: {
        start: options.snowpack ? 'snowpack dev' : 'webpack serve --mode development',
        build: `${options.suf ? 'suf && ' : ''}del ./dist && webpack --mode production`,
        ...additionalSettings,
      },
    },
    null,
    2
  );
}

function generateTsconfig(options: Option<'tsconfig'>) {
  const additionalSettings = options.preact ? { jsx: 'react', jsxFactory: 'h' } : {};
  return JSON.stringify(
    {
      compilerOptions: {
        target: 'es5',
        module: 'commonjs',
        esModuleInterop: true,
        strict: true,
        forceConsistentCasingInFileNames: true,
        ...additionalSettings,
      },
    },
    null,
    2
  );
}

function generateWebpack(options: Option<'webpack'>) {
  return `import { Configuration } from 'webpack';${options.snowpack ? '' : "\nimport { Configuration as Dev } from 'webpack-dev-server';"}
import { resolve } from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
// const WebpackBundleAnalyzer = require('webpack-bundle-analyzer');

type C = ${options.snowpack ? '' : '{ devServer?: Dev } &'}Configuration

const config: C = {
  entry: {
    index: \`\${__dirname}/src/index.ts${options.preact ? 'x' : ''}\`,
  },
  output: {
    path: resolve(__dirname, 'dist'),
    chunkFilename: '[name].chunk.js',
    filename: '[name].bundle.js',
    publicPath: '/',
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: \`\${__dirname}/public/index.html\`,
    }),
    new ForkTsCheckerWebpackPlugin(),
    // new WebpackBundleAnalyzer.BundleAnalyzerPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.tsx?$/,
        loader: 'babel-loader',
      },
      {
        test: /\.(eot|woff2?|svg|ttf|png|jpe?g)([\?]?.*)$/,
        loader: 'file-loader',
        sideEffects: true,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']${options.preact
      ? `,
    alias: {
      react: 'preact/compat',
      'react-dom/test-utils': 'preact/test-utils',
      'react-dom': 'preact/compat',
    }`
      : ''
    }
  },${options.snowpack
      ? ''
      : `
  devServer: {
    historyApiFallback: true,
    allowedHosts: ['localhost'],
    publicPath: '/',
  },`
    }
  optimization: {
    usedExports: true,
    splitChunks: {
      chunks: 'all',
      minSize: 2000,
    },
  },
};

module.exports = config;
`;
}

function generateMainIndex(options: Option<'index.main'>) {
  let preact = '';
  if (options.preact) {
    preact = `
import { h, render } from 'preact';
import App from './app';

render(<App/>, document.body);
`;
  }

  return `import './index.sass';
${preact}`;
}

function generateApp() {
  return `import { h, FunctionComponent } from 'preact';
import Router from 'preact-router';

import AsyncRoute from './components/asyncRoute';
import Redirect from './components/redirect';
import MainLayout from './layouts/main';

const App: FunctionComponent = () => {
  return (
    <Router>
      <AsyncRoute
        path="/home"
        layout={MainLayout}
        component={() => import(/*webpackChunkName: "HomeView"*/ './views/home')}
      />

      <Redirect to="/home" path="/"></Redirect>
    </Router>
  );
};

export default App;
`;
}
function generateHome() {
  return `import { h, FunctionComponent } from 'preact';

const Home: FunctionComponent = () => {
  return (
    <div></div>
  );
};

export default Home;
`;
}
function generateMainLayout() {
  return `import { h, FunctionComponent } from 'preact';

const MainLayout: FunctionComponent = (props) => {
  const { children } = props;
  return (
    <div>
      <header style="height: 40px; background: #444"></header>
      <div style="display: flex">
        <div style="width: 200px; background: #333; height: calc(100vh - 40px)"></div>
        <main style="padding: 2rem">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
`;
}

function generateIndexHtml(options: Option<'index.html'>) {
  return `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.name}</title>
</head>

<body>
${!options.preact
      ? `  <h1 class="header">Web Typescript Template</h1>   <h2 style="text-align: center;">Using</h2>
  <p class="paragraph">
${options.snowpack ? '\n    <a href="https://www.snowpack.dev"><b>Snowpack</b></a>' : ''}
    <a href="https://webpack.js.org"><b>Webpack</b></a>
    <a href="https://babeljs.io/"><b>Babel</b></a>
    <a href="https://sass-lang.com"><b>Sass</b></a>

  </p>
  <h2 style="text-align: center;">Supports</h2>
  <p class="paragraph">
    <b>Tree Shacking</b>
  </p>`
      : ''
    }
</body>

</html>
`;
}

function generateBabelrc(options: Option<'.babelrc'>) {
  let typescriptPreset: [string, any] = ['@babel/typescript', { onlyRemoveTypeImports: true }];
  const additionalPlugins: any[] = [];
  if (options.preact) {
    typescriptPreset[1].jsxPragma = 'h';
    additionalPlugins.push([
      '@babel/plugin-transform-react-jsx',
      {
        pragma: 'h',
        pragmaFrag: 'Fragment',
      },
    ]);
  }

  return JSON.stringify(
    {
      presets: ['@babel/env', typescriptPreset],
      plugins: [
        '@babel/proposal-class-properties',
        '@babel/proposal-object-rest-spread',
        ...additionalPlugins,
      ],
    },
    null,
    2
  );
}

function generateRedirect() {
  return `import { FunctionComponent } from 'preact';
import { route } from 'preact-router';

interface RedirectProps {
  to: string;
}

const Redirect: FunctionComponent<RedirectProps> = (props) => {
  const { to } = props;
  route(to, true);
  return null;
};

export default Redirect;
`;
}

function generateAsyncRoute() {
  return `import { h, FunctionComponent } from 'preact';
import { Suspense, lazy } from 'preact/compat';

interface AsyncRouteProps {
  layout?: FunctionComponent;
  component: () => Promise<{ default: any }>; // TODO: (low priority), find the type for any
}

const AsyncRoute: FunctionComponent<AsyncRouteProps> = (props) => {
  const { component, layout: Layout } = props;
  const Component = lazy(component);
  if (Layout) {
    return (
      <Layout>
        <Suspense fallback={<div></div>}>
          <Component {...props} />
        </Suspense>
      </Layout>
    );
  }
  return (
    <Suspense fallback={<div></div>}>
      <Component {...props} />
    </Suspense>
  );
};

export default AsyncRoute;
`;
}

function generateIndexSass() {
  return `@import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@500&display=swap')

body
  background: #121418
  color: #eee
  font-family: 'Roboto Mono', monospace
  margin: 0

.header
  font-size: 3.5rem
  text-align: center
  margin-top: 5rem
  margin-bottom: 5rem

.paragraph
  margin: 0 20%
  text-align: center
  font-size: 2rem

a
  color: #699
`;
}

function generateSnowpackConf(options: Option<'snowpack'>) {
  return `
module.exports = {
  mount: {
    public: '/',
    src: '/_dist_',
  },
  plugins: [${options.preact ? "\n    '@prefresh/snowpack'," : ''}
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
  alias: {${options.preact
      ? `
    react: 'preact/compat',
    'react-dom/test-utils': 'preact/test-utils',
    'react-dom': 'preact/compat',`
      : ''
    }
  },
};
`;
}

function generateSnowpackAddImportPlugin() {
  return `
module.exports = function (snowpackConfig, pluginOptions) {
  return {
    name: 'snowpack-plugin-add-import',
    async transform ({ id, contents, isDev, fileExt }) {
      if (fileExt === '.html') {
        return contents.replace(/(<body>)((.|\\W)*<\\/body>)/, '$1\\n<script type="module" src="/_dist_/index.js"></script>\\n$2');
      }
    },
  };
};
`;
}
