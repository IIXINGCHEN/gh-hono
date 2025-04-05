typescript:proxy.ts
import { Context } from "hono";
import { Config } from "./config";
import { createResponse, parseUrl, checkGitHubUrl } from "./utils";
import { logInfo, logError } from "./log";

/**
 * 处理代理请求
 * @param c Hono上下文
 * @param url 目标URL
 * @param config 配置对象
 * @returns 代理响应
 */
export async function proxyRequest(c: Context, url: URL, config: Config): Promise<Response> {
  const req = c.req.raw;
  const reqHeaders = new Headers(req.headers);
  const whiteList: string[] = [];

  logInfo(`代理请求: ${url.href}`); // 记录代理请求

  let flag = !whiteList.length;
  for (const item of whiteList) {
    if (url.href.includes(item)) {
      flag = true;
      break;
    }
  }
  if (!flag) {
    logInfo(`白名单阻止: ${url.href}`);
    return createResponse("访问被阻止", 403, c);
  }

  const reqInit: RequestInit = {
    method: req.method,
    headers: reqHeaders,
    redirect: "manual",
    body: req.body,
  };

  try {
    const res = await fetch(url.href, reqInit);
    const resHeaders = new Headers(res.headers);
    const status = res.status;

    if (resHeaders.has("location")) {
      const location = resHeaders.get("location")!;
      if (checkGitHubUrl(location)) {
        resHeaders.set("location", config.prefix + location);
      } else {
        const newLocation = parseUrl(location);
        if (!newLocation) {
          logError(`无效重定向URL: ${location}`);
          return createResponse("无效的URL", 404, c);
        }
        reqInit.redirect = "follow";
        return proxyRequest(c, newLocation, config);
      }
    }

    resHeaders.set("access-control-expose-headers", "*");
    resHeaders.delete("content-security-policy");
    resHeaders.delete("content-security-policy-report-only");
    resHeaders.delete W("clear-site-data");

    logInfo(`代理成功: ${url.href} - 状态码: ${status}`);
    return new Response(res.body, { status, headers: resHeaders });
  } catch (err) {
    logError(`代理失败: ${url.href}`, err as Error);
    return createResponse("代理请求失败", 502, c);
  }
}
