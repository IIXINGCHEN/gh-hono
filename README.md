# GitHub Proxy

一个基于Cloudflare Workers的GitHub代理服务，用于加速访问GitHub资源，支持自定义域名和路由配置。

## 项目概述

此项目提供了一个轻量级、高效的代理服务，能够处理GitHub相关的URL请求，包括releases、blob、raw等类型。它使用Hono框架构建，支持生产环境部署，并具备以下特性：
- **自定义域名支持**：通过`wrangler.toml`配置，仅允许指定域名访问，禁用默认Workers域名。
- **JSON响应**：所有响应以友好的JSON格式返回，包含状态码、路径、IP、时间和UUID。
- **安全性**：限制CORS为允许的域名，移除错误堆栈，添加日志记录。
- **配置灵活性**：通过`wrangler.toml`注入配置，支持动态调整。

## 功能特性

- 代理GitHub资源（如releases、raw文件、Gist等）。
- 支持jsDelivr镜像（可配置开关）。
- 白名单过滤（当前为空，可扩展）。
- 动态路由前缀配置。
- 详细的请求日志记录。

## 安装步骤

### 前置条件
- Node.js (建议v16或更高版本)
- Cloudflare Workers账户
- `wrangler` CLI工具 (`npm install -g wrangler`)

### 安装
1. 克隆仓库：
   ```bash
   git clone https://github.com/yourusername/github-proxy.git
   cd github-proxy
安装依赖：
bash
npm install
配置wrangler.toml（见下文“配置说明”）。
部署
登录Cloudflare Workers：
bash
wrangler login
部署项目：
bash
wrangler deploy
使用方法
配置自定义域名：
在Cloudflare仪表盘中添加自定义域名（例如myproxy.com）。
更新wrangler.toml中的allowedDomains和routes。
发送请求：
示例：https://myproxy.com/https://github.com/user/repo/releases/tag/v1.0.0
响应：
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
编辑wrangler.toml以自定义配置：
toml
name = "github-proxy"
compatibility_date = "2025-04-05"

[vars]
CONFIG = '''
{
  "assetUrl": "https://hunshcn.github.io/gh-proxy/",  # 静态资源基础URL
  "prefix": "/",                                       # 路由前缀
  "jsdelivrEnabled": false,                            # 是否启用jsDelivr
  "allowedDomains": ["myproxy.com"]                    # 允许的自定义域名
}
'''

[[routes]]
pattern = "myproxy.com/*"
custom_domain = true
assetUrl：代理的静态资源基础URL。
prefix：路由前缀，用于URL解析。
jsdelivrEnabled：布尔值，控制是否将blob路径重定向到jsDelivr。
allowedDomains：数组，指定允许访问的域名。
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
├── wrangler.toml      # Workers部署配置
└── README.md          # 项目文档
贡献指南
欢迎贡献代码！请遵循以下步骤：
Fork此仓库。
创建特性分支（git checkout -b feature/your-feature）。
提交更改（git commit -m "添加新特性"）。
推送到分支（git push origin feature/your-feature）。
创建Pull Request。
许可证
MIT License
