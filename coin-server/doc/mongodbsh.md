 # mongosh commands
 
 
 ```mongodb
 use admin;

 db.createUser({ user:'ljl', pwd : 'Zte@12345', roles:[{role:'root',db:'admin'}] });
 db.createUser({ user:'admin', pwd : 'Zte@12345', roles:[{role:'root',db:'admin'}] });
 
 ```
 - db data
 
 ```mongodb
 show dbs
 show collections
 
 
 ```
 
 db data insert
 ```mongodb 
 use demoDB
 db.users.insertOne({ name: "ljl", age: 46 }); 
 db.users.find({age:46})
 

db.users.find().pretty()

 ```
 
 db.users.find({age:26})
 
 
db.uses.drop



在 mongosh 中查询 demoDb 数据库里的 User 集合（注意：Mongoose 会自动将模型名 User 转为小写复数形式 users，这是 MongoDB 集合的默认命名规范），以下是从「基础查询」到「高级查询」的完整示例：
一、前置步骤：连接 mongosh 并切换到 demoDb
1. 启动 mongosh 客户端
bash
运行

# 本地无密码连接（默认）
mongosh

# 若启用了密码认证，带账号密码连接
mongosh -u 你的用户名 -p 你的密码 --authenticationDatabase admin

2. 切换到 demoDb 数据库
javascript
运行

// 切换到 demoDb（不存在则自动创建，查询时无数据则返回空）
use demoDb;

// 验证当前数据库（可选）
db.getName(); // 输出：demoDb

二、核心查询操作（针对 users 集合）
1. 基础查询：查所有文档
javascript
运行

// 查 users 集合所有数据（适合数据量小的场景）
db.users.find();

// 格式化输出（更易读）
db.users.find().pretty();

示例输出：
json

{
  "_id": ObjectId("6758a7b8c9d0e1f2g3h4i5j6"),
  "name": "张三",
  "age": 25,
  "email": "zhangsan@test.com",
  "createdAt": ISODate("2025-12-08T12:34:56.789Z"),
  "__v": 0
}

2. 条件查询：按字段过滤
javascript
运行

// ① 等值查询：年龄=25 的用户
db.users.find({ age: 25 }).pretty();

// ② 多条件查询：年龄>20 且 姓名=张三（AND 关系）
db.users.find({ age: { $gt: 20 }, name: "张三" }).pretty();

// ③ 或条件查询：年龄<25 或 邮箱包含 test（OR 关系）
db.users.find({
  $or: [
    { age: { $lt: 25 } },
    { email: /test/ } // 正则匹配：邮箱含 test
  ]
}).pretty();

// ④ 字段存在性查询：只查有 email 字段的用户
db.users.find({ email: { $exists: true } }).pretty();

3. 字段过滤：只返回指定字段
javascript
运行

// 只返回 name、age 字段（_id 默认返回，用 0 排除）
db.users.find(
  { age: { $gt: 20 } }, // 查询条件
  { name: 1, age: 1, _id: 0 } // 字段过滤：1=显示，0=隐藏
).pretty();

示例输出：
json

{ "name": "张三", "age": 25 }

4. 分页 & 排序
javascript
运行

// ① 排序：按年龄降序（-1=降序，1=升序）
db.users.find().sort({ age: -1 }).pretty();

// ② 分页：跳过前 2 条，取 3 条（第3-5条）
db.users.find()
  .skip(2)    // 跳过条数
  .limit(3)   // 限制返回条数
  .sort({ createdAt: -1 }) // 按创建时间降序
  .pretty();

5. 聚合查询（统计 / 分组）
javascript
运行

// ① 统计总条数
db.users.countDocuments(); // 等价于 db.users.find().count()

// ② 按年龄分组，统计每组人数
db.users.aggregate([
  { $group: { _id: "$age", total: { $sum: 1 } } }
]).pretty();

// ③ 统计年龄>20 的用户总数
db.users.countDocuments({ age: { $gt: 20 } });

6. 高级查询：只查第一条匹配结果
javascript
运行

// findOne：返回第一条匹配的文档（无需加 pretty() 也格式化）
db.users.findOne({ name: "张三" });
