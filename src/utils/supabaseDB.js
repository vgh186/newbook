// 导入Supabase客户端
import supabase from './supabase';

// 数据库连接状态
let isConnected = false;

// 初始化Supabase连接（只检查连接，不再重复createClient）
export const initSupabaseDB = async () => {
  try {
    // 验证连接（可自定义表名，或直接select现有业务表）
    const { error } = await supabase.from('records').select('*').limit(1);
    if (error) throw error;
    isConnected = true;
    console.log('Supabase数据库连接成功');
    return true;
  } catch (error) {
    console.error('Supabase数据库连接失败:', error);
    return false;
  }
};

// 获取Supabase客户端实例
export const getSupabaseClient = () => {
  if (!isConnected) {
    console.warn('Supabase尚未连接成功，建议先调用initSupabaseDB');
  }
  return supabase;
};

// 检查Supabase健康状态（已统一为'records'表，如需其它表请确保Supabase后台已建表）
export const checkSupabaseHealth = async () => {
  try {
    if (!isConnected || !supabase) {
      return { status: 'error', message: 'Supabase数据库未初始化' };
    }
    // 用实际存在的'records'表做健康检查
    const { data, error } = await supabase.from('records').select('id').limit(1);
    if (error) throw error;
    return {
      status: 'healthy',
      message: 'Supabase数据库连接正常',
      details: { query_result: data }
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'Supabase数据库连接异常',
      error: error.message
    };
  }
}; 