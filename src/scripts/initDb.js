// 数据库初始化脚本
const { initializeDB } = require('../utils/initializeDB');
const { DB_TYPE } = require('../utils/dbConfig');

// 获取命令行参数
const args = process.argv.slice(2);
let dbType = DB_TYPE.CLOUDBASE; // 默认使用腾讯云数据库

// 解析命令行参数
if (args.includes('--supabase')) {
  dbType = DB_TYPE.SUPABASE;
} else if (args.includes('--cloudbase')) {
  dbType = DB_TYPE.CLOUDBASE;
} else if (args.includes('--both')) {
  dbType = DB_TYPE.BOTH;
}

// 显示初始化信息
console.log(`开始初始化数据库，类型: ${dbType}`);

// 执行初始化
initializeDB(dbType)
  .then((success) => {
    if (success) {
      console.log('数据库初始化成功');
      process.exit(0);
    } else {
      console.error('数据库初始化失败');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('数据库初始化过程中发生错误:', error);
    process.exit(1);
  }); 