import React from "react";

export default function StatBar({ statType, setStatType, customRange, setCustomRange, stats }) {
  let typeText = '';
  if(statType==='day') typeText='今日';
  else if(statType==='month') typeText='本月';
  else if(statType==='quarter') typeText='本季度';
  else if(statType==='year') typeText='本年';
  else if(statType==='custom') typeText='区间';

  return (
    <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8,flexWrap:'wrap'}} className="stat-bar">
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
      <span style={{marginLeft:16}}>{typeText}收入：<span style={{color:'#2ca46d'}}>{stats.income}</span></span>
      <span>{typeText}支出：<span style={{color:'#e15c5c'}}>{stats.expense}</span></span>
    </div>
  );
}
