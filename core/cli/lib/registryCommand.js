
const {Command} = require('commander');
const pkg = require('../package.json')
const log = require('@sj-cli-dev/log')
const commandExecAction = require('@sj-cli-dev/exec')

let program = new Command()
function registryCommand() {

  program
    .name(Object.keys(pkg.bin)[0])
    .usage('<command> [options]')
    .version(pkg.version)
    .option('-d,--debug', '是否开启调试模式', false)
    .option('-f,--force', '是否强制执行', false)
    .option('-tp,--target-path <targetPath>', 'init命令的路径声明')

  program.on('option:debug', () => {
    let opts = program.opts();
    process.env.LOG_LEVEL = opts.debug ? "verbose" : "info";
    log.level = process.env.LOG_LEVEL;
    log.verbose('debug', '已开启调试模式');
  })

  // 声明initm命令
  program
    .command('init <projectName>')
    .option("-a,--atest <atest>",'测试options')
    .description('初始化项目')
    .action(commandExecAction)

  // 命令按照声明顺序匹配
  program.on('command:*', obj => {
    let availableCommands = program.commands.map(command => command.name());
    log.error(`未知命令${obj[0]}`)
    if (availableCommands.length > 0) {
      log.error(`可用命令${availableCommands.join(',')}`)
    }
  })

  program.on("option:target-path",(args)=>{
    if(args.length>0){
      process.env.CLI_TARGET_PATH = args
    }
  })

  if (program.argv && program.argv.length < 1) { //处理没有输入任何指令的情况
    program.outputHelp()
  } else {
    program.parse(process.argv)
  }
}


module.exports = registryCommand;
