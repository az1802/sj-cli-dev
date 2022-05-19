'use strict';
const path = require('path');
// 处理window与maasox环境下路径符的差异
function formatPath(p){
  if(p&&typeof p == 'string'){
    const sep = path.sep;
    if(sep === '/'){ //macos 下直接返回
      return p
    }else{
      return p.replace(/\\/g,'/')
    }
  }
  return p;
}

module.exports={
  formatPath
}