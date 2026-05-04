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

const devScript = '<script src="vendor/foam3/src/foam.js" project="pom"></script>';
const prodScript = `<script src="${bundleFile}" flags="-debug,-dev"></script>`;
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const prodIndex = index.replace(devScript, prodScript);

if ( prodIndex === index ) {
  throw new Error('Could not find development FOAM script tag in index.html');
}

fs.writeFileSync(path.join(distDir, 'index.html'), prodIndex);

console.log(`Built ${path.relative(root, path.join(distDir, 'index.html'))}`);
console.log(`Built ${path.relative(root, path.join(distDir, bundleFile))}`);
