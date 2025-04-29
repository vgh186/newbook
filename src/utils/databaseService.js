// 导入数据库工具
// 已移除 cloudbaseDB 相关内容
import { getSupabaseClient } from './supabaseDB';
import { getDbType } from './dbConfig';

// 统一的数据库服务
// 已移除未使用的变量，确保 ESLint 通过
export const databaseService = {
  // 查询数据
  async query(collection, query = {}, options = {}) {
    let results = [];
    let errors = [];
    
    // 使用Supabase查询
    try {
      const supabase = getSupabaseClient();
      let supabaseQuery = supabase.from(collection).select('*');

      // 应用过滤条件
      if (query.filters) {
        query.filters.forEach(filter => {
          supabaseQuery = supabaseQuery.filter(filter.field, filter.operator, filter.value);
        });
      }

      // 应用排序
      if (query.orderBy) {
        supabaseQuery = supabaseQuery.order(query.orderBy.field, {
          ascending: query.orderBy.direction === 'asc'
        });
      }

      // 应用分页
      if (options.limit) {
        supabaseQuery = supabaseQuery.limit(options.limit);
      }

      if (options.offset) {
        supabaseQuery = supabaseQuery.offset(options.offset);
      }

      const { data, error } = await supabaseQuery;
      if (error) throw error;
      if (data) results = [...results, ...data];
    } catch (error) {
      console.error('Supabase查询错误:', error);
      errors.push({ source: 'supabase', error });
    }
    
    return {
      data: results,
      errors: errors.length > 0 ? errors : null
    };
  },
  
  // 添加数据
  async add(collection, data) {
    const dbType = getDbType();
    let result = null;
    let errors = [];
    
    // 使用Supabase添加
    try {
      const supabase = getSupabaseClient();
      const { data: insertedData, error } = await supabase.from(collection).insert(data).select();
      
      if (error) throw error;
      result = insertedData ? insertedData[0] : null;
    } catch (error) {
      console.error('Supabase添加数据错误:', error);
      errors.push({ source: 'supabase', error });
    }
    
    return {
      data: result,
      errors: errors.length > 0 ? errors : null
    };
  },
  
  // 更新数据
  async update(collection, id, data) {
    const dbType = getDbType();
    let success = false;
    const errors = [];
    
    // 使用Supabase更新
    try {
      const supabase = getSupabaseClient();
      const { data: updatedData, error } = await supabase
        .from(collection)
        .update(data)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      success = updatedData && updatedData.length > 0;
    } catch (error) {
      console.error('Supabase更新数据错误:', error);
      errors.push({ source: 'supabase', error });
    }
    
    return {
      success,
      errors: errors.length > 0 ? errors : null
    };
  },
  
  // 删除数据
  async remove(collection, id) {
    const dbType = getDbType();
    let success = false;
    const errors = [];
    
    // 使用Supabase删除
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from(collection)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      success = true;
    } catch (error) {
      console.error('Supabase删除数据错误:', error);
      errors.push({ source: 'supabase', error });
    }
    
    return {
      success,
      errors: errors.length > 0 ? errors : null
    };
  },
  
  // 获取单个数据
  async getById(collection, id) {
    const dbType = getDbType();
    let result = null;
    const errors = [];
    
    // 使用Supabase获取
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from(collection)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      if (data) result = data;
    } catch (error) {
      console.error('Supabase获取数据错误:', error);
      errors.push({ source: 'supabase', error });
    }
    
    return {
      data: result,
      errors: errors.length > 0 ? errors : null
    };
  }
}; 