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
        if (!editor || editor.document.languageId !== 'python' || isFoldActive) {
            return;
        }

        const cursorPosition = editor.selection.active;
        const lineText = editor.document.lineAt(cursorPosition.line).text.trim();

        if (lineText.startsWith('"""') || lineText.startsWith("'''") || lineText.endsWith('"""') || lineText.endsWith("'''")) {
            vscode.window.showInformationMessage("Cursor is inside a docstring. Skipping fold to avoid unfolding.");
            return;
        }

        // Proceed with folding logic if the cursor is not detected inside a docstring
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
