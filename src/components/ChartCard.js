// ECharts React 组件封装
import React from 'react';
import ReactECharts from 'echarts-for-react';

export default function ChartCard({ option, title }) {
  return (
    <div style={{background:'#fff',borderRadius:12,boxShadow:'0 2px 12px #eef2f5',padding:18,marginBottom:18}}>
      <div style={{fontWeight:600,fontSize:16,marginBottom:10}}>{title}</div>
      <ReactECharts option={option} style={{height:320}} notMerge={true} lazyUpdate={true} />
    </div>
  );
}
