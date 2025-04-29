import React, { useState } from "react";
import * as XLSX from "xlsx";
// 已移除 cloudbaseRecords 相关内容

// 字段映射
const headerMap = {
  date: ["日期", "时间", "date"],
  name: ["姓名", "name"],
  project: ["项目", "类型", "project"],
  college: ["学校", "学院", "院校", "college"],
  transaction: ["交易方式", "方式", "transaction"],
  income: ["收入", "进账", "income"],
  expense: ["支出", "出账", "expense"],
  remark: ["备注", "说明", "remark"],
};
function pick(row, keys) {
  for (const k of keys) if (row[k] !== undefined) return row[k];
  return '';
}
function num(val) {
  if (typeof val === 'number') return val;
  if (typeof val === 'string' && val.trim() !== '') {
    const n = Number(val.replace(/[^\d.-]/g, ''));
    return isNaN(n) ? '' : n;
  }
  return '';
}

export default function ExcelImportPreview({ onImport }) {
  const [data, setData] = useState([]);
  const [report, setReport] = useState("");
  const [uploading, setUploading] = useState(false);

  // 处理Excel文件上传
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const wb = XLSX.read(evt.target.result, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json(ws, { defval: '', raw: false, range: 0, blankrows: false });
      const user_id = localStorage.getItem("username") || "default_user";
      // 智能标准化
      // 不再过滤任何缺失字段的行，全部导入，由用户人工修正
      // 一行有收入和支出时，分别生成两条账目（收入、支出各一条）
      const records = [];
      for (const row of raw) {
        const income = num(pick(row, headerMap.income));
        const expense = num(pick(row, headerMap.expense));
        const base = {
          date: String(pick(row, headerMap.date)).trim(),
          name: String(pick(row, headerMap.name)).trim(),
          project: String(pick(row, headerMap.project)).trim(),
          college: String(pick(row, headerMap.college)).trim(),
          transaction: String(pick(row, headerMap.transaction)).trim(),
          remark: String(pick(row, headerMap.remark)).trim(),
          user_id,
        };
        if (income) {
          records.push({ ...base, amount: income, type: '收入' });
        }
        if (expense) {
          records.push({ ...base, amount: expense, type: '支出' });
        }
      }
      setData(records);
      // 校验报告
      const invalid = records.filter(r => !r.date || !r.name || (!r.income && !r.expense));
      let rpt = `共解析到 ${records.length} 条记录。`;
      if (invalid.length) {
        rpt += `\n有 ${invalid.length} 条数据存在缺失（如无日期/姓名/金额），请人工核查修正。`;
      }
      setReport(rpt);
    };
    reader.readAsBinaryString(file);
  };

  // 编辑单元格
  const handleEdit = (idx, key, value) => {
    setData(data => data.map((row, i) => i === idx ? { ...row, [key]: value } : row));
  };

  // 删除行
  const handleDelete = (idx) => {
    setData(data => data.filter((_, i) => i !== idx));
  };

  // 批量导入
  const handleImport = async () => {
    setUploading(true);
    alert(`仅预览模式：未进行数据库写入。共读取 ${data.length} 条记录。`);
    setUploading(false);
    if (onImport) onImport();
  };

  return (
    <div style={{marginBottom:18}}>
      <label style={{display:'inline-block',padding:'8px 18px',borderRadius:10,background:'#f1f5f9',fontWeight:600,cursor:'pointer',boxShadow:'0 2px 10px #e0e7ef55'}}>
        📥 智能导入Excel账单
        <input type="file" accept=".xls,.xlsx" onChange={handleFile} style={{display:'none'}} disabled={uploading}/>
      </label>
      {data.length > 0 && (
        <div style={{background:'#fffbe6',border:'1px solid #ffe58f',borderRadius:8,padding:14,marginTop:12,fontSize:14}}>
          <b>人工核查与修正：</b>
          <div style={{overflowX:'auto',maxHeight:360}}>
            <table style={{borderCollapse:'collapse',width:'100%'}}>
              <thead>
                <tr style={{background:'#fffbe6'}}>
                  <th>日期</th><th>姓名</th><th>项目</th><th>学院</th><th>交易方式</th><th>收入</th><th>支出</th><th>备注</th><th>操作</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={idx} style={(!row.date||!row.name||(!row.income&&!row.expense))?{background:'#fff1f0'}:{}}>
                    {['date','name','project','college','transaction','income','expense','remark'].map(key => (
                      <td key={key} style={{border:'1px solid #ffe58f',padding:'2px 6px'}}>
                        <input value={row[key]||''} onChange={e=>handleEdit(idx,key,e.target.value)} style={{width:'90px',border:'none',background:'transparent'}}/>
                      </td>
                    ))}
                    <td><button onClick={()=>handleDelete(idx)} style={{color:'#f5222d',border:'none',background:'none',cursor:'pointer'}}>删除</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{color:'#b37f00',marginTop:8,whiteSpace:'pre-line'}}>{report}</div>
          <button onClick={handleImport} disabled={uploading} style={{marginTop:10,padding:'8px 18px',borderRadius:8,background:'#52c41a',color:'#fff',fontWeight:600,cursor:'pointer'}}>确认无误，一键导入</button>
        </div>
      )}
    </div>
  );
}
