#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

globalThis.SILENT = false;
globalThis.VERBOSE = false;
globalThis.ENVS = globalThis.ENVS || {};

const buildlib = require('../vendor/foam3/tools/buildlib');
const pmake = require('../vendor/foam3/tools/pmake');

const root = path.resolve(__dirname, '..');
const distDir = path.join(root, 'dist');
const buildDir = path.join(root, 'build');
const version = '0.1.0';
const bundleFile = `foam-bin-${version}.js`;

process.chdir(root);

fs.rmSync(distDir, { recursive: true, force: true });
fs.rmSync(buildDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });

pmake.call(
  buildlib,
  [
    '-makers=JS',
    '-flags=js,web,-java,-swift,-debug,-node,-test,-dev',
    '-pom=pom.prod',
    `-builddir=${buildDir}`,
    `-outdir=${distDir}`,
    `-version=${version}`
  ].join(' ')
);

fs.writeFileSync(path.join(distDir, 'index.html'), `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Woodblock</title>
    <style>
      html,
      body {
        margin: 0;
        min-height: 100%;
        background: #dfe8e2;
      }

      body {
        display: grid;
        min-height: 100vh;
        overflow: hidden;
        place-items: center;
      }

      canvas {
        display: block;
        touch-action: none;
      }
    </style>
    <script src="${bundleFile}" flags="-debug,-dev"></script>
  </head>
  <body>
    <foam class="woodblock.GameView"></foam>
  </body>
</html>
`);

console.log(`Built ${path.relative(root, path.join(distDir, 'index.html'))}`);
console.log(`Built ${path.relative(root, path.join(distDir, bundleFile))}`);
