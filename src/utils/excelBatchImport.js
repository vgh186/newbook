// excelBatchImport.js
// 一键解析并批量导入 C:\Users\Administrator\Desktop\工作簿1.xlsx 到云数据库

const path = require('path');
const XLSX = require('xlsx');
const cloudbase = require('@cloudbase/node-sdk');

// ====== 1. 配置 cloudbase ======
const app = cloudbase.init({
  env: "cloud1-2g79fk1z51633613", // 已自动填入你的环境ID
  secretId: "", // 已移除敏感密钥
  secretKey: "", // 已移除敏感密钥
});
const db = app.database();
const collection = db.collection('records');

// ====== 2. 读取Excel ======
const filePath = path.join('C:/Users/Administrator/Desktop', '工作簿1.xlsx');
const workbook = XLSX.readFile(filePath);
const ws = workbook.Sheets[workbook.SheetNames[0]];
const json = XLSX.utils.sheet_to_json(ws, { defval: '' });

// ====== 3. 解析并标准化数据 ======
const user_id = 'default_user'; // 如需指定请修改
const records = [];
for (const row of json) {
  // 兼容表头
  const base = {
    date: String(row['日期'] || '').trim(),
    name: String(row['姓名'] || '').trim(),
    project: String(row['项目'] || '').trim(),
    college: String(row['学校'] || '').trim(),
    remark: String(row['备注'] || '').trim(),
    user_id,
  };
  // 收入
  if (row['收入'] && !isNaN(Number(row['收入']))) {
    records.push({ ...base, amount: Number(row['收入']), type: '收入' });
  }
  // 支出
  if (row['支出'] && !isNaN(Number(row['支出']))) {
    records.push({ ...base, amount: Number(row['支出']), type: '支出' });
  }
}

console.log(`即将导入${records.length}条数据，预览前3条：`);
console.log(records.slice(0, 3));

// ====== 4. 批量写入数据库 ======
(async () => {
  let success = 0, fail = 0;
  for (const rec of records) {
    try {
      await collection.add(rec);
      success++;
    } catch (e) {
      fail++;
      console.error('导入失败:', rec, e.message);
    }
  }
  console.log(`导入完成！成功${success}条，失败${fail}条。`);
  process.exit(0);
})();
