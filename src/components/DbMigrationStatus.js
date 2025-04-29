import React from 'react';

const DbMigrationStatus = () => (
  <div style={{ padding: '2em', textAlign: 'center', color: '#888' }}>
    <h2>数据迁移功能已禁用</h2>
    <p>当前系统已完全切换至 Supabase，不再支持腾讯云数据迁移。</p>
  </div>
);

export default DbMigrationStatus;