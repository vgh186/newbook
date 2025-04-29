// 数据库健康检查脚本
const { checkDBHealth, initializeDB } = require('../utils/initializeDB');
const { DB_TYPE } = require('../utils/dbConfig');

// 获取命令行参数
const args = process.argv.slice(2);
const verbose = args.includes('--verbose');
const init = args.includes('--init');
let dbType = DB_TYPE.BOTH; // 默认检查两个数据库

// 解析命令行参数
if (args.includes('--supabase')) {
  dbType = DB_TYPE.SUPABASE;
} else if (args.includes('--cloudbase')) {
  dbType = DB_TYPE.CLOUDBASE;
}

// 主函数
async function main() {
  try {
    // 如果需要先初始化
    if (init) {
      console.log('正在初始化数据库...');
      const success = await initializeDB(dbType);
      if (!success) {
        console.error('数据库初始化失败');
        process.exit(1);
        return;
      }
    }
    
    // 执行健康检查
    console.log('正在检查数据库健康状态...');
    const healthStatus = await checkDBHealth();
    
    // 输出健康检查结果
    if (verbose) {
      console.log(JSON.stringify(healthStatus, null, 2));
    } else {
      console.log('总体状态:', healthStatus.overall.status);
      console.log('腾讯云:', healthStatus.cloudbase.status);
      console.log('Supabase:', healthStatus.supabase.status);
    }
    
    // 如果所有库都异常，则退出码为1
    if (healthStatus.overall.status === 'error') {
      console.error('数据库健康检查失败');
      process.exit(1);
    } else {
      console.log('数据库健康检查通过');
      process.exit(0);
    }
  } catch (error) {
    console.error('数据库健康检查过程中发生错误:', error);
    process.exit(1);
  }
}

// 执行主函数
main(); 