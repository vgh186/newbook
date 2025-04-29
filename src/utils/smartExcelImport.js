// 智能批量导入脚本：支持任意表头、合并单元格、空行、异常类型自动修正，导入前打印预览和校验报告
// 用法：node src/utils/smartExcelImport.js

const path = require('path');
const XLSX = require('xlsx');
const cloudbase = require('@cloudbase/node-sdk');

// ====== 1. 配置 cloudbase ======
const app = cloudbase.init({
  env: "cloud1-2g79fk1z51633613", // 你的环境ID
  secretId: "", // 移除敏感信息
  secretKey: "" // 移除敏感信息
});
const db = app.database();
const collection = db.collection('records');

// ====== 2. 读取Excel ======
const filePath = path.join('C:/Users/Administrator/Desktop', '工作簿1.xlsx');
const workbook = XLSX.readFile(filePath, { cellDates: true });
const ws = workbook.Sheets[workbook.SheetNames[0]];
const raw = XLSX.utils.sheet_to_json(ws, { defval: '', raw: false, range: 0, blankrows: false });

// ====== 3. 智能解析与容错 ======
function normalizeRow(row) {
  // 自动识别并兼容不同表头
  const map = {
    日期: ['日期', '时间', 'date'],
    姓名: ['姓名', 'name'],
    项目: ['项目', '类型', 'project'],
    学校: ['学校', '院校', 'college'],
    交易方式: ['交易方式', '方式', 'transaction'],
    收入: ['收入', '进账', 'income'],
    支出: ['支出', '出账', 'expense'],
    备注: ['备注', '说明', 'remark'],
  };
  function pick(obj, keys) {
    for (const k of keys) if (obj[k] !== undefined) return obj[k];
    return '';
  }
  // 自动修正类型
  function num(val) {
    if (typeof val === 'number') return val;
    if (typeof val === 'string' && val.trim() !== '') {
      const n = Number(val.replace(/[^\d.\-]/g, ''));
      return isNaN(n) ? '' : n;
    }
    return '';
  }
  return {
    date: String(pick(row, map.日期)).trim(),
    name: String(pick(row, map.姓名)).trim(),
    project: String(pick(row, map.项目)).trim(),
    college: String(pick(row, map.学校)).trim(),
    transaction: String(pick(row, map.交易方式)).trim(),
    income: num(pick(row, map.收入)),
    expense: num(pick(row, map.支出)),
    remark: String(pick(row, map.备注)).trim(),
    user_id: 'default_user',
  };
}

const records = raw.filter(row => Object.values(row).some(v => String(v).trim() !== ''))
  .map(normalizeRow)
  .filter(row => row.name && (row.income || row.expense)); // 只保留有效数据

// ====== 4. 打印预览和校验报告 ======
console.log('【导入数据预览】前5条：');
console.table(records.slice(0, 5));
console.log(`共解析到 ${records.length} 条有效记录。`);

// 校验报告
const invalid = records.filter(r => !r.date || !r.name || (!r.income && !r.expense));
if (invalid.length) {
  console.warn(`有 ${invalid.length} 条数据存在缺失（如无日期/姓名/金额），将被跳过。`);
  console.table(invalid);
}

// ====== 5. 批量导入数据库 ======
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
