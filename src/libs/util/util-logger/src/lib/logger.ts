import * as vscode from 'vscode';

import {
  ConfigurationStoreManager,
  DebuggingConfiguration,
} from '@i18n-weave/util/util-configuration';

import { LogLevel } from './logger.types';

export class Logger {
  private static instance: Logger | null = null;
  private readonly outputChannel: vscode.OutputChannel;
  private readonly configuration: ConfigurationStoreManager;

  private constructor() {
    this.outputChannel = vscode.window.createOutputChannel('i18nWeave');
    this.configuration = ConfigurationStoreManager.getInstance();
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
  public log(level: LogLevel, message: string, scope?: string) {
    const shouldLogVerbosely =
      this.configuration.getConfig<DebuggingConfiguration>('debugging').logging
        .enableVerboseLogging;

    if (level === LogLevel.VERBOSE && !shouldLogVerbosely) {
      return;
    }

    let levelIcon = '';
    switch (level) {
      case LogLevel.INFO:
        levelIcon = 'ℹ️';
        break;
      case LogLevel.WARN:
        levelIcon = '⚠️';
        break;
      case LogLevel.ERROR:
        levelIcon = '❌';
        break;
      case LogLevel.VERBOSE:
        levelIcon = '🔍';
        break;
    }

    const timestamp = new Date()
      .toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
      .replace(',', '');
    const formattedMessage = scope
      ? `[${levelIcon}] [${scope}] ${timestamp}: ${message}`
      : `[${levelIcon}] ${timestamp}: ${message}`;
    this.outputChannel.appendLine(formattedMessage);
  }

  public show() {
    this.outputChannel.show();
  }

  public static disposeInstance() {
    Logger.getInstance().log(LogLevel.INFO, 'Disposing of logger instance');

    if (Logger.instance) {
      Logger.instance.outputChannel.dispose();
      Logger.instance = null;
    }
  }
}
