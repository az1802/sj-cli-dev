'use strict';

const pkgDir = require('pkg-dir').sync;
const npmInstall = require('npminstall')
const pathExists = require('path-exists')
const fs = require('fs-extra')
const path = require('path');
const {getDefaultRegistry, getLatestVersion} = require('@sj-cli-dev/get-npm-info');
const {formatPath} = require("@sj-cli-dev/utils")
const log= require("@sj-cli-dev/log")

class Package {
  constructor(opts){
    if(!opts || typeof opts != 'object'){
      throw new Error(`Package类必须传递一个对象参数`)
    }
  
    this.targetPath = opts.targetPath;
    this.storeDir = opts.storeDir;
    this.packageName = opts.packageName;
    this.packageVersion = opts.packageVersion;
    this.cacheFilePathPrefix = this.packageName.replace('/','_')
  }

  // 安装Package
  async install(){
    await  this.prepare();
    return await npmInstall({
        root:this.targetPath,
        storeDir:this.storeDir,
        registry:getDefaultRegistry(),
        pkgs:[{
          name:this.packageName,
          version:this.packageVersion
        }]
      }).catch(err=>{
        console.error(`${this.packageName}模块.${this.packageVersion}版本安装出错`);
        return false
      })
  }

  // 更新Package
  async update(){
    await this.prepare();
    let latestVersion = await getLatestVersion(this.packageName);
    let filePath = await this.getSpecificCacheFilePath(this.packageName);
    if(!pathExists(filePath)){
      log.verbose('update',`更新${this.packageName}`)
      return await npmInstall({
        root:this.targetPath,
        storeDir:this.storeDir,
        registry:getDefaultRegistry(),
        pkgs:[{
          name:this.packageName,
          version:latestVersion
        }]
      }).catch(err=>{
        console.error(`${this.packageName}模块.${this.packageVersion}版本更新出错`);
        return false
      })
    }
  }

  // 获取入口文件的入径
  _getRootFilePath(targetPath){
    // 1. 获取package.json 所在目录 - pkg-dir
    // 2. 读取package.json内容
    // 3. 寻找main/lib 路径
    // 4.路径的兼容(macOs/window)
    if(!targetPath){
      throw new Error('目标路径不存在')
    }
    
    let packageDir  = pkgDir(targetPath); 
    if(packageDir){
      let pkgFile = require( path.resolve(packageDir,'package.json'));
      if(pkgFile && pkgFile.main){
        return formatPath(path.resolve(packageDir,pkgFile.main));//macos/window下路径的兼容
      }
    }
    return null
  }
  getRootFilePath(){
    if(this.storeDir){
      return this._getRootFilePath(this.cacheFilePath)
    }else{
      return this._getRootFilePath(this.targetPath)
    }
  }
  async prepare(){
    if(this.storeDir &&!pathExists(this.storeDir)){
      // 创建缓存目录
      fs.mkdirpSync(this.storeDir);
      log.verbose('cache','创建缓存目录')
    }
    if(this.packageVersion=='latest'){
      this.packageVersion = await getLatestVersion(this.packageName);
    }
  }
  get cacheFilePath(){
    // _find-up@3.0.0@find-up
    return path.resolve(this.storeDir,`_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`)
  }
  getSpecificCacheFilePath(version){
    return path.resolve(this.storeDir,`_${this.cacheFilePathPrefix}@${version}@${this.packageName}`)
  }
  async exists(){
    if(this.storeDir){ //本地缓存中安装
      await this.prepare();
      return pathExists(this.cacheFilePath)
     
    }else{//本地的路径是否存在即可
      return pathExists(this.targetPath)

    }
    return false;
  }

}



module.exports = Package;
