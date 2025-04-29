import React, { useState, useRef } from "react";
import TableFilterDropdown from "./TableFilterDropdown";

export default function PaginatedTable({ data, pageSize = 20, onDelete }) {
  const tableRef = useRef();
  const [page, setPage] = useState(1);
  const [jump, setJump] = useState("");
  const [sort, setSort] = useState({ key: '', asc: true });
  const total = data.length;
  const pageCount = Math.ceil(total / pageSize);

  // 筛选状态
  const [filters, setFilters] = useState({}); // {name: ["张三"]}
  const [filterDropdown, setFilterDropdown] = useState({ key: '', anchor: null });

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
      }
      if (va < vb) return sort.asc ? -1 : 1;
      if (va > vb) return sort.asc ? 1 : -1;
      return 0;
    });
  }
  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, filteredData.length);
  const pageData = sortedData.slice(start, end);

  function handleJump(e) {
    e.preventDefault();
    let val = jump.trim();
    if (!val) return;
    // 支持页码或关键字
    if (/^\d+$/.test(val)) {
      let p = Math.max(1, Math.min(pageCount, Number(val)));
      setPage(p);
    } else {
      // 按姓名、项目、备注等模糊查找，跳到第一个匹配项所在页
      const idx = data.findIndex(item => Object.values(item).some(v => String(v).includes(val)));
      if (idx >= 0) {
        setPage(Math.floor(idx / pageSize) + 1);
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
          共 {total} 条 | 第 {page} / {pageCount} 页
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
                  setPage(1);
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
                  <button onClick={() => onDelete(item._id)}>
                    删除
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{marginTop:10,display:'flex',gap:8,alignItems:'center',justifyContent:'center'}}>
        <button onClick={()=>setPage(1)} disabled={page===1}>首页</button>
        <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>上一页</button>
        <span>第 {page} / {pageCount} 页</span>
        <button onClick={()=>setPage(p=>Math.min(pageCount,p+1))} disabled={page===pageCount}>下一页</button>
        <button onClick={()=>setPage(pageCount)} disabled={page===pageCount}>末页</button>
      </div>
    </div>
  );
}
