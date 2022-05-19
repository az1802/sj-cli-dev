'use strict';

const log = require('npmlog')
log.level= process.env.LOG_LEVEL || 'info';
log.addLevel('test',100,{color:'yellow'})

module.exports = log;
