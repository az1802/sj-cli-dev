const path = require('path')
const { Command } = require('commander')
const pkg = require('../package.json')
const log = require('@sj-cli-dev/log')
const semver = require('semver')
const colors = require('colors')
const { LOWEST_NODE_VERSION, DEFAULT_CLI_HOME } = require('./constants')
const userHome = require('user-home');
const pathExists = require('path-exists').sync


function checkPkgVersion() {
  log.info(pkg.version)
}


function checkNodeVersion() {
  const curNodeVersion = process.version;
  if (!semver.gte(curNodeVersion, LOWEST_NODE_VERSION)) {
    throw new Error(colors.red(`安装的node版本必须大于等于${LOWEST_NODE_VERSION}`))
  }
}


//检查是否是root账户启动(sudo 启动)实际就是判断processd uid的值.gid表示用户群组别,uid表示用户
function checkRoot() {
  log.test(process.getegid())
  const rootCheck = require('root-check')
  rootCheck();
  log.test(process.geteuid())
}


// 检查用户主目录
function checkUserHome() {
  log.test(userHome);
  if (!userHome || !pathExists(userHome)) {
    throw new Error(colors.red(`当前登录用户主目录不存在`))
  }
}

function checkEnv() {
  const dotEnv = require('dotenv');
  const dotEnvPath = path.resolve(userHome, '.env');
  let config = {};
  if (pathExists(dotEnvPath)) {
    config = dotEnv.config({
      path: dotEnvPath
    })
  }

  createDefaultCliConfig();
  log.verbose('环境变量', process.env.CLI_HOME)
}

function createDefaultCliConfig() {

  let cliConfig = {
    home: userHome
  }
  if (process.env.CLI_HOME_PATH) { //用户指定缓存路径

  }
  cliConfig['CLI_HOME_PATH'] = path.resolve(userHome, process.env.CLI_HOME_PATH || DEFAULT_CLI_HOME)
  process.env.CLI_HOME_PATH = cliConfig['CLI_HOME_PATH']
  return cliConfig
}


async function checkGlobalUpdate() {
  let { getSemverVersion } = require('@sj-cli-dev/get-npm-info');
  let curVersion = pkg.version;
  let npmName = pkg.name;
  let latestVersion = await getSemverVersion(npmName, curVersion);
  if (latestVersion) {
    log.info(`当前${npmName}过低,请全局安装最新版本${latestVersion}`)
  }
}


async function prepare(){
  checkPkgVersion()
  checkNodeVersion()
  checkRoot()
  checkUserHome()
  checkEnv();
  await checkGlobalUpdate()
}

module.exports = prepare