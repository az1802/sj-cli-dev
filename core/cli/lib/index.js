'use strict';
module.exports = core;

const log = require('@sj-cli-dev/log')
const prepare = require('./prepare');
const registryCommand = require('./registryCommand')

async function core(args) {
  try {
    await prepare()
    registryCommand()
  } catch (err) {
    console.log(err.message)
    log.verbose("error", err)
  }

}
