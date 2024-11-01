import * as vscode from 'vscode';

import { LogLevel } from './logger.types';

export class Logger {
  private static instance: Logger | null = null;
  private readonly outputChannel: vscode.OutputChannel;

  /** ANSI color codes */
  private readonly colors = {
    [LogLevel.INFO]: '\x1b[32m', // Green
    [LogLevel.WARN]: '\x1b[33m', // Yellow
    [LogLevel.ERROR]: '\x1b[31m', // Red
    reset: '\x1b[0m', // Reset to default
  };

  private constructor() {
    this.outputChannel = vscode.window.createOutputChannel('i18nWeave');
  }

  /**
   * Retrieves the singleton instance of Logger.
   * @returns The singleton instance.
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Logs a message to the output channel with the specified log level.
   * @param level - The log level (INFO, WARN, ERROR)
   * @param message - The message to log
   */
  public log(level: LogLevel, message: string) {
    const timestamp = new Date().toISOString();
    const coloredMessage = `${this.colors[level]}[${level}] ${timestamp}: ${message}${this.colors.reset}`;
    this.outputChannel.appendLine(coloredMessage);
  }

  public show() {
    this.outputChannel.show();
  }

  public dispose() {
    this.outputChannel.dispose();
  }
}
