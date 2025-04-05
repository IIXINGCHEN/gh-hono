typescript:log.ts
/**
 * 记录信息日志
 * @param message 日志消息
 */
export function logInfo(message: string): void {
  console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
}

/**
 * 记录错误日志
 * @param message 错误消息
 * @param error 可选的错误对象
 */
export function logError(message: string, error?: Error): void {
  const errorDetail = error ? ` | Error: ${error.message} | Stack: ${error.stack}` : "";
  console.error(`[ERROR] ${new Date().toISOString()} - ${message}${errorDetail}`);
}
