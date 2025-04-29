import supabase from "./supabase";

// 添加账目
export async function addRecord(record) {
  // 根据实际Supabase表结构调整记录字段
  const supabaseRecord = {
    date: record.date,
    project: record.project,
    college: record.college,
    remark: record.remark,
    amount: record.amount,
    type: record.type,
    // 确保添加name字段，如果Supabase中没有，可能需要单独处理
    name: record.name
  };

  const { data, error } = await supabase
    .from('records')
    .insert([supabaseRecord])
    .select();
    
  if (error) throw error;
  return data[0];
}

// 查询账目（分页拉取全部）
export async function getRecords() {
  let allRecords = [];
  let page = 0;
  const pageSize = 100;
  
  while (true) {
    const { data, error } = await supabase
      .from('records')
      .select('*')
      .range(page * pageSize, (page + 1) * pageSize - 1);
      
    if (error) throw error;
    
    // 转换数据结构以匹配应用程序期望的格式
    const transformedData = data.map(item => ({
      _id: item.id, // 使用Supabase的uuid作为_id
      date: item.date,
      name: item.name,
      project: item.project,
      college: item.college,
      remark: item.remark,
      amount: item.amount,
      type: item.type,
      user_id: item.user_id || 'default_user' // 默认用户ID如果没有
    }));
    
    allRecords = allRecords.concat(transformedData);
    if (data.length < pageSize) break;
    page++;
  }
  
  return { data: allRecords };
}

// 删除账目
export async function deleteRecord(id) {
  const { error } = await supabase
    .from('records')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
  return true;
}

// 批量删除所有账目
export async function batchDeleteRecords(filter = {}) {
  // 如果有过滤条件，添加过滤
  let query = supabase.from('records').delete();
  
  // 添加可能的过滤条件
  Object.keys(filter).forEach(key => {
    if (filter[key]) {
      query = query.eq(key, filter[key]);
    }
  });
  
  const { error } = await query;
  if (error) throw error;
  return true;
}

// 批量修正历史数据
export async function batchFixUserId(user_id = "default_user") {
  const { data, error } = await supabase
    .from('records')
    .update({ user_id: user_id })
    .is('user_id', null)
    .select();
    
  if (error) throw error;
  return data.length;
} 