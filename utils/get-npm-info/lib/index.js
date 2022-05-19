'use strict';

const axios = require('axios');
const semver = require('semver');
const urlJoin = require('url-join');

async function getNpmInfo(npmName,registry) {
  if(!npmName){
    return null;
  }
  let npmInfoUrl = urlJoin(registry,npmName);
  let res = await axios.get(npmInfoUrl);
  if(res.status==200){
    return res.data;
  }else {
    return {}
  }

}

function getDefaultRegistry(isOriginal=false){
  return isOriginal ? 'https://resgistry.npmjs.org' : 'https://registry.npmmirror.com'
}


async function getNpmVersions(npmName,registry = getDefaultRegistry() ){
  if(!npmName){return {}}
  let npmPkgInfo = await getNpmInfo(npmName,registry).catch(err=>{
    console.error(`npm上未查询到${npmName}模块`);
    return {}
  })

  return Object.keys(npmPkgInfo.versions || {});
}

async function getSemverVersions(npmName,baseVersion){
  let semverVersions = await getNpmVersions(npmName);
  return semverVersions.filter(version=>{
    return semver.satisfies(version,`>=${baseVersion}`);
  }).sort((a,b)=>{
    return semver.gte(a,b) ? -1 : 1;
  })

}

async function getSemverVersion(npmName,baseVersion='0.0.0'){
  let highVersions = await getSemverVersions(npmName,baseVersion);
  return highVersions[0] || false;
}

async function getLatestVersion(npmName){
  let vsesions = await getNpmVersions(npmName);
  return vsesions.sort((a,b)=>{
    return semver.gte(a,b) ? -1 : 1;
  })[0] || null
}




module.exports = {
  getSemverVersion,
  getDefaultRegistry,
  getLatestVersion
};
