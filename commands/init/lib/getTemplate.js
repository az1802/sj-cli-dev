

const request = require("@sj-cli-dev/request");


async function getTemplate(){
 let res = await request.get('/template/getTemplate')
 if(res.status==200){
   return res.data;
 }
 return ;
}


module.exports = getTemplate;