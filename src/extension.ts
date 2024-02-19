import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let isFoldActive: boolean = false;

    vscode.window.onDidChangeVisibleTextEditors((editors) => {
        editors.forEach((editor) => {
            if (editor.document.languageId === 'python') {
                vscode.commands.executeCommand('setContext', 'isPythonFile', true);
            }
        });
    });

    if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.languageId === 'python') {
        vscode.commands.executeCommand('setContext', 'isPythonFile', true);
    }

    context.subscriptions.push(vscode.commands.registerCommand('toggle-docstrings.hideDocstrings', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'python') {
            return;
        }

        const cursorPosition = editor.selection.active;
        const lineText = editor.document.lineAt(cursorPosition.line).text.trim();

        if (lineText.startsWith('"""') || lineText.startsWith("'''") || lineText.endsWith('"""') || lineText.endsWith("'''")) {
            if (cursorPosition.line > 0) {
                const newPosition = cursorPosition.with(cursorPosition.line - 1, cursorPosition.character);
                editor.selection = new vscode.Selection(newPosition, newPosition);
                editor.revealRange(new vscode.Range(newPosition, newPosition));
            }
        }

        await vscode.commands.executeCommand('editor.foldAllBlockComments');
        isFoldActive = true;
        vscode.commands.executeCommand('setContext', 'isFoldActive', isFoldActive);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('toggle-docstrings.showDocstrings', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || !isFoldActive) {
            return;
        }

        await vscode.commands.executeCommand('editor.unfoldAll');
        isFoldActive = false;
        vscode.commands.executeCommand('setContext', 'isFoldActive', isFoldActive);
    }));
}

export function deactivate() {}
