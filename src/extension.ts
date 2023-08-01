import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  let isFoldActive: boolean = false;

  function updateContextForPythonFile(document: vscode.TextDocument) {
    const languageId = document.languageId;
    const isPythonFile = languageId === 'python';
    vscode.commands.executeCommand('setContext', 'isPythonFile', isPythonFile);
  }

  vscode.window.onDidChangeVisibleTextEditors((editors) => {
    editors.forEach((editor) => {
      const docUri = editor.document.uri;
      updateContextForPythonFile(editor.document);
    });
  });

  // Update context when extension is activated
  const activeEditor = vscode.window.activeTextEditor;
  if (activeEditor) {
    updateContextForPythonFile(activeEditor.document);
  }

  context.subscriptions.push(vscode.commands.registerCommand('toggle-docstrings.hideDocstrings', async () => {
    if (!isFoldActive) {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      const document = editor.document;
      const languageId = document.languageId;

      if (languageId !== 'python') {
        return;
      }

      const docstrings: vscode.Selection[] = [];
      let isInDocstring = false;
      let isSingleLineDocstring = false;

      for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
        const line = document.lineAt(lineIndex);
        const lineText = line.text.trim();

        if (lineText.startsWith('"""') || lineText.startsWith("'''")) {
          isInDocstring = !isInDocstring;

          if (isInDocstring) {
            const startChar = lineText.indexOf('"""') + 3;
            const endChar = lineText.length;
            const startPos = new vscode.Position(lineIndex, startChar);
            const endPos = new vscode.Position(lineIndex, endChar);
            docstrings.push(new vscode.Selection(startPos, endPos));
            // Reset single-line docstring flag when a new docstring starts
            isSingleLineDocstring = true;
          }
        } else if (isInDocstring && lineText.endsWith('"""') || lineText.endsWith("'''")) {
          isSingleLineDocstring = false;
          // Include the last line of a multi-line docstring
          const startPos = new vscode.Position(lineIndex, 0);
          const endPos = new vscode.Position(lineIndex, lineText.length);
          docstrings.push(new vscode.Selection(startPos, endPos));
        }

        if (isInDocstring && isSingleLineDocstring) {
          // Skip single-line docstrings
          continue;
        }

        if (isInDocstring) {
          const startPos = new vscode.Position(lineIndex, 0);
          const endPos = new vscode.Position(lineIndex, lineText.length);
          docstrings.push(new vscode.Selection(startPos, endPos));
        }
      }

      editor.selections = docstrings;

      await vscode.commands.executeCommand('editor.fold');

      editor.selections = [];

      if (docstrings.length > 0) {
        const firstLine = docstrings[0].start.line;
        const firstChar = docstrings[0].start.character;
        const position = new vscode.Position(firstLine, firstChar);
        editor.revealRange(new vscode.Range(position, position));
        editor.selection = new vscode.Selection(position, position);
      }

      isFoldActive = true;
      vscode.commands.executeCommand('setContext', 'isFoldActive', isFoldActive);
    }
  }));

  context.subscriptions.push(vscode.commands.registerCommand('toggle-docstrings.showDocstrings', async () => {
    if (isFoldActive) {
      isFoldActive = false;
      vscode.commands.executeCommand('editor.unfoldAll');
      vscode.commands.executeCommand('setContext', 'isFoldActive', isFoldActive);
    }
  }));
}

export function deactivate() {}
