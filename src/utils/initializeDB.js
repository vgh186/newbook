// 已移除 cloudbaseDB 相关内容
import { initSupabaseDB, checkSupabaseHealth } from './supabaseDB';
import { DB_TYPE, setDbType } from './dbConfig';

// 初始化数据库，仅支持 Supabase
export const initializeDB = async () => {
  console.log('开始初始化 Supabase 数据库');
  const success = await initializeSupabase();
  if (success) {
    setDbType(DB_TYPE.SUPABASE);
    console.log('已使用 Supabase 数据库');
    return true;
  } else {
    console.error('数据库初始化失败，无法连接到 Supabase 数据库');
    return false;
  }
};

// 初始化 Supabase 数据库
const initializeSupabase = async () => {
  console.log('正在初始化 Supabase 数据库...');
  try {
    const success = await initSupabaseDB();
    if (success) {
      console.log('Supabase 数据库初始化成功');
    } else {
      console.error('Supabase 数据库初始化失败');
    }
    return success;
  } catch (error) {
    console.error('Supabase 数据库初始化出错:', error);
    return false;
  }
};

// 检查数据库健康状态
export const checkDBHealth = async () => {
  const result = {
    supabase: await checkSupabaseHealth(),
    timestamp: new Date().toISOString()
  };
  
  // 添加总体状态
  result.overall = {
    status: result.supabase.status === 'healthy' ? 'healthy' : 'error',
    message: `Supabase: ${result.supabase.status}`
  };
  
  return result;
};