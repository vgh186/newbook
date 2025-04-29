# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

# 数据库工具

本项目提供了一套完整的数据库操作工具，支持同时连接腾讯云数据库和Supabase，提供统一的接口进行数据操作。

## 特性

- 支持多数据库连接（腾讯云数据库和Supabase）
- 提供统一的数据操作接口
- 自动故障转移，当一个数据库不可用时自动使用另一个
- 支持双数据库模式，同时写入两个数据库系统
- 内置健康检查功能

## 安装

首先安装必要的依赖：

```bash
npm install
```

## 配置

在项目根目录下创建 `.env` 文件，添加以下配置：

```
# 腾讯云数据库配置
CLOUDBASE_ENV_ID=your-cloudbase-env-id

# Supabase配置
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 使用方法

### 初始化数据库

```javascript
import { initializeDB } from './utils/initializeDB';
import { DB_TYPE } from './utils/dbConfig';

// 初始化数据库
const success = await initializeDB(DB_TYPE.BOTH);

if (success) {
  console.log('数据库初始化成功');
} else {
  console.error('数据库初始化失败');
}
```

### 使用数据库服务

```javascript
import { databaseService } from './utils/databaseService';

// 查询数据
const users = await databaseService.query('users', {
  filters: [
    { field: 'active', operator: 'eq', value: true }
  ],
  orderBy: { field: 'created_at', direction: 'desc' }
}, {
  limit: 10
});

// 添加数据
const newUser = {
  name: '张三',
  email: 'zhangsan@example.com',
  active: true
};
const result = await databaseService.add('users', newUser);

// 更新数据
await databaseService.update('users', userId, { name: '李四' });

// 获取单个数据
const user = await databaseService.getById('users', userId);

// 删除数据
await databaseService.remove('users', userId);
```

### 检查数据库健康状态

```javascript
import { checkDBHealth } from './utils/initializeDB';

const healthStatus = await checkDBHealth();
console.log(healthStatus);
```

## 命令行工具

本项目提供了命令行工具来初始化和检查数据库：

```bash
# 初始化数据库
npm run db:init

# 指定使用特定数据库
npm run db:init -- --supabase
npm run db:init -- --cloudbase
npm run db:init -- --both

# 检查数据库健康状态
npm run db:check

# 详细输出健康状态
npm run db:check -- --verbose

# 先初始化再检查
npm run db:check -- --init
```

## 数据库类型

可以使用以下类型指定使用的数据库：

- `DB_TYPE.CLOUDBASE`: 仅使用腾讯云数据库
- `DB_TYPE.SUPABASE`: 仅使用Supabase
- `DB_TYPE.BOTH`: 同时使用两个数据库（默认）

## 高级用法

### 自定义查询

```javascript
import { getCloudbaseDB } from './utils/cloudbaseDB';
import { getSupabaseClient } from './utils/supabaseDB';

// 使用腾讯云数据库进行自定义查询
const db = getCloudbaseDB();
const result = await db.collection('users')
  .where({ age: db.command.gt(18) })
  .get();

// 使用Supabase进行自定义查询
const supabase = getSupabaseClient();
const { data, error } = await supabase
  .from('users')
  .select('*')
  .gt('age', 18);
```
