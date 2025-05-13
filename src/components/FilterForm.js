import React from "react";

export default function FilterForm({ filter, onChange, onReset }) {
  return (
    <form style={{ marginBottom: 10, display: 'flex', gap: 8 }} onSubmit={e => e.preventDefault()}>
      <input name="name" placeholder="筛选姓名" value={filter.name} onChange={onChange} style={{ width: 70 }} />
      <input name="college" placeholder="筛选学院" value={filter.college} onChange={onChange} style={{ width: 90 }} />
      <input name="project" placeholder="筛选项目" value={filter.project} onChange={onChange} style={{ width: 90 }} />
      <input name="remark" placeholder="筛选备注" value={filter.remark} onChange={onChange} style={{ width: 100 }} />
      <input name="minAmount" type="number" placeholder="最小金额" value={filter.minAmount} onChange={onChange} style={{ width: 80 }} />
      <input name="maxAmount" type="number" placeholder="最大金额" value={filter.maxAmount} onChange={onChange} style={{ width: 80 }} />
      <input name="startDate" type="date" placeholder="开始日期" value={filter.startDate} onChange={onChange} style={{ width: 120 }} />
      <input name="endDate" type="date" placeholder="结束日期" value={filter.endDate} onChange={onChange} style={{ width: 120 }} />
      <button type="button" onClick={onReset}>重置筛选</button>
    </form>
  );
}
