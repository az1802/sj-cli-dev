#! /usr/bin/env node


const importLocal = require('import-local')
if(importLocal(__filename)){
  require("npmlog").info('cli','正在使用本地的sj-cli-dev版本')
}else{
  require("../lib")(process.argv.slice(2));
}