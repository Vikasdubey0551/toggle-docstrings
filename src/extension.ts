import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  let isFoldActive: Boolean = false; 

  context.subscriptions.push(vscode.commands.registerCommand('toggle-docstrings.hideDocstrings', () => {
	vscode.commands.executeCommand('editor.foldAllBlockComments');
	isFoldActive = true;
	vscode.commands.executeCommand('setContext', 'isFoldActive', isFoldActive);
	vscode.window.showInformationMessage('Docstrings hidden!');
  }));

  context.subscriptions.push(vscode.commands.registerCommand('toggle-docstrings.showDocstrings', () => {
    vscode.window.showInformationMessage('Docstrings are visible!');
	isFoldActive = false;
	vscode.commands.executeCommand('setContext', 'isFoldActive', isFoldActive);
	vscode.commands.executeCommand('editor.unfoldAll');
  }));

  if (!isFoldActive) {
    vscode.commands.executeCommand('toggle-docstrings.hideDocstrings');
  } else {
    vscode.commands.executeCommand('toggle-docstrings.showDocstrings');
  }
}

export function deactivate() {
  // Clean up resources when the extension is deactivated
}
