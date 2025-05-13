import React from "react";

export default function AccountForm({ form, onChange, onSubmit, loading }) {
  return (
    <form onSubmit={onSubmit} style={{ marginBottom: 20 }}>
      <input name="date" type="date" value={form.date} onChange={onChange} required />
      <input name="name" placeholder="姓名" value={form.name} onChange={onChange} required />
      <input name="project" placeholder="项目" value={form.project} onChange={onChange} />
      <input name="college" placeholder="学院" value={form.college} onChange={onChange} />
      <input name="remark" placeholder="备注" value={form.remark} onChange={onChange} />
      <input name="amount" type="number" placeholder="金额" value={form.amount} onChange={onChange} required />
      <select name="type" value={form.type} onChange={onChange}>
        <option value="收入">收入</option>
        <option value="支出">支出</option>
      </select>
      <button type="submit" disabled={loading}>添加账目</button>
    </form>
  );
}
