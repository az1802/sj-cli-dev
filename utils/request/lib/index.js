'use strict';
const axios = require('axios')


const BASE_URL = process.env.SJ_CLI_BASE_URL ?  process.env.SJ_CLI_BASE_URL : "http://www.sunj.com"
const port = "7001"; 

const request = axios.create({
  baseURL :`${BASE_URL}:${port}`,
  time:5000
})

module.exports = request;