'use strict';


const Package = require('@sj-cli-dev/package');
const log = require('@sj-cli-dev/log')
const path = require('path');
const userHome = require('user-home');
const pathExists = require('path-exists').sync
const {spawn} = require('child_process');

const CACHE_DIR = 'dependencies'
const PACKAGE_SETTING_MAP = {
  "init" : "@sj-cli-dev/init" , // /Users/m1pro/Desktop/mine/sj-main-project/sj-cli-dev/commands/init
}

async function getCommandPackage(cmdInstance){
  const homePath = process.env.CLI_HOME_PATH;
  let targetPath =  process.env.CLI_TARGET_PATH; //指令库所在的路径地址
  
  let cmdName = cmdInstance.name();
  let packageName = PACKAGE_SETTING_MAP[cmdName];
  let packageVersion = 'latest';
  let storeDir = '',pkg;

 
  if(!targetPath){ // 根据本地缓存路径加载查找模块地址
    targetPath = path.resolve(userHome,homePath,CACHE_DIR);
    storeDir = path.resolve(targetPath,"node_modules");
    log.verbose('init指令库 缓存路径',storeDir);

    pkg = new Package({
      targetPath,
      storeDir,
      packageName,
      packageVersion
    })

    if(await pkg.exists()){
      // 更新package
      pkg.update()
    }else{
      // 安装package到全局缓存目录
     await pkg.install()
    }
  }else{ //使用本地的命令包
    pkg = new Package({
      targetPath,
      packageName:'find-up',
      packageVersion:'^3.0.0'
    })
  }
  log.verbose('targetPath',targetPath);
  log.verbose('homePath',homePath);

  return pkg

}

function cloneSimpleCmdInstance(cmdInstance){
  const o = Object.create(null);
  for(let key in cmdInstance){
    if(cmdInstance.hasOwnProperty(key)&&!key.startsWith('_')&&key!='parent'){
      o[key] = cmdInstance[key];
    }
  } 
  return o;
}

// TODO 利用多线程进行命令的加载和执行 提升性能
async function forkCommandExec(args,loadFilePath){
      args[args.length -1] = cloneSimpleCmdInstance(args[args.length -1]);
      //wimdpow 平台下 执行的是  spawn('cmd',['/c','node','-e',code])
      let code = `require('${loadFilePath}').call(null,${JSON.stringify(args)})`
      let child = spawn('node',['-e',code],{
        cwd:process.cwd(),
        stdio:"inherit"
      })
      child.on('error',e=>{
        log.error(e.message);
        process.exit(1);

      })
      child.on('exit',e=>{
        log.verbose(e == 0 ? '命令执行成功' : "命令执行失败");
        process.exit(e)
      })
}

async function exec(...args) {
  
  let targetPath =  process.env.CLI_TARGET_PATH;
  const homePath = process.env.CLI_HOME_PATH;

  let pkg = await getCommandPackage(args[args.length-1]);

  // 运行入口文件,即执行指令运行
  let rootFile = pkg.getRootFilePath(); 
  if(rootFile&&pathExists(rootFile)){
    try{
      require(rootFile).apply(null,args);
      forkCommandExec(args,rootFile)
    }catch(err){
      console.log('err: ', err);
    }
  }
}

module.exports = exec;