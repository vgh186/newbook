// 首页总览卡片组件
export default function OverviewCards({ stats }) {
  // stats: { monthIncome, monthExpense, yearIncome, yearExpense }
  return (
    <div style={{display:'flex',gap:20,justifyContent:'center',marginBottom:30,flexWrap:'wrap'}}>
      <div className="overview-card" style={{background:'linear-gradient(90deg,#fef6f5,#ffe7e0)',color:'#e15c5c'}}>
        <div style={{fontSize:15,marginBottom:2}}>本月收入</div>
        <div style={{fontSize:22,fontWeight:700}}>{stats.monthIncome}</div>
      </div>
      <div className="overview-card" style={{background:'linear-gradient(90deg,#f2fbf6,#d8f5e4)',color:'#2ca46d'}}>
        <div style={{fontSize:15,marginBottom:2}}>本月支出</div>
        <div style={{fontSize:22,fontWeight:700}}>{stats.monthExpense}</div>
      </div>
      <div className="overview-card" style={{background:'linear-gradient(90deg,#e3eafd,#f4f7fe)',color:'#3b82f6'}}>
        <div style={{fontSize:15,marginBottom:2}}>本年收入</div>
        <div style={{fontSize:22,fontWeight:700}}>{stats.yearIncome}</div>
      </div>
      <div className="overview-card" style={{background:'linear-gradient(90deg,#f7f3fd,#eedbfd)',color:'#a855f7'}}>
        <div style={{fontSize:15,marginBottom:2}}>本年支出</div>
        <div style={{fontSize:22,fontWeight:700}}>{stats.yearExpense}</div>
      </div>
    </div>
  );
}
