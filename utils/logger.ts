/**
 * Simple logging utility for tests
 */

export enum LogLevel {
  INFO = "INFO",
  SUCCESS = "SUCCESS",
  WARNING = "WARNING",
  ERROR = "ERROR",
  DEBUG = "DEBUG",
}

export class Logger {
  private static getTimestamp(): string {
    return new Date().toLocaleTimeString("es-ES");
  }

  static log(level: LogLevel, message: string): void {
    const timestamp = this.getTimestamp();
    console.log(`[${timestamp}] [${level}] ${message}`);
  }

  static info(message: string): void {
    this.log(LogLevel.INFO, message);
  }

  static success(message: string): void {
    this.log(LogLevel.SUCCESS, message);
  }

  static warning(message: string): void {
    this.log(LogLevel.WARNING, message);
  }

  static error(message: string): void {
    this.log(LogLevel.ERROR, message);
  }

  static debug(message: string): void {
    this.log(LogLevel.DEBUG, message);
  }
}
