#!/usr/bin/env node
const { readFileSync } = require('fs');
const { flatMap, sortBy } = require('lodash');
const { program } = require('commander');
const { Parser } = require('acorn');
const jsx = require('acorn-jsx');
const stage3 = require('acorn-stage3');
const glob = require('glob');

const JSXParser = Parser.extend(jsx()).extend(stage3);

/*
  npx es-count semantic-ui-react
*/
program
  .arguments('<module>')
  .option('-d, --debug')
  .option('-g, --glob <glob>', 'the glob pattern to evaluate', '**/*.js')
  .action(run);

function run(module, cmdObj) {
  const debug = cmdObj.debug || false;
  const counts = {};

  console.log(`Evaluating ${cmdObj.glob}`);
  const files = glob.sync(cmdObj.glob);
  const filteredFiles = files.filter(file => !file.startsWith('node_modules'));
  console.log(`Evaluating ${filteredFiles.length} files...\n`);

  filteredFiles.forEach(file => {
    if (debug === true) {
      console.log(`Evaluating ${file}`);
    }
    let content;
    try {
      content = readFileSync(file).toString();
    } catch (err) {
      if (debug === true) {
        console.error(err);
      }
    }

    const ast = JSXParser.parse(content, {
      sourceType: 'module',
      allowHashBang: true,
    });

    const importNodes = ast.body.filter(node => {
      return node.type === 'ImportDeclaration' && node.source.value === module;
    });

    const specifierNames = flatMap(importNodes.map(node => node.specifiers)).map(specifer => specifer.imported.name);

    specifierNames.forEach(specifierName => {
      const currentCount = counts[specifierName] || 0;
      counts[specifierName] = currentCount + 1;
    });
  });

  const sortedCounts = sortBy(Object.keys(counts), k => counts[k])
    .reverse()
    .map(k => `${k}: ${counts[k]}`);

  const output = sortedCounts.join('\n');
  console.log(output);
}

program.parse(process.argv);

// console.log({program});
// console.log('module', program.module);
// console.log('glob', program.module);