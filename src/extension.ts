// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { livegrepSearch, instuiSearch, getJiraTicket, getGerritPS } from './util';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const livegrep = vscode.commands.registerCommand('extension.livegrep', () => {
		livegrepSearch();
	});

	const instui = vscode.commands.registerCommand('extension.instuidocs', () => {
		instuiSearch();
	});

	const jira = vscode.commands.registerCommand('extension.jira', () => {
		getJiraTicket();
	});

  	const gerrit = vscode.commands.registerCommand('extension.gerrit', () => {
		getGerritPS();
	});

  	const commands = [livegrep, instui, jira, gerrit];
	context.subscriptions.concat(commands);
}

// this method is called when your extension is deactivated
export function deactivate() {}
