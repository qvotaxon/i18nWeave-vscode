import * as vscode from 'vscode';

import { LogLevel, Logger } from '@i18n-weave/util/util-logger';

import { StatusBarState } from './status-bar-manager.types';

/**
 * Manages the status bar item in the Visual Studio Code editor.
 *
 * The `StatusBarManager` class is responsible for creating, updating, and disposing
 * of a status bar item in the Visual Studio Code editor. It initializes the status
 * bar item, sets its initial state, and provides methods to update its state and
 * dispose of it when no longer needed.
 */
export class StatusBarManager {
  private readonly extensionName = 'i18nWeave';
  private static instance: StatusBarManager | null = null;
  private readonly statusBarItem: vscode.StatusBarItem;

  /**
   * Private constructor to prevent direct instantiation
   * @param context - The VSCode extension context
   */
  private constructor(context: vscode.ExtensionContext) {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left
    );
    this.updateState(StatusBarState.Idle, 'Idle - Click to pause');
    this.statusBarItem.show();

    context.subscriptions.push(this.statusBarItem);
  }

  /**
   * Retrieves the singleton instance of StatusBarManager.
   * @param context - The VSCode extension context.
   * @returns The singleton instance.
   */
  public static getInstance(
    context?: vscode.ExtensionContext
  ): StatusBarManager {
    if (!StatusBarManager.instance) {
      if (!context) {
        throw new Error(
          'Extension context must be provided on first call to getInstance.'
        );
      }
      StatusBarManager.instance = new StatusBarManager(context);
    }
    return StatusBarManager.instance;
  }

  /**
   * Updates the state of the status bar item.
   *
   * @param state - The new state to be displayed in the status bar.
   * @param tooltip - The tooltip text to be shown when hovering over the status bar item.
   */
  public updateState(state: StatusBarState, tooltip: string) {
    this.statusBarItem.text = `$(${state})`;
    this.statusBarItem.tooltip = `${this.extensionName} - ${tooltip}`;
  }

  /**
   * Sets the status bar to the idle state.
   * This method updates the status bar state to `Idle` and displays 'Idle - Click to pause' as the status text.
   */
  public setIdle() {
    this.updateState(StatusBarState.Idle, 'Idle - Click to pause');
  }

  /**
   * Sets a click handler for the status bar item.
   *
   * @param commandLabel - A descriptive label for the command, used in the tooltip.
   * @param commandName - The name of the command to be executed when the status bar item is clicked.
   * @param handler - A callback function to be executed when the command is triggered.
   */
  public setClickHandler(commandName: string) {
    this.statusBarItem.command = {
      title: this.extensionName,
      command: commandName,
    };
  }

  public static disposeInstance() {
    if (StatusBarManager.instance) {
      StatusBarManager.instance.statusBarItem.dispose();
      StatusBarManager.instance = null;
    }

    Logger.getInstance().log(LogLevel.INFO, 'Disposed status bar instance');
  }
}
