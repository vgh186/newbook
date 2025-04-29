import React, { useState, useEffect } from "react";
// import app from "./utils/cloudbase"; // 已弃用
import "./App.css";
// import PhoneAuth from './components/PhoneAuth';
import { addRecord, getRecords, deleteRecord, batchDeleteRecords, batchFixUserId } from "./utils/supabaseRecords"; // 只用 supabase
import * as XLSX from "xlsx";
import { MoneyIcon, ExportIcon, UserIcon, LogoutIcon } from "./components/Icons";
import OverviewCards from "./components/OverviewCards";
import ExcelImport from "./components/ExcelImport";
import PaginatedTable from "./components/PaginatedTable";
import DbMigrationStatus from "./components/DbMigrationStatus";

function App() {
  const [, setUser] = useState(null); // 只声明 setUser，避免 unused-vars
  // 页面加载时自动查数据库
  useEffect(() => {
    async function fetchAllRecords() {
      try {
        const result = await getRecords();
        setRecords(result.data);
      } catch (err) {
        console.error('自动查询账本数据失败:', err);
      }
    }
    fetchAllRecords();
  }, []);
  
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({
    date: "",
    name: "",
    project: "",
    college: "",
    remark: "",
    amount: "",
    type: "收入"
  });
  const [loading, setLoading] = useState(false);

  // 新增：筛选条件
  const [filter, setFilter] = useState({
    name: '',
    college: '',
    project: '',
    minAmount: '',
    maxAmount: '',
    startDate: '',
    endDate: '',
    remark: '' // 新增备注筛选
  });

  // 统计类型：日、月、年、季度、自定义区间
  const [statType, setStatType] = useState('month'); // 默认按月统计
  const [customRange, setCustomRange] = useState({ start: '', end: '' });

  // 新增状态：当前使用的数据库类型
  // 只用 supabase，不再区分 dbType
  // const currentDbType = 'supabase'; // 注释掉未使用的变量

  // 新增：统计信息
  function getStats(records) {
    const today = new Date().toISOString().slice(0, 10);
    const thisMonth = today.slice(0, 7);
    const thisYear = today.slice(0, 4);
    // 获取本季度范围
    const monthNum = parseInt(today.slice(5, 7), 10);
    let quarterStartMonth = Math.floor((monthNum - 1) / 3) * 3 + 1;
    let quarterEndMonth = quarterStartMonth + 2;
    let quarterStart = `${thisYear}-${String(quarterStartMonth).padStart(2, '0')}-01`;
    let quarterEnd = `${thisYear}-${String(quarterEndMonth).padStart(2, '0')}-31`;

    let income = 0, expense = 0;
    records.forEach(item => {
      if (!item.date) return;
      if (statType === 'day') {
        if (item.date === today) {
          if (item.type === '收入') income += Number(item.amount);
          if (item.type === '支出') expense += Number(item.amount);
        }
      } else if (statType === 'month') {
        if (typeof item.date === 'string' && item.date.startsWith(thisMonth)) {
          if (item.type === '收入') income += Number(item.amount);
          if (item.type === '支出') expense += Number(item.amount);
        }
      } else if (statType === 'year') {
        if (typeof item.date === 'string' && item.date.startsWith(thisYear)) {
          if (item.type === '收入') income += Number(item.amount);
          if (item.type === '支出') expense += Number(item.amount);
        }
      } else if (statType === 'quarter') {
        if (item.date >= quarterStart && item.date <= quarterEnd) {
          if (item.type === '收入') income += Number(item.amount);
          if (item.type === '支出') expense += Number(item.amount);
        }
      } else if (statType === 'custom') {
        if (
          (!customRange.start || item.date >= customRange.start) &&
          (!customRange.end || item.date <= customRange.end)
        ) {
          if (item.type === '收入') income += Number(item.amount);
          if (item.type === '支出') expense += Number(item.amount);
        }
      }
    });
    return { income, expense };
  }

  // 新增：筛选输入处理
  function handleFilterChange(e) {
    try {
      setFilter({ ...filter, [e.target.name]: e.target.value });
    } catch (error) {
      console.error('筛选功能出错:', error);
      // 如果出错，清空筛选条件
      setFilter({
        name: '',
        college: '',
        project: '',
        minAmount: '',
        maxAmount: '',
        startDate: '',
        endDate: '',
        remark: '' // 新增备注筛选
      });
    }
  }

  // 已切换为 Supabase，不再需要 cloudbase 匿名登录 useEffect

  // 登录状态检查
  useEffect(() => {
    if (localStorage.getItem("isLogin") === "true") {
      setUser(true);
      fetchRecords();
    }
  }, []);

  // 获取账目
  async function fetchRecords() {
    setLoading(true);
    try {
      // 全量获取所有账目，不做任何过滤
      const res = await getRecords();
      setRecords(res.data || []);
    } catch (error) {
      console.error('获取账目失败:', error);
      alert('获取账目失败：' + (error.message || error));
    }
    setLoading(false);
  }

  // 表单输入处理
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // 添加账目
  async function handleAdd(e) {
    e.preventDefault();
    const user_id = localStorage.getItem("username") || "default_user";
    const record = { ...form, user_id, amount: Number(form.amount) };
    try {
      console.log("添加账目时传递的数据：", record); // 新增调试打印
      const res = await addRecord(record);
      console.log("addRecord 返回值：", res); // 新增调试打印
      setForm({ date: "", name: "", project: "", college: "", remark: "", amount: "", type: "收入" });
      fetchRecords();
    } catch (error) {
      console.error('添加账目失败:', error);
      alert('添加账目失败：' + (error.message || error));
    }
  }

  // 删除账目
  async function handleDelete(id) {
    if (!id) {
      alert("删除失败：账目ID不存在！");
      return;
    }
    setLoading(true);
    try {
      await deleteRecord(id);
      fetchRecords();
    } catch (error) {
      console.error('删除账目失败:', error);
      alert("删除失败：" + (error.message || error));
    }
    setLoading(false);
  }

  // 已切换为 Supabase，不再需要数据库类型切换
  
  // 数据迁移完成的回调函数
  const handleMigrationComplete = (success, errorMessage) => {
    if (success) {
      alert('数据迁移成功！');
      fetchRecords(); // 刷新数据
    } else if (errorMessage) {
      alert(`数据迁移失败: ${errorMessage}`);
    }
  };

  // 确保筛选数据安全
  const getFilteredRecords = () => {
    try {
      return records.filter(item => {
        if (!item) return false;
        if (filter.name && (!item.name || !item.name.includes(filter.name))) return false;
        if (filter.college && (!item.college || !item.college.includes(filter.college))) return false;
        if (filter.project && (!item.project || !item.project.includes(filter.project))) return false;
        if (filter.remark && (!item.remark || !item.remark.includes(filter.remark))) return false; // 新增备注筛选
        if (filter.minAmount && Number(item.amount) < Number(filter.minAmount)) return false;
        if (filter.maxAmount && Number(item.amount) > Number(filter.maxAmount)) return false;
        if (filter.startDate && (!item.date || item.date < filter.startDate)) return false;
        if (filter.endDate && (!item.date || item.date > filter.endDate)) return false;
        return true;
      });
    } catch (error) {
      console.error('筛选数据出错:', error);
      return [];
    }
  };

  // 直接渲染主界面，不再判断 user，不再显示 PhoneAuth

  return (
    <div>
      <div className="top-right">
        <button style={{fontWeight:600}} onClick={() => {
          localStorage.clear();
          window.location.reload();
        }}><LogoutIcon />退出登录</button>
      </div>
      <div className="main-card" style={{boxShadow:'0 8px 32px #dbeafe99',border:'1.5px solid #e0e7ef',paddingTop:28}}>
        {/* 顶部LOGO+标题 */}
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16,justifyContent:'center'}}>
          <MoneyIcon />
          <span style={{fontSize:25,fontWeight:700,letterSpacing:1.5,color:'#1e293b'}}>云端智能记账本</span>
        </div>
        

        
        {/* 数据迁移组件 */}
        <DbMigrationStatus onMigrationComplete={handleMigrationComplete} />
        
        {/* Excel导入按钮 */}
        <ExcelImport onImport={fetchRecords} />
        
        {/* 批量操作按钮区块 */}
        <div style={{margin:'10px 0 18px 0',display:'flex',gap:16,justifyContent:'center'}}>
          <button style={{background:'#e15c5c',color:'#fff'}} onClick={async()=>{
            if(window.confirm('确定要批量删除所有账目吗？此操作不可恢复！')){
              setLoading(true);
              await batchDeleteRecords();
              fetchRecords();
              setLoading(false);
            }
          }}>批量删除全部账目</button>
          <button style={{background:'#409eff',color:'#fff'}} onClick={async()=>{
            setLoading(true);
            const user_id = localStorage.getItem("username") || "default_user";
            const count = await batchFixUserId(user_id);
            alert(`已修正${count}条历史账目user_id！`);
            fetchRecords();
            setLoading(false);
          }}>批量修正历史user_id</button>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:24,justifyContent:'center'}}>
          <UserIcon />
          <span style={{fontSize:17,color:'#64748b'}}>欢迎，您已登录！</span>
        </div>
        {/* 首页总览卡片区块 */}
        {(() => {
          // 统计本月/本年收入支出
          const today = new Date().toISOString().slice(0, 10);
          const thisMonth = today.slice(0, 7);
          const thisYear = today.slice(0, 4);
          let monthIncome = 0, monthExpense = 0, yearIncome = 0, yearExpense = 0;
          records.forEach(item => {
            if (!item.date || typeof item.date !== 'string') return;
            if (typeof item.date === 'string' && item.date.startsWith(thisMonth)) {
              if (item.type === '收入') monthIncome += Number(item.amount);
              if (item.type === '支出') monthExpense += Number(item.amount);
            }
            if (typeof item.date === 'string' && item.date.startsWith(thisYear)) {
              if (item.type === '收入') yearIncome += Number(item.amount);
              if (item.type === '支出') yearExpense += Number(item.amount);
            }
          });
          return <OverviewCards stats={{ monthIncome, monthExpense, yearIncome, yearExpense }} />;
        })()}

        <form onSubmit={handleAdd} style={{ marginBottom: 20 }}>
          <input name="date" type="date" value={form.date} onChange={handleChange} required />
          <input name="name" placeholder="姓名" value={form.name} onChange={handleChange} required />
          <input name="project" placeholder="项目" value={form.project} onChange={handleChange} />
          <input name="college" placeholder="学院" value={form.college} onChange={handleChange} />
          <input name="remark" placeholder="备注" value={form.remark} onChange={handleChange} />
          <input name="amount" type="number" placeholder="金额" value={form.amount} onChange={handleChange} required />
          <select name="type" value={form.type} onChange={handleChange}>
            <option value="收入">收入</option>
            <option value="支出">支出</option>
          </select>
          <button type="submit" disabled={loading}>添加账目</button>
        </form>
        {/* 新增：筛选表单 */}
          {/* 新增：统计类型选择 */}
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
            <span style={{fontWeight:500}}>统计类型：</span>
            <select value={statType} onChange={e=>setStatType(e.target.value)} style={{padding:'4px 12px',borderRadius:6}}>
              <option value="day">按日</option>
              <option value="month">按月</option>
              <option value="quarter">按季度</option>
              <option value="year">按年</option>
              <option value="custom">自定义区间</option>
            </select>
            {statType==='custom' && (
              <>
                <input type="date" value={customRange.start} onChange={e=>setCustomRange({...customRange,start:e.target.value})} style={{width:120}}/>
                <span>至</span>
                <input type="date" value={customRange.end} onChange={e=>setCustomRange({...customRange,end:e.target.value})} style={{width:120}}/>
              </>
            )}
          </div>
          {/* 新增：统计信息展示 */}
          {(() => {
            const filtered = getFilteredRecords();
            const stats = getStats(filtered);
            let typeText = '';
            if(statType==='day') typeText='今日';
            else if(statType==='month') typeText='本月';
            else if(statType==='quarter') typeText='本季度';
            else if(statType==='year') typeText='本年';
            else if(statType==='custom') typeText='区间';
            return (
              <div style={{
                display: 'flex', gap: 24, marginBottom: 10, background: '#f8fafc', borderRadius: 10, padding: '10px 16px', fontWeight: 500, fontSize: 15, color: '#333', boxShadow: '0 1px 5px #eef2f5'
              }}>
                <span>{typeText}收入：<span style={{color:'#2ca46d'}}>{stats.income}</span></span>
                <span>{typeText}支出：<span style={{color:'#e15c5c'}}>{stats.expense}</span></span>
              </div>
            );
          })()}
          <form style={{ marginBottom: 10, display: 'flex', gap: 8 }} onSubmit={e => e.preventDefault()}>
            <input
              name="name"
              placeholder="筛选姓名"
              value={filter.name}
              onChange={handleFilterChange}
              style={{ width: 70 }}
            />
            <input
              name="college"
              placeholder="筛选学院"
              value={filter.college}
              onChange={handleFilterChange}
              style={{ width: 90 }}
            />
            <input
              name="project"
              placeholder="筛选项目"
              value={filter.project}
              onChange={handleFilterChange}
              style={{ width: 90 }}
            />
            <input
              name="remark"
              placeholder="筛选备注"
              value={filter.remark}
              onChange={handleFilterChange}
              style={{ width: 100 }}
            />
            <input
              name="minAmount"
              type="number"
              placeholder="最小金额"
              value={filter.minAmount}
              onChange={handleFilterChange}
              style={{ width: 80 }}
            />
            <input
              name="maxAmount"
              type="number"
              placeholder="最大金额"
              value={filter.maxAmount}
              onChange={handleFilterChange}
              style={{ width: 80 }}
            />
            {/* 新增：日期范围筛选 */}
            <input
              name="startDate"
              type="date"
              placeholder="开始日期"
              value={filter.startDate}
              onChange={handleFilterChange}
              style={{ width: 120 }}
            />
            <input
              name="endDate"
              type="date"
              placeholder="结束日期"
              value={filter.endDate}
              onChange={handleFilterChange}
              style={{ width: 120 }}
            />
            <input
              name="college"
              placeholder="筛选学院"
              value={filter.college}
              onChange={handleFilterChange}
              style={{ width: 90 }}
            />
            <input
              name="project"
              placeholder="筛选项目"
              value={filter.project}
              onChange={handleFilterChange}
              style={{ width: 90 }}
            />
            <input
              name="remark"
              placeholder="筛选备注"
              value={filter.remark}
              onChange={handleFilterChange}
              style={{ width: 100 }}
            />
            <input
              name="minAmount"
              type="number"
              placeholder="最小金额"
              value={filter.minAmount}
              onChange={handleFilterChange}
              style={{ width: 80 }}
            />
            <input
              name="maxAmount"
              type="number"
              placeholder="最大金额"
              value={filter.maxAmount}
              onChange={handleFilterChange}
              style={{ width: 80 }}
            />
            <button type="button" onClick={() => setFilter({ name: '', college: '', project: '', minAmount: '', maxAmount: '' })}>重置筛选</button>
          </form>
           {/* 只保留导出Excel报表按钮 */}
           <div style={{marginBottom:20,display:'flex',justifyContent:'flex-end'}}>
            <button style={{fontSize:16,padding:'8px 22px',fontWeight:600,boxShadow:'0 2px 10px #dbeafe77'}} onClick={() => {
              // 导出当前筛选后的数据为Excel
              const filtered = getFilteredRecords();
              const ws = XLSX.utils.json_to_sheet(filtered);
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, "账目明细");
              XLSX.writeFile(wb, `账目明细导出_${new Date().toISOString().slice(0,10)}.xlsx`);
            }}><ExportIcon />导出Excel报表</button>
          </div>

           <div style={{display:'flex',alignItems:'center',gap:16,margin:'18px 0 8px 0'}}>
             <h3 style={{display:'flex',alignItems:'center',gap:8,fontSize:20,fontWeight:700,color:'#334155',margin:0}}><MoneyIcon />账目列表</h3>
             <button style={{background:'#38bdf8',color:'#fff',fontWeight:600,padding:'6px 18px',border:'none',borderRadius:8,boxShadow:'0 2px 8px #bae6fd',fontSize:15,cursor:'pointer'}}
               onClick={() => {
                 // 备份导出所有账目为Excel
                 if (!records.length) return alert('暂无数据可备份！');
                 const XLSX = window.XLSX || require('xlsx');
                 const ws = XLSX.utils.json_to_sheet(records.map(({_id, ...r})=>r));
                 const wb = XLSX.utils.book_new();
                 XLSX.utils.book_append_sheet(wb, ws, "账目备份");
                 XLSX.writeFile(wb, `账本备份_${new Date().toISOString().slice(0,10)}.xlsx`);
               }}
             >一键备份</button>
           </div> 
        {/* 总收入/总支出统计条 */}
        {(() => {
          const filtered = getFilteredRecords();
          const totalIncome = filtered.filter(i=>i.type==="收入").reduce((s,i)=>s+Number(i.amount||0),0);
          const totalExpense = filtered.filter(i=>i.type==="支出").reduce((s,i)=>s+Number(i.amount||0),0);
          return (
            <div style={{
              display:'flex',justifyContent:'center',gap:36,margin:'18px 0 12px 0',padding:'14px 36px',
              background:'linear-gradient(90deg,#f0fdfa 0%,#f1f5f9 100%)',
              borderRadius:12,boxShadow:'0 2px 12px #e0f2fe55',fontSize:18,fontWeight:700
            }}>
              <span style={{color:'#16a34a'}}>总收入：<span style={{fontSize:22,color:'#22c55e'}}>{totalIncome}</span></span>
              <span style={{color:'#e11d48'}}>总支出：<span style={{fontSize:22,color:'#fb7185'}}>{totalExpense}</span></span>
            </div>
          );
        })()}
        {loading ? <div>加载中...</div> : (
          <PaginatedTable
            data={getFilteredRecords()}
            pageSize={20}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}

export default App;