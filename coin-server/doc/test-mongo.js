// 1. 导入 Mongoose
const mongoose = require('mongoose');

// 2. 连接 MongoDB 数据库
// 本地数据库：mongodb://localhost:27017/【数据库名】（demoDB 是自定义数据库名，不存在会自动创建）
mongoose.connect('mongodb://localhost:27017/demoDB')
  .then(() => console.log('✅ MongoDB 连接成功！'))
  .catch(err => console.error('❌ 连接失败：', err));

// 3. 定义 Schema（数据结构规则）
// 比如定义「用户」Schema：包含姓名、年龄、邮箱、创建时间
const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, // 必传
    trim: true // 自动去除首尾空格
  },
  age: {
    type: Number,
    min: 18, // 最小值限制
    max: 100 // 最大值限制
  },
  email: {
    type: String,
    unique: true, // 唯一索引（不可重复）
    match: /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/ // 邮箱格式校验
  },
  createdAt: {
    type: Date,
    default: Date.now // 默认值：当前时间
  }
});

// 4. 创建 Model（对应 MongoDB 的 Collection/集合，自动小写+复数：user → users）
const User = mongoose.model('User', userSchema);

// 5. 核心操作：增删改查（封装为异步函数，避免回调地狱）
async function mongoCRUD() {
  try {
    // ========== 【新增】创建一条用户数据 ==========
    const newUser = new User({
      name: '张三',
      age: 25,
      email: 'zhangsan@test.com'
    });
    const savedUser = await newUser.save(); // 保存到数据库
    console.log('📝 新增用户：', savedUser);

    // ========== 【查询】 ==========
    // ① 查询所有用户
    const allUsers = await User.find();
    console.log('📚 所有用户：', allUsers);

    // ② 条件查询（比如年龄=25）
    const targetUser = await User.findOne({ age: 25 }); // 只返回第一条匹配结果
    console.log('🎯 年龄25的用户：', targetUser);

    // ========== 【更新】 ==========
    // 根据 ID 更新（savedUser._id 是新增用户的自动生成ID）
    const updatedUser = await User.findByIdAndUpdate(
      savedUser._id,
      { age: 26 }, // 要更新的字段
      { new: true } // 选项：返回更新后的最新数据（默认返回旧数据）
    );
    console.log('🔄 更新后的用户：', updatedUser);

    // // ========== 【删除】 ==========
    // // 根据 ID 删除
    // await User.findByIdAndDelete(savedUser._id);
    // console.log('🗑️ 删除成功！');

    // // 验证删除结果（查询所有用户，应为空）
    // const checkUsers = await User.find();
    // console.log('✅ 删除后剩余用户：', checkUsers);

  } catch (err) {
    console.error('❌ 操作失败：', err.message);
  } finally {
    // 6. 关闭数据库连接（可选，测试完关闭）
    mongoose.disconnect();
    console.log('🔌 数据库连接已关闭');
  }
}

// 执行所有操作
mongoCRUD();

