import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// 导入数据库工具
import { initializeDB, checkDBHealth } from './utils/initializeDB';
import { databaseService } from './utils/databaseService';
import { getDbType, DB_TYPE } from './utils/dbConfig';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 主函数
async function main() {
  console.log('正在初始化应用...');
  
  try {
    // 初始化数据库连接
    const dbInitialized = await initializeDB(DB_TYPE.BOTH);
    
    if (!dbInitialized) {
      console.error('数据库初始化失败，应用无法启动');
      process.exit(1);
    }
    
    // 检查数据库健康状态
    const healthStatus = await checkDBHealth();
    console.log('数据库健康状态:', JSON.stringify(healthStatus, null, 2));
    
    // 当前使用的数据库类型
    console.log('当前使用的数据库类型:', getDbType());
    
    // 示例：查询账本数据
    const queryResult = await databaseService.query('records', {
      filters: [
        { field: 'user_id', operator: 'eq', value: 'test_user' }
      ],
      orderBy: { field: 'created_at', direction: 'desc' }
    }, {
      limit: 10
    });
    
    console.log('查询结果:', queryResult.data);
    
    // 以下演示账本数据插入、更新、获取、删除的代码已自动注释，防止每次刷新自动添加演示数据
    /*
    // 示例：添加账本数据
    const newRecord = {
      name: '张三',
      date: '2025-04-28',
      project: '会计项目A',
      college: '商学院',
      transaction: '收入',
      amount: 2000,
      type: '工资',
      remark: '四月工资',
      user_id: 'test_user',
      created_at: new Date().toISOString()
    };
    
    const addResult = await databaseService.add('records', newRecord);
    console.log('addResult:', addResult); // 自动打印完整 addResult 便于排查
    console.log('新增账本结果:', addResult.data);
    
    if (addResult.data && addResult.data.id) {
      // 示例：更新账本数据
      const updateResult = await databaseService.update('records', addResult.data.id, {
        name: '张三（已更新）',
        remark: '工资补发',
        amount: 2200
      });
      console.log('更新账本结果:', updateResult);
      
      // 示例：获取账本数据
      const getResult = await databaseService.getById('records', addResult.data.id);
      console.log('获取账本结果:', getResult.data);
      
      // 示例：删除账本数据
      const removeResult = await databaseService.remove('records', addResult.data.id);
      console.log('删除账本结果:', removeResult);
    }
    */
    
    console.log('应用演示完成');
  } catch (error) {
    console.error('应用运行出错:', error);
  }
}

// 运行主函数
main().catch(error => {
  console.error('未捕获的错误:', error);
  process.exit(1);
});