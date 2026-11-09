import { env } from '../config/env';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_PRIORITIES: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'refreshtoken',
  'jwt',
  'secret',
  'authorization',
  'cookie',
  'creditcard',
  'cvv',
  'pan',
  'aadhaar',
  'bankaccount',
]);

export function sanitizeData(data: any): any {
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.has(lowerKey)) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export class Logger {
  private static minLevel: LogLevel = env.LOG_LEVEL || 'info';

  public static setLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  private static shouldLog(level: LogLevel): boolean {
    return LEVEL_PRIORITIES[level] >= LEVEL_PRIORITIES[this.minLevel];
  }

  private static formatMessage(
    level: LogLevel,
    message: string,
    meta?: Record<string, any>
  ): string {
    const timestamp = new Date().toISOString();
    const sanitizedMeta = meta ? sanitizeData(meta) : undefined;

    if (env.isProduction) {
      // Structured single-line JSON log for CloudWatch / Datadog / GCP Cloud Logging
      return JSON.stringify({
        timestamp,
        level: level.toUpperCase(),
        service: 'franchisebridge-api',
        message,
        ...sanitizedMeta,
      });
    } else {
      // Readable log for local development
      const metaString = sanitizedMeta && Object.keys(sanitizedMeta).length > 0
        ? ` ${JSON.stringify(sanitizedMeta)}`
        : '';
      return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaString}`;
    }
  }

  public static debug(message: string, meta?: Record<string, any>): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, meta));
    }
  }

  public static info(message: string, meta?: Record<string, any>): void {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message, meta));
    }
  }

  public static warn(message: string, meta?: Record<string, any>): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, meta));
    }
  }

  public static error(message: string, meta?: Record<string, any>): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, meta));
    }
  }
}
