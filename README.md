# GitHub Proxy

基于 Cloudflare Workers 的 GitHub 代理服务，旨在加速访问 GitHub 资源，支持自定义域名和路由配置。

---

## 项目概述

GitHub Proxy 是一个轻量、高效的代理服务，能够处理 GitHub 相关的 URL 请求，包括 `releases`、`blob`、`raw` 等类型。项目基于 [Hono](https://hono.dev/) 框架构建，专为生产环境设计，具有以下核心特性：

- **自定义域名支持**：通过 `wrangler.toml` 配置，仅允许指定域名访问，禁用默认 Workers 域名。
- **友好 JSON 响应**：所有响应以 UTF-8 编码的 JSON 格式返回，包含状态码、路径、IP、时间和 UUID。
- **安全性保障**：限制 CORS 为允许的域名，移除错误堆栈，集成详细日志记录。
- **灵活配置**：通过 `wrangler.toml` 注入配置，支持动态调整。

---

## 功能特性

- 代理 GitHub 资源（如 `releases`、`raw` 文件、`Gist` 等）。
- 支持 jsDelivr 镜像加速（可配置开关）。
- 白名单过滤功能（当前为空，可扩展）。
- 动态路由前缀配置。
- 详细的请求和错误日志记录。

---

## 安装步骤

### 前置条件

- **Node.js**：建议 v16 或更高版本。
- **Cloudflare Workers 账户**：需注册并配置。
- **Wrangler CLI**：安装命令：
  ```bash
  npm install -g wrangler
安装流程
克隆仓库：
bash
git clone https://github.com/yourusername/github-proxy.git
cd github-proxy
安装依赖：
bash
npm install
配置 wrangler.toml：
参考下文“配置说明”部分进行设置。
部署流程
登录 Cloudflare Workers：
bash
wrangler login
部署项目：
bash
wrangler deploy
使用方法
配置自定义域名
在 Cloudflare 仪表盘中添加自定义域名（例如 myproxy.com）。
更新 wrangler.toml 中的 allowedDomains 和 routes 配置。
发送请求
请求示例：
https://myproxy.com/https://github.com/user/repo/releases/tag/v1.0.0
响应示例：
json
{
  "status": 200,
  "success": true,
  "path": "https://myproxy.com/https://github.com/user/repo/releases/tag/v1.0.0",
  "ip": "192.168.1.1",
  "timestamp": "2025-04-05T12:00:00Z",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "请求成功"
}
配置说明
编辑 wrangler.toml 文件以自定义项目配置：
toml
# 项目名称
name = "github-proxy"

# 兼容性日期
compatibility_date = "2025-04-05"

# 环境变量配置
[vars]
CONFIG = '''
{
  "assetUrl": "https://hunshcn.github.io/gh-proxy/",  # 静态资源基础URL
  "prefix": "/",                                       # 路由前缀
  "jsdelivrEnabled": false,                            # 是否启用jsDelivr
  "allowedDomains": ["myproxy.com"]                    # 允许的自定义域名
}
'''

# 自定义域名路由
[[routes]]
pattern = "myproxy.com/*"
custom_domain = true
配置项详解
assetUrl：代理的静态资源基础URL，例如 GitHub Pages。
prefix：路由前缀，用于解析代理路径。
jsdelivrEnabled：布尔值，控制是否将 blob 路径重定向到 jsDelivr。
allowedDomains：数组，列出允许访问的自定义域名。
项目结构
github-proxy/
├── src/
│   ├── config.ts      # 配置解析逻辑
│   ├── log.ts         # 日志记录模块
│   ├── proxy.ts       # 代理请求处理
│   ├── types.ts       # 类型定义
│   ├── utils.ts       # 工具函数
│   └── index.ts       # 主入口
├── package.json       # 依赖配置
├── wrangler.toml      # Workers 部署配置
└── README.md          # 项目文档
## 贡献指南
欢迎为项目贡献代码！请按照以下步骤操作：
Fork 仓库：
点击 GitHub 页面上的 Fork 按钮。
创建特性分支：
bash
git checkout -b feature/your-feature
提交更改：
bash
git commit -m "添加新特性"
推送分支：
bash
git push origin feature/your-feature
创建 Pull Request：
在 GitHub 上提交 PR，描述你的更改。
# 许可证
本项目采用 MIT License。
