import React, { useState, useRef } from "react";
import TableFilterDropdown from "./TableFilterDropdown";

export default function PaginatedTable({ data, pageSize = 20, onDelete, onEdit, page, setPage }) {
  const tableRef = useRef();
  const [jump, setJump] = useState("");
  // 默认按日期升序（旧到新）
  const [sort, setSort] = useState({ key: 'date', asc: true });
  const total = data.length;
  const pageCount = Math.ceil(total / pageSize);

  // 筛选状态
  const [filters, setFilters] = useState({}); // {name: ["张三"]}
  const [filterDropdown, setFilterDropdown] = useState({ key: '', anchor: null });

  const [editRow, setEditRow] = useState(null); // 当前编辑的行
  const [editData, setEditData] = useState({});

  // 页码受控
  const curPage = page || 1;
  const setCurPage = setPage || (()=>{});

  // 先筛选再排序
  let filteredData = data.filter(row => {
    return Object.entries(filters).every(([k, vals]) => {
      if (!vals || !vals.length) return true;
      return vals.includes(row[k] || '');
    });
  });
  let sortedData = [...filteredData];
  if (sort.key) {
    sortedData.sort((a, b) => {
      let va = a[sort.key] || '';
      let vb = b[sort.key] || '';
      if (sort.key === 'amount') {
        va = Number(va) || 0;
        vb = Number(vb) || 0;
      } else if (sort.key === 'date') {
        // 日期排序，兼容 2025/3/22 和 2025-03-22
        va = new Date((va||'').replace(/\//g, '-'));
        vb = new Date((vb||'').replace(/\//g, '-'));
      }
      if (va < vb) return sort.asc ? -1 : 1;
      if (va > vb) return sort.asc ? 1 : -1;
      return 0;
    });
  }
  const start = (curPage - 1) * pageSize;
  const end = Math.min(start + pageSize, filteredData.length);
  const pageData = sortedData.slice(start, end);

  function handleJump(e) {
    e.preventDefault();
    let val = jump.trim();
    if (!val) return;
    // 支持页码或关键字
    if (/^\d+$/.test(val)) {
      let p = Math.max(1, Math.min(pageCount, Number(val)));
      setCurPage(p);
    } else {
      // 按姓名、项目、备注等模糊查找，跳到第一个匹配项所在页
      const idx = data.findIndex(item => Object.values(item).some(v => String(v).includes(val)));
      if (idx >= 0) {
        setCurPage(Math.floor(idx / pageSize) + 1);
      } else {
        alert("未找到相关内容");
      }
    }
  }

  return (
    <div>
      <div style={{margin:"10px 0",display:"flex",alignItems:"center",gap:12,justifyContent:'flex-end'}}>
        <form onSubmit={handleJump} style={{display:'flex',gap:6,alignItems:'center'}}>
          <span>页码/关键词跳转</span>
          <input value={jump} onChange={e=>setJump(e.target.value)} style={{width:90}} placeholder="如3或张三"/>
          <button type="submit">跳转</button>
        </form>
        <span style={{marginLeft:16}}>
          共 {total} 条 | 第 {curPage} / {pageCount} 页
        </span>
      </div>
      <table ref={tableRef} border="1" cellPadding="6" style={{ width: "100%", position:'relative' }}>
        <thead>
          <tr>
            {[
              { label: '日期', key: 'date' },
              { label: '姓名', key: 'name' },
              { label: '项目', key: 'project' },
              { label: '学院', key: 'college' },
              { label: '备注', key: 'remark' },
              { label: '金额', key: 'amount' },
              { label: '类型', key: 'type' },
              { label: '操作', key: '' },
            ].map(col => (
              <th
                key={col.key || 'op'}
                style={{ cursor: col.key ? 'pointer' : 'default', background: sort.key === col.key ? '#e0f2fe' : undefined, position:'relative' }}
                onClick={col.key && col.key!=='' ? (e) => {
                  if (e.target.classList.contains('filter-btn')) return;
                  if (sort.key === col.key) {
                    setSort({ key: col.key, asc: !sort.asc });
                  } else {
                    setSort({ key: col.key, asc: true });
                  }
                  setCurPage(1);
                } : undefined}
              >
                <span>{col.label}</span>
                {/* 排序箭头 */}
                {col.key && sort.key === col.key && (
                  <span style={{ marginLeft: 2, fontSize: 13 }}>
                    {sort.asc ? '▲' : '▼'}
                  </span>
                )}
                {/* 筛选按钮 */}
                {col.key && col.key!=='' && (
                  <button
                    className="filter-btn"
                    style={{marginLeft:6,background:'#f1f5f9',border:'1px solid #bae6fd',borderRadius:4,padding:'0 4px',cursor:'pointer',fontSize:13,color:'#0ea5e9'}}
                    onClick={e => {
                      e.stopPropagation();
                      setFilterDropdown({ key: col.key, anchor: e.target });
                    }}
                  >筛选</button>
                )}
                {/* 筛选下拉 */}
                {filterDropdown.key === col.key && filterDropdown.anchor && (
                  <TableFilterDropdown
                    options={Array.from(new Set(data.map(row => row[col.key] || '')))}
                    value={filters[col.key] || []}
                    onChange={vals => setFilters(f => ({ ...f, [col.key]: vals }))}
                    onClose={() => setFilterDropdown({ key: '', anchor: null })}
                    anchor={filterDropdown.anchor}
                  />
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pageData.map(item => (
            <tr key={item._id}>
              <td>{item.date}</td>
              <td>{item.name}</td>
              <td>{item.project}</td>
              <td>{item.college}</td>
              <td>{item.remark || ''}</td>
              <td style={{color:item.type==='收入'?'#e15c5c':'#2ca46d',fontWeight:600}}>{item.amount}</td>
              <td>{item.type}</td>
              <td>
                {item._id && (
                  <>
                    <button onClick={() => onDelete(item._id)} style={{marginRight:8}}>删除</button>
                    <button onClick={() => { setEditRow(item._id); setEditData(item); }}>编辑</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* 编辑弹窗 */}
      {editRow && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'#0005',zIndex:99,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',padding:24,borderRadius:10,minWidth:320,boxShadow:'0 2px 16px #0002'}}>
            <h3 style={{marginTop:0}}>编辑账目</h3>
            <form onSubmit={e=>{e.preventDefault();onEdit && onEdit(editRow,editData);setEditRow(null);}}>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                <input value={editData.date||''} onChange={e=>setEditData(d=>({...d,date:e.target.value}))} type="date" required />
                <input value={editData.name||''} onChange={e=>setEditData(d=>({...d,name:e.target.value}))} placeholder="姓名" required />
                <input value={editData.project||''} onChange={e=>setEditData(d=>({...d,project:e.target.value}))} placeholder="项目" />
                <input value={editData.college||''} onChange={e=>setEditData(d=>({...d,college:e.target.value}))} placeholder="学院" />
                <input value={editData.remark||''} onChange={e=>setEditData(d=>({...d,remark:e.target.value}))} placeholder="备注" />
                <input value={editData.amount||''} onChange={e=>setEditData(d=>({...d,amount:e.target.value}))} type="number" placeholder="金额" required />
                <select value={editData.type||'收入'} onChange={e=>setEditData(d=>({...d,type:e.target.value}))}>
                  <option value="收入">收入</option>
                  <option value="支出">支出</option>
                </select>
              </div>
              <div style={{marginTop:18,display:'flex',gap:12,justifyContent:'flex-end'}}>
                <button type="button" onClick={()=>setEditRow(null)}>取消</button>
                <button type="submit" style={{background:'#409eff',color:'#fff',border:'none',borderRadius:6,padding:'6px 18px'}}>保存</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div style={{marginTop:10,display:'flex',gap:8,alignItems:'center',justifyContent:'center'}}>
        <button onClick={()=>setCurPage(1)} disabled={curPage===1}>首页</button>
        <button onClick={()=>setCurPage(p=>Math.max(1,p-1))} disabled={curPage===1}>上一页</button>
        <span>第 {curPage} / {pageCount} 页</span>
        <button onClick={()=>setCurPage(p=>Math.min(pageCount,p+1))} disabled={curPage===pageCount}>下一页</button>
        <button onClick={()=>setCurPage(pageCount)} disabled={curPage===pageCount}>末页</button>
      </div>
    </div>
  );
}
