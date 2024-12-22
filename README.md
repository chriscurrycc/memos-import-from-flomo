# Memos Import From Flomo

一个用于将 Flomo 笔记导入到 [Memos](https://github.com/usememos/memos) 的工具。

## 功能特性

- 支持解析 Flomo 导出的 HTML 文件
- 自动上传笔记中的图片资源到 Cloudflare R2
- 保持原有的创建时间
- 保留原有的标签
- 自动添加 #FlomoMigration 标签用于区分导入的内容
- 支持内容格式优化

## 使用前准备

1. 从 Flomo 导出数据（HTML 格式）
2. 配置环境变量（创建 .env 文件）：

```env
API_HOST=your_memos_host
ACCESS_TOKEN=your_memos_access_token
FLOMO_HTML_PATH=./flomo/index.html
R2_ACCOUNT_ID=your_r2_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=your_r2_public_url
```

## 安装

```bash
pnpm install
```

## 使用方法

### 1. 解析 Flomo HTML 文件

```bash
npm run parse
```

这一步会：

- 解析 Flomo 导出的 HTML 文件
- 提取笔记内容、时间、标签和图片信息
- 生成 memo.json 文件

### 2. 优化内容格式（可选）

```bash
npm run optimize-memos
```

这一步会：

- 清理多余空格
- 规范化换行符（最多保留两个连续换行）
- 自动创建备份文件
- 优化后的内容会更新到 memo.json

### 3. 上传资源文件

```bash
npm run upload-resources
```

这一步会：

- 上传笔记中的图片到 Cloudflare R2
- 生成 file-map.json 记录文件映射关系
- 更新 memo.json 中的资源链接

### 4. 上传笔记

```bash
npm run upload-memos
```

这一步会：

- 将笔记上传到 Memos
- 保持原有创建时间
- 添加 #FlomoMigration 标签
- 记录已上传的笔记 ID

### 5. 一键执行所有步骤

```bash
npm run start
```

## 文件说明

- `memo.json`: 解析后的笔记数据
- `file-map.json`: 文件映射关系
- `sendedIds.json`: 已上传笔记的 ID 记录

## 注意事项

1. 确保 .env 文件配置正确
2. 上传前建议先使用 optimize-memos 优化内容格式
3. 图片资源上传到 R2 后会保持原有文件名
4. 支持断点续传，已上传的内容会记录在 sendedIds.json 中
5. 每次上传笔记会有 1 秒的间隔，避免请求过于频繁

## 环境变量说明

- `API_HOST`: Memos 服务器地址
- `ACCESS_TOKEN`: Memos 访问令牌
- `FLOMO_HTML_PATH`: Flomo 导出的 HTML 文件路径
- `R2_ACCOUNT_ID`: Cloudflare R2 账户 ID
- `R2_ACCESS_KEY_ID`: R2 访问密钥 ID
- `R2_SECRET_ACCESS_KEY`: R2 访问密钥
- `R2_BUCKET_NAME`: R2 存储桶名称
- `R2_PUBLIC_URL`: R2 公共访问地址

## 开发相关

- 使用 ESLint 进行代码规范检查：

```bash
npm run lint
```

## 许可证

MIT
