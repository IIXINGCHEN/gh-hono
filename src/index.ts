typescript:index.ts
import { Hono } from "hono";
import { cors } from "hono/cors";
import { Env, GitHubUrlType } from "./types";
import { Config, parseConfig } from "./config";
import { createResponse, parseUrl, classifyGitHubUrl, checkDomain } from "./utils";
import { proxyRequest } from "./proxy";
import { logInfo, logError } from "./log";

const app = new Hono<{ Bindings: Env }>();

// 配置CORS中间件，限制为allowedDomains
app.use("*", async (c, next) => {
  const config = parseConfig(c.env.CONFIG);
  await cors({
    origin: (origin) => (config.allowedDomains.includes(new URL(origin).hostname) ? origin : ""),
    allowMethods: ["GET", "POST", "PUT", "PATCH", "TRACE", "DELETE", "HEAD", "OPTIONS"],
    maxAge: 1728000,
    exposeHeaders: ["*"],
  })(c, next);
});

// 域名检查中间件
app.use("*", async (c, next) => {
  const config = parseConfig(c.env.CONFIG);
  const host = c.req.header("Host") || "";
  if (!checkDomain(host, config.allowedDomains)) {
    logInfo(`非法域名访问: ${host}`);
    return createResponse("禁止使用默认Workers域名或未授权域名", 403, c);
  }
  await next();
});

// 主路由
app.get("/*", async (c) => {
  const config = parseConfig(c.env.CONFIG);
  const urlStr = c.req.url;
  const urlObj = new URL(urlStr);
  let path = urlObj.searchParams.get("gh_url");

  logInfo(`收到请求: ${urlStr}`);

  if (path) {
    const redirectUrl = "https://" + urlObj.host + config.prefix + path;
    logInfo(`重定向: ${redirectUrl}`);
    return c.redirect(redirectUrl, 301);
  }

  path = urlObj.href
    .substr(urlObj.origin.length + config.prefix.length)
    .replace(/^https?:\/+/, "https://");
  const urlType = classifyGitHubUrl(path);

  try {
    switch (urlType) {
      case GitHubUrlType.RELEASES:
      case GitHubUrlType.INFO:
      case GitHubUrlType.GIST:
      case GitHubUrlType.TAGS:
      case GitHubUrlType.RAW:
        return await proxyRequest(c, parseUrl(path) || urlObj, config);
      case GitHubUrlType.BLOB:
        if (config.jsdelivrEnabled) {
          const newUrl = path
            .replace("/blob/", "@")
            .replace(/^(?:https?:\/\/)?github\.com/, "https://cdn.jsdelivr.net/gh");
          logInfo(`jsDelivr重定向: ${newUrl}`);
          return c.redirect(newUrl, 302);
        } else {
          path = path.replace("/blob/", "/raw/");
          return await proxyRequest(c, parseUrl(path) || urlObj, config);
        }
      case GitHubUrlType.UNKNOWN:
      default:
        const res = await fetch(config.assetUrl + path);
        logInfo(`静态资源代理: ${config.assetUrl + path}`);
        return new Response(res.body, { status: res.status, headers: res.headers });
    }
  } catch (err) {
    logError(`请求处理失败: ${urlStr}`, err as Error);
    return createResponse("服务器内部错误", 502, c);
  }
});

// 处理OPTIONS请求
app.options("/*", (c) => c.res);

export default app;
