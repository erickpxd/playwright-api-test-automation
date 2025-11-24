import fs from "fs";
import path from "path";

export enum LogLevel {
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  metadata?: Record<string, unknown>;
}

export class Logger {
  private static instance: Logger | null = null;
  private logs: LogEntry[] = [];
  private outputDir = "./test-logs";

  private constructor() {
    this.ensureOutputDir();
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private ensureOutputDir(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private formatLogEntry(entry: LogEntry): string {
    const parts = [`[${entry.timestamp}]`, `[${entry.level}]`, entry.message];

    if (entry.metadata) {
      parts.push(`\n  ${JSON.stringify(entry.metadata, null, 2)}`);
    }

    return parts.join(" ");
  }

  private writeToConsole(entry: LogEntry): void {
    const formatted = this.formatLogEntry(entry);
    
    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      default:
        console.log(formatted);
    }
  }

  private writeToFile(entry: LogEntry): void {
    const timestamp = new Date().toISOString().split("T")[0];
    const logFile = path.join(this.outputDir, `test-execution-${timestamp}.log`);
    const formatted = this.formatLogEntry(entry) + "\n";

    fs.appendFileSync(logFile, formatted, "utf-8");
  }

  private log(level: LogLevel, message: string, metadata?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: this.formatTimestamp(),
      level,
      message,
      metadata,
    };

    this.logs.push(entry);
    this.writeToConsole(entry);
    this.writeToFile(entry);
  }

  public info(message: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, metadata);
  }

  public warn(message: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, metadata);
  }

  public error(message: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, metadata);
  }

  public step(stepName: string, metadata?: Record<string, unknown>): void {
    this.info(`Step: ${stepName}`, metadata);
  }

  public request(method: string, url: string, data?: unknown): void {
    this.info(`Request: ${method} ${url}`, data ? { data } : undefined);
  }

  public response(status: number, url: string, responseTime: number): void {
    const level = status >= 400 ? LogLevel.WARN : LogLevel.INFO;
    this.log(level, `Response: ${status} ${url} (${responseTime}ms)`);
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public clear(): void {
    this.logs = [];
  }

  public static reset(): void {
    Logger.instance = null;
  }
}
