// 数据库类型常量
export const DB_TYPE = {
  CLOUDBASE: 'cloudbase',
  SUPABASE: 'supabase',
  BOTH: 'both'
};

// 默认使用腾讯云数据库
let currentDbType = DB_TYPE.CLOUDBASE;

// 获取当前数据库类型
export const getDbType = () => {
  return currentDbType;
};

// 设置当前数据库类型
export const setDbType = (dbType) => {
  if (Object.values(DB_TYPE).includes(dbType)) {
    currentDbType = dbType;
    return true;
  }
  return false;
};

// 检查是否使用双数据库模式
export const isUsingBothDatabases = () => {
  return currentDbType === DB_TYPE.BOTH;
};

// 检查是否使用Supabase
export const isUsingSupabase = () => {
  return currentDbType === DB_TYPE.SUPABASE || currentDbType === DB_TYPE.BOTH;
};

// 检查是否使用腾讯云数据库
export const isUsingCloudbase = () => {
  return currentDbType === DB_TYPE.CLOUDBASE || currentDbType === DB_TYPE.BOTH;
}; 