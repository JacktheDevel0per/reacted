const vscode = require('vscode');


/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {


    console.log('Reacted is now active!');


    let disposable = vscode.commands.registerCommand('reacted.newComponent', function() {

        vscode.window.showInformationMessage('Create React Component');
    });

    context.subscriptions.push(disposable);
}


function deactivate() {}

module.exports = {
    activate,
    deactivate
}