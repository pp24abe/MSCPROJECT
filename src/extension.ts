import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
  let panel: vscode.WebviewPanel | undefined;

  // 1) Register the command to open the Form Builder Webview
  const openBuilder = vscode.commands.registerCommand(
    'formBuilder.openBuilder',
    () => {
      panel = vscode.window.createWebviewPanel(
        'formBuilder',
        'Form Builder',
        vscode.ViewColumn.Beside,
        {
          enableScripts: true,
          localResourceRoots: [
            vscode.Uri.file(path.join(context.extensionPath, 'webview-ui', 'build'))
          ]
        }
      );
      
      const indexPath = path.join(
        context.extensionPath,
        'webview-ui',
        'build',
        'index.html'
      );
      let html = fs.readFileSync(indexPath, 'utf8');

      // Replace all src/href with webview URIs
      html = html.replace(/(src|href)="(.+?)"/g, (_, attr, srcPath) => {
        const absPath = vscode.Uri.file(
          path.join(context.extensionPath, 'webview-ui', 'build', srcPath)
        );
        const webviewUri = panel!.webview.asWebviewUri(absPath);
        return `${attr}="${webviewUri}"`;
      });

      // Inject the VS Code API into the webview
      html = html.replace(
        '</body>',
        `<script>window.vscode = acquireVsCodeApi();</script></body>`
      );

      panel.webview.html = html;

      // Listen for messages from React
      panel.webview.onDidReceiveMessage(async (message) => {
        switch (message.command) {
          case 'openGitHubOAuth':
            {
              // Open default browser at the OAuth entrypoint
              const oauthUrl = vscode.Uri.parse('http://localhost:4000/auth/github');
              await vscode.env.openExternal(oauthUrl);
            }
            break;

          case 'insertCode':
            {
              const formHTML: string = message.code;
              // Save the generated form HTML in global state
              await context.globalState.update('latestFormHTML', formHTML);

              // Insert into the active text editor
              let editor = vscode.window.activeTextEditor;
              if (!editor || !editor.document) {
                const visibleEditors = vscode.window.visibleTextEditors;
                if (visibleEditors.length > 0) {
                  editor = visibleEditors[0];
                  await vscode.window.showTextDocument(editor.document, editor.viewColumn);
                }
              }

              if (editor && editor.document) {
                await editor.edit((editBuilder) => {
                  editBuilder.insert(editor!.selection.active, formHTML);
                });
                vscode.window.showInformationMessage('✅ Form HTML inserted into active editor.');
              } else {
                vscode.window.showErrorMessage('❌ No active editor to insert the form.');
              }
            }
            break;
        }
      });

      // If we already have a token saved, send it to the webview immediately
      const existingToken = context.globalState.get<string>('github_token');
      if (existingToken) {
        panel.webview.postMessage({ command: 'setGitHubToken', token: existingToken });
      }
    }
  );

  // 2) Register a URI handler to catch “vscode://ppp.code-generator-vscode/auth?github_token=...”
  const uriHandler = vscode.window.registerUriHandler({
    handleUri(uri: vscode.Uri) {
      // Example: vscode://ppp.code-generator-vscode/auth?github_token=XYZ
      const query = new URLSearchParams(uri.query);
      const token = query.get('github_token');
      if (token) {
        // Persist token in global state
        context.globalState.update('github_token', token);

        // If the panel is already open, forward the token to React
        if (panel) {
          panel.webview.postMessage({ command: 'setGitHubToken', token });
        } else {
          // Optionally: open the builder automatically
          // vscode.commands.executeCommand('formBuilder.openBuilder');
        }
        vscode.window.showInformationMessage('GitHub authentication successful!');
      } else {
        vscode.window.showErrorMessage('GitHub authentication failed or was canceled.');
      }
    }
  });

  // 3) IntelliSense provider #1: “fcpro” snippet of latest form
  const suggestionProvider = vscode.languages.registerCompletionItemProvider(
    'html',
    {
      provideCompletionItems(document, position) {
        const latestForm = context.globalState.get<string>('latestFormHTML') || '';
        if (!latestForm) {
          return [];
        }
        const completion = new vscode.CompletionItem(
          'fcpro',
          vscode.CompletionItemKind.Snippet
        );
        completion.detail = 'Insert latest generated form';
        completion.insertText = new vscode.SnippetString(latestForm);
        completion.documentation = new vscode.MarkdownString(
          'Inserts the most recently generated form HTML'
        );
        return [completion];
      }
    },
    'f' // trigger on typing "f"
  );

  // 4) IntelliSense provider #2: “fcpro” keyword to open the builder
  const suggestionProvider1 = vscode.languages.registerCompletionItemProvider(
    'html',
    {
      provideCompletionItems(document, position) {
        const completion = new vscode.CompletionItem(
          'fcpro',
          vscode.CompletionItemKind.Keyword
        );
        completion.detail = 'Open FormCraft Pro Builder';
        completion.insertText = ''; // no direct text insertion
        completion.command = {
          command: 'formBuilder.openBuilder',
          title: 'Open FormCraft Pro'
        };
        completion.documentation = new vscode.MarkdownString(
          'Trigger the Form Builder UI'
        );
        return [completion];
      }
    },
    'f'
  );

  context.subscriptions.push(openBuilder, uriHandler, suggestionProvider, suggestionProvider1);
}

export function deactivate() {
  // Clean‐up if necessary
}
