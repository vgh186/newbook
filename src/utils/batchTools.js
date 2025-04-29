import app from "./cloudbase";

const db = app.database();
const collection = db.collection("records");

// 批量删除所有账目（分批次处理，防止单次删除上限导致无反应）
export async function batchDeleteRecords(filter = {}) {
  let total = 0;
  while (true) {
    // 每次最多查100条
    const res = await collection.where(filter).limit(100).get();
    if (!res.data.length) break;
    const ids = res.data.map(item => item._id);
    // 分批删除
    for (const id of ids) {
      await collection.doc(id).remove();
      total++;
    }
    // 若少于100条，说明已删完
    if (res.data.length < 100) break;
  }
  return total;
}


// 批量修正历史数据：为所有无user_id的账目补全user_id
export async function batchFixUserId(user_id = "default_user") {
  const res = await collection.where({user_id: db.command.exists(false)}).get();
  let count = 0;
  for (const item of res.data) {
    await collection.doc(item._id).update({user_id});
    count++;
  }
  return count;
}
