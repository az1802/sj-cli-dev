'use strict';


const path = require('path');
const Command = require('@sj-cli-dev/command');
const log = require('@sj-cli-dev/log');
const Package = require('@sj-cli-dev/package');
let inquirer = require('inquirer');
const fse = require('fs-extra')
const semver = require('semver')
const userHome = require('user-home');
const getTemplate = require('./getTemplate')

const TYPE_COMPONENT = 'component';
const TYPE_PROJECT = 'project';

class InitCommand extends Command {
  constructor(...args) {
    super(...args)
  }
  async init() {
    this.projectName = this._argv[0] || '';
  }
  async prepare() {
    let localPath = process.cwd();
    // 目录是否存在文件
    if (!this._isEmptyDir(localPath)) {
      let force = false;
      let ifContinue = false;
      let answers = await inquirer.prompt([
        {
          type: "confirm",
          name: "ifContinue",
          message: "当前文件夹不为空,是否继续创建项目",
        }
      ])
      ifContinue = answers.ifContinue;
      if (ifContinue === false) {
        return
      }
      if (force || ifContinue) {
        let answers = await inquirer.prompt([
          {
            type: "confirm",
            name: "isDelDir",
            message: "是否确认清空当前目录",
          }
        ])
        if (answers.isDelDir) {
          fse.emptyDir(localPath);
          log.info('清空目录');
          return true;
        } else {
          return false;
        }
      }
    }
    return this.getProjectInfo();
  }
  async getProjectInfo() {
    // 选择创建的是项目或组件
    let type = TYPE_PROJECT;
    let answers = await inquirer.prompt([
      {
        type: "list",
        name: "type",
        message: "请选择初始化类型",
        default: TYPE_PROJECT,
        choices: [{
          value: TYPE_COMPONENT, name: "组件",
        }, {
          value: TYPE_PROJECT, name: "项目",
        }],
        validate(v) {
          return typeof v == "string"
        }
      }
    ])
    type = answers.type;
    return {
      type
    }
    let projectInfo = {};
    // 是否强制更新
    if (type == TYPE_PROJECT) {
      let answers = await inquirer.prompt([
        {
          type: "input",
          name: "projectName",
          message: "输入项目的名称",
          validate(v) {
            const done = this.async();
            setTimeout(() => {
              // 输入的首字符必须为英文字符,尾字符必须为英文或数字,不能为字符,字符仅允许-_ 
              if (!/^[a-zA-Z]+((-|_)[a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9]?)$/.test(v)) {
                done("请输入合法的名称")
                return;
              }
              done(null, true)
            }, 0)
          }
        }, {
          type: "input",
          name: "projectVersion",
          message: "输入项目的版本号",
          default: "1.0.0",
          validate(v) {
            const done = this.async();
            setTimeout(() => {
              // 输入的首字符必须为英文字符,尾字符必须为英文或数字,不能为字符,字符仅允许-_ 
              if (!semver.valid(v)) {
                done("请输入合法版本号")
                return;
              }
              done(null, true)
            }, 0)
            return
          },
          filter(v) {
            if (!!semver.valid(v)) {
              return semver.valid(v)
            } else {
              return v;
            }
          }
        }, {
          type: "list",
          name: "projectTemplate",
          message: "请选择项目模板",
          choices: this.createTemplateChoice()
        }
      ])
      projectInfo = answers;
    } else {
      let answers = await inquirer.prompt([
        {
          type: "input",
          name: "componentName",
          message: "输入组件的名称",
          validate(v) {
            return typeof v == "string"
          }
        }
      ])
      projectInfo = answers;
    }

    return {
      type,
      ...projectInfo
    }
  }
  _isEmptyDir(localPath) {
    let fileList = fse.readdirSync(localPath);
    fileList = fileList && fileList.filter(file => (!file.startsWith('.') && ["node_modules"].indexOf(file) == -1))
    return !fileList || fileList.length < 1;
  }
  async getTemplateInfo() {
    let template = await getTemplate();
    if (!template || template.length < 1) {
      log.verbose('模板信息不存在')
    }
    this.template = template || [];
  }
  async downloadTemplate() {
    // 获取数据库存储的模板信息
    let targetPath = path.resolve(userHome, "sj-cli-cache", "template");
    let storeDir = path.resolve(userHome, 'sj-cli-home', 'template/node_modules');
    let templateInfo = this.template.find(item => item.name == this.projectInfo.projectTemplate)

    let pkg = new Package({
      targetPath,
      storeDir,
      packageName: templateInfo.name,
      packageVersion: templateInfo.version
    })
    if (await pkg.exists()) {
      let res = await pkg.update();
    } else {
      let res = await pkg.install();
      console.log('安装结果: ', res);
    }

  }
  async exec() {
    try {
      await this.getTemplateInfo();
      let ret = await this.prepare();
      if (!ret) { return }
      this.projectInfo = ret;
      await this.downloadTemplate()
      // 下载模板
      console.log('init 指令执行')
    } catch (err) {
      console.log('err: ', err);

    }
  }
  createTemplateChoice() {
    return this.template.map(item => ({
      name: item.name,
      value: item.name
    }))
  }
}


function init(...args) {
  return new InitCommand(...args)
}

module.exports = init;
module.exports.InitCommand = InitCommand;