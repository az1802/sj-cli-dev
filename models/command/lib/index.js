'use strict';

const log = require('@sj-cli-dev/log')



// 命令的超类用于执行所有命令的核心逻辑
class Command {
  constructor(...args){
    if(!args){
      log.error('指令参数不能为空')
    }
    this._argv = args;

    new Promise((resolve,reject)=>{
      let chain = Promise.resolve();
      chain = chain.then(()=>this._initArgs())
      chain = chain.then(()=>this.init())
      chain = chain.then(()=>this.exec())
      chain.catch(err=>{
        log.error(err.message);
      })
    })

  }
  _initArgs(){
    this._cmd = this._argv[this._argv.length - 1];
    this._argv = this._argv.slice(0,this._argv.length - 1)
  }
  init(){
    throw new Error('指令init方法必须实现')
  }
  exec(){
    throw new Error('指令exec必须实现')
  }
}

module.exports = Command;