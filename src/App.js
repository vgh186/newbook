import React, { useState, useEffect } from "react";
import "./App.css";
import { addRecord, getRecords, deleteRecord, batchDeleteRecords, batchFixUserId, updateRecord } from "./utils/supabaseRecords";
import * as XLSX from "xlsx";
import { MoneyIcon, ExportIcon, UserIcon, LogoutIcon } from "./components/Icons";
import OverviewCards from "./components/OverviewCards";
import ExcelImport from "./components/ExcelImport";
import PaginatedTable from "./components/PaginatedTable";
import DbMigrationStatus from "./components/DbMigrationStatus";
import AccountForm from "./components/AccountForm";
import FilterForm from "./components/FilterForm";
import StatBar from "./components/StatBar";
import LoadingMask from "./components/LoadingMask";

function App() {
  const [, setUser] = useState(null);
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
  const [filter, setFilter] = useState({
    name: '',
    college: '',
    project: '',
    minAmount: '',
    maxAmount: '',
    startDate: '',
    endDate: '',
    remark: ''
  });
  const [statType, setStatType] = useState('month');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);

  function getStats(records) {
    const today = new Date().toISOString().slice(0, 10);
    const thisMonth = today.slice(0, 7);
    const thisYear = today.slice(0, 4);
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

  function handleFilterChange(e) {
    try {
      setFilter({ ...filter, [e.target.name]: e.target.value });
    } catch (error) {
      console.error('筛选功能出错:', error);
      setFilter({
        name: '',
        college: '',
        project: '',
        minAmount: '',
        maxAmount: '',
        startDate: '',
        endDate: '',
        remark: ''
      });
    }
  }

  useEffect(() => {
    if (localStorage.getItem("isLogin") === "true") {
      setUser(true);
      fetchRecords();
    }
  }, []);

  async function fetchRecords() {
    setLoading(true);
    try {
      const res = await getRecords();
      setRecords(res.data || []);
    } catch (error) {
      console.error('获取账目失败:', error);
      alert('获取账目失败：' + (error.message || error));
    }
    setLoading(false);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleAdd(e) {
    e.preventDefault();
    const user_id = localStorage.getItem("username") || "default_user";
    const record = { ...form, user_id, amount: Number(form.amount) };
    try {
      console.log("添加账目时传递的数据：", record);
      const res = await addRecord(record);
      console.log("addRecord 返回值：", res);
      setForm({ date: "", name: "", project: "", college: "", remark: "", amount: "", type: "收入" });
      fetchRecords();
    } catch (error) {
      console.error('添加账目失败:', error);
      alert('添加账目失败：' + (error.message || error));
    }
  }

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

  async function handleEdit(id, newData) {
    setLoading(true);
    try {
      await updateRecord(id, newData);
      fetchRecords();
    } catch (error) {
      alert('保存失败：' + (error.message || error));
    }
    setLoading(false);
  }

  const handleMigrationComplete = (success, errorMessage) => {
    if (success) {
      alert('数据迁移成功！');
      fetchRecords();
    } else if (errorMessage) {
      alert(`数据迁移失败: ${errorMessage}`);
    }
  };

  const getFilteredRecords = () => {
    try {
      let filtered = records.filter(item => {
        if (!item) return false;
        if (filter.name && (!item.name || !item.name.includes(filter.name))) return false;
        if (filter.college && (!item.college || !item.college.includes(filter.college))) return false;
        if (filter.project && (!item.project || !item.project.includes(filter.project))) return false;
        if (filter.remark && (!item.remark || !item.remark.includes(filter.remark))) return false;
        if (filter.minAmount && Number(item.amount) < Number(filter.minAmount)) return false;
        if (filter.maxAmount && Number(item.amount) > Number(filter.maxAmount)) return false;
        if (filter.startDate && (!item.date || item.date < filter.startDate)) return false;
        if (filter.endDate && (!item.date || item.date > filter.endDate)) return false;
        return true;
      });
      return filtered;
    } catch (error) {
      console.error('筛选数据出错:', error);
      return [];
    }
  };

  return (
    <div>
      <div className="top-right">
        <button style={{fontWeight:600}} onClick={() => {
          localStorage.clear();
          window.location.reload();
        }}><LogoutIcon />退出登录</button>
      </div>
      <div className="main-card" style={{boxShadow:'0 8px 32px #dbeafe99',border:'1.5px solid #e0e7ef',paddingTop:28}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16,justifyContent:'center'}}>
          <MoneyIcon />
          <span style={{fontSize:25,fontWeight:700,letterSpacing:1.5,color:'#1e293b'}}>云端智能记账本</span>
        </div>
        <DbMigrationStatus onMigrationComplete={handleMigrationComplete} />
        <ExcelImport onImport={fetchRecords} />
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
        {(() => {
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
        <AccountForm form={form} onChange={handleChange} onSubmit={handleAdd} loading={loading} />
        <StatBar statType={statType} setStatType={setStatType} customRange={customRange} setCustomRange={setCustomRange} stats={getStats(getFilteredRecords())} />
        <FilterForm filter={filter} onChange={handleFilterChange} onReset={() => setFilter({ name: '', college: '', project: '', minAmount: '', maxAmount: '', startDate: '', endDate: '', remark: '' })} />
        <div style={{marginBottom:20,display:'flex',justifyContent:'flex-end'}}>
          <button style={{fontSize:16,padding:'8px 22px',fontWeight:600,boxShadow:'0 2px 10px #dbeafe77'}} onClick={() => {
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
              if (!records.length) return alert('暂无数据可备份！');
              const XLSX = window.XLSX || require('xlsx');
              const ws = XLSX.utils.json_to_sheet(records.map(({_id, ...r})=>r));
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, "账目备份");
              XLSX.writeFile(wb, `账本备份_${new Date().toISOString().slice(0,10)}.xlsx`);
            }}
          >一键备份</button>
        </div>
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
        <LoadingMask show={loading} />
        <div className="table-wrapper">
          <PaginatedTable
            data={getFilteredRecords()}
            pageSize={20}
            onDelete={handleDelete}
            onEdit={handleEdit}
            page={currentPage}
            setPage={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}

export default App;