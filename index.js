const inquirer = require("inquirer");
let shell = require("shelljs");
const { createFileCache, TYPE_JSON } = require('./FileCache');
// const onemindWeb = '~/sdata/onemind-web';
// const onemind = '~/sdata/onemind';


async function main() {
  let cache = createFileCache(TYPE_JSON);

  function getDefaultFrom({ type }) {
    let lastAnswer = cache.getValue(type);
    let { from } = lastAnswer || {};
    return from;
  }

  function getDefaultTo({ type }) {
    let lastAnswer = cache.getValue(type);

    let { to } = lastAnswer || {};

    if (to) {
      let no = Number.parseInt(to.slice(-3)) + 1 + '';
      
      while (no.length < 3) {
        no = '0' + no;
      }

      to = to.slice(0, -3) + no;
    }

    return to;
  }

  // 设置本地仓库地地址
  let repo = cache.getValue('repo') || {};
  if (!repo.frontEnd) {
    const askRepoFolder = () => {
      const questions = [
        {
          name: "frontEnd",
          type: "input",
          message: "请输入前端仓库在您本地的项目地址:",
          default: '~/sdata/onemind-web',
        },
        {
          name: "backEnd",
          type: "input",
          message: "请输入后端仓库在您本地的项目地址",
          default: '~/sdata/onemind',
        },
      ];
      return inquirer.prompt(questions);
    }
    repo = await askRepoFolder()
    cache.setValue('repo', repo);
  }


  // 设置分支名
  const askQuestions = () => {
    const questions = [
      {
        type: 'list',
        name: 'type',
        message: 'A版本还是T版本?',
        choices: ['A', 'T'],
        default: 'T',
      },
      {
        name: "from",
        type: "input",
        message: "请输入来源分支",
        default: getDefaultFrom,
      },
      {
        name: "to",
        type: "input",
        message: "请输入目标分支",
        default: getDefaultTo,
      },
    ];
    return inquirer.prompt(questions);
  };

  lastAnswer = await askQuestions();
  const { type, from, to } = lastAnswer;

  console.log('创建分支', from, '-->', to);

  console.log('创建前端分支...');
  shell.exec(`cd ${repo.frontEnd}; git checkout -b ${to} origin/${from}; git push --set-upstream origin ${to}`);

  console.log('创建后端分支...');

  shell.exec(`cd ${repo.backEnd}; git checkout -b ${to} origin/${from}; git push --set-upstream origin ${to}`);
  cache.setValue(type, lastAnswer);

  console.log('done');
}

main()
