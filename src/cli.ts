#!/usr/bin/env node

import { template } from './templates';
import { styler } from '@sorg/log';
import { argOptions, printHelp } from './options';
import { green } from './colors';
import { Exec } from 'suf-node';
import { LogStyle } from '@sorg/log/dist/interfaces';
import { allArgs, getProjectName, askQuestion, write, gitInfo, finishedMessage } from './utils';

(async () => {
  const args = allArgs();
  let name = args[2];

  const options = argOptions(args);

  if (options.h || options.help) {
    printHelp();
    return;
  }

  if (!name) {
    name = await getProjectName();
  }

  const preact = await askQuestion('use Preact?');
  const suf = await askQuestion('add suf-cli?');

  const dir = (path: string) => `./${name}/${path}`;

  await write(
    dir('package.json'),
    template('package.json', { name, suf, author: await gitInfo() })
  );
  await write(dir('.babelrc'), template('.babelrc', { preact }));
  await write(dir('webpack.config.ts'), template('webpack', { preact }));
  await write(dir('tsconfig.json'), template('tsconfig', { preact }));
  await write(dir('.gitignore'), template('.gitignore'));

  if (preact) {
    await write(dir('src/components/asyncRoute.tsx'), template('asyncRoute.tsx'));
    await write(dir('src/components/redirect.tsx'), template('redirect.tsx'));
    await write(dir('src/app.tsx'), template('app.tsx'));
    await write(dir('src/views/home.tsx'), template('home.tsx'));
    await write(dir('src/layouts/main.tsx'), template('mainLayout.tsx'));
  }
  await write(dir('src/index.sass'), template('index.sass'));
  await write(dir(`src/index.ts${preact ? 'x' : ''}`), template('index.main', { preact }));

  await write(dir('public/index.html'), template('index.html', { preact, name }));

  const devPackages = [
    '@babel/cli',
    '@babel/core',
    '@babel/preset-env',
    '@babel/preset-typescript',
    '@types/webpack',
    '@types/webpack-dev-server',
    'babel-loader',
    'css-loader',
    'del-cli',
    'file-loader',
    'fork-ts-checker-webpack-plugin',
    'html-webpack-plugin',
    'sass-loader',
    'sass-node',
    'style-loader',
    'ts-node',
    'typescript',
    'suf-cli',
    'webpack',
    'webpack-cli',
    'webpack-dev-server',
  ];
  if (preact) {
    devPackages.push('preact', '@babel/plugin-transform-react-jsx', 'preact-router');
  }

  const successStyle: LogStyle = { color: green, 'font-weight': 'bold' };
  console.log(styler('installing packages', successStyle));
  await Exec(`cd ${name} && yarn add ${devPackages.join(' ')}`, { linkStdout: true });
  if (await askQuestion('initialize git repository?')) {
    console.log(styler('initializing git repository', successStyle));
    await Exec(`cd ${name} && git init`, { linkStdout: true });
  }
  finishedMessage(name);
})();
