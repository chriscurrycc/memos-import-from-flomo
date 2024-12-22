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
