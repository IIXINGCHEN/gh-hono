typescript:utils.ts
import { Context } from "hono";
import { GitHubUrlType } from "./types";
import { v4 as uuidv4 } from "uuid";

/**
 * 定义JSON响应体的结构
 */
interface ResponseBody {
  status: number;           // HTTP状态码
  success: boolean;         // 请求是否成功
  path: string;             // 完整HTTP/HTTPS网络路径
  ip: string;               // 请求IP
  timestamp: string;        // 请求时间
  requestId: string;        // 请求UUID
  message: string;          // 友好提示信息
}

/**
 * 创建JSON格式的Response对象
 * @param message 友好提示信息
 * @param status 状态码，默认200
 * @param c Hono上下文，用于提取请求信息
 * @param headers 自定义头部
 * @returns Response对象
 */
export function createResponse(
  message: string,
  status: number = 200,
  c: Context,
  headers: Record<string, string> = {}
): Response {
  const { path, ip, timestamp, requestId } = getRequestInfo(c); // 获取请求信息
  const body: ResponseBody = {
    status,
    success: status >= 200 && status < 400, // 200-399为成功
    path,
    ip,
    timestamp,
    requestId,
    message,
  };
  headers["Content-Type"] = "application/json; charset=utf-8"; // 设置JSON和UTF-8编码
  return new Response(JSON.stringify(body), { status, headers });
}

/**
 * 提取请求信息
 * @param c Hono上下文
 * @returns 请求信息对象
 */
export function getRequestInfo(c: Context): { path: string; ip: string; timestamp: string; requestId: string } {
  const path = c.req.url; // 获取完整HTTP/HTTPS路径
  const ip = c.req.header("CF-Connecting-IP") || c.req.header("x-forwarded-for") || "unknown"; // 获取IP
  const timestamp = new Date().toISOString(); // 获取当前时间
  const requestId = uuidv4(); // 生成UUID
  return { path, ip, timestamp, requestId };
}

/**
 * 解析URL字符串为URL对象
 * @param urlStr URL字符串
 * @returns URL对象或null
 */
export function parseUrl(urlStr: string): URL | null {
  try {
    return new URL(urlStr);
  } catch {
    return null;
  }
}

/**
 * 检查URL是否为GitHub相关URL
 * @param url URL字符串
 * @returns 是否匹配
 */
export function checkGitHubUrl(url: string): boolean {
  const patterns = [
    /^(?:https?:\/\/)?github\.com\/.+?\/.+?\/(?:releases|archive)\/.*$/i,
    /^(?:https?:\/\/)?github\.com\/.+?\/.+?\/(?:blob|raw)\/.*$/i,
    /^(?:https?:\/\/)?github\.com\/.+?\/.+?\/(?:info|git-).*$/i,
    /^(?:https?:\/\/)?raw\.(?:githubusercontent|github)\.com\/.+?\/.+?\/.+?\/.+$/i,
    /^(?:https?:\/\/)?gist\.(?:githubusercontent|github)\.com\/.+?\/.+?\/.+$/i,
    /^(?:https?:\/\/)?github\.com\/.+?\/.+?\/tags.*$/i,
  ];
  return patterns.some((pattern) => url.search(pattern) === 0);
}

/**
 * 分类GitHub URL类型
 * @param url URL字符串
 * @returns GitHubUrlType枚举值
 */
export function classifyGitHubUrl(url: string): GitHubUrlType {
  if (/^(?:https?:\/\/)?github\.com\/.+?\/.+?\/(?:releases|archive)\/.*$/i.test(url)) return GitHubUrlType.RELEASES;
  if (/^(?:https?:\/\/)?github\.com\/.+?\/.+?\/blob\/.*$/i.test(url)) return GitHubUrlType.BLOB;
  if (/^(?:https?:\/\/)?github\.com\/.+?\/.+?\/raw\/.*$/i.test(url)) return GitHubUrlType.RAW;
  if (/^(?:https?:\/\/)?github\.com\/.+?\/.+?\/(?:info|git-).*$/i.test(url)) return GitHubUrlType.INFO;
  if (/^(?:https?:\/\/)?raw\.(?:githubusercontent|github)\.com\/.+?\/.+?\/.+?\/.+$/i.test(url)) return GitHubUrlType.RAW;
  if (/^(?:https?:\/\/)?gist\.(?:githubusercontent|github)\.com\/.+?\/.+?\/.+$/i.test(url)) return GitHubUrlType.GIST;
  if (/^(?:https?:\/\/)?github\.com\/.+?\/.+?\/tags.*$/i.test(url)) return GitHubUrlType.TAGS;
  return GitHubUrlType.UNKNOWN;
}

/**
 * 检查请求域名是否允许
 * @param host 请求Host头
 * @param allowedDomains 允许的域名列表
 * @returns 是否允许
 */
export function checkDomain(host: string, allowedDomains: string[]): boolean {
  if (!allowedDomains.length) return false;
  if (host.endsWith(".workers.dev")) return false;
  return allowedDomains.includes(host);
}
