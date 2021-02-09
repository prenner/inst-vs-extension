import * as vscode from 'vscode';
const { exec } = require('child_process');
const fetch = require('node-fetch');

export function livegrepSearch () {
    const text = getActiveText();
    openUrl(`https://livegrep.inseng.net/search/?q=${text}&fold_case=auto&regex=false&context=true`);
}

export async function instuiSearch () {
    let components = getActiveText().match(/{(.*?)}/) || [];
    if (!components) {
        return displayError('No Instui component found');
    }
    let component;
    // find content between brackets, trim, and split.
    components = components[1].trim().split(',').map((component: string) => component.trim());
    if (components.length > 1) {
        component = await promptRegexOptions(components, { placeHolder: 'Select a component to look up'});
        if (!component) {
            return;
        }
    } else {
        component = components[0];
    }
    openUrl(`https://instructure.design#${component}`);
}

export function getJiraTicket () {
    getCommit(async (err: String, { stdout, _ }: { stdout: String, _: String}) => {
        if (err) {
            return displayError('No ticket found');
        }
        const tickets = stdout.match(/((?!([A-Z0-9a-z]{1,10})-?$)[A-Z]{1}[A-Z0-9]+-\d+)/g) || [];
        let ticket;
        switch (tickets.length) {
            case 0:
                displayError('No ticket found');
                break;
            case 1:
                ticket = tickets[0];
                break;
            default:
                ticket = await promptRegexOptions(tickets, { placeHolder: 'Select a ticket to look up'});
                if (!ticket) {
                    return;
                }
        }
        openUrl(`https://instructure.atlassian.net/browse/${ticket}`)
    });
}

export function getGerritPS () {
    getCommit((err: String, {stdout, _}: {stdout: String, _: String}) => {
        if (err) {
            return displayError('No PS found');
        }
        const url = stdout.match(/https:\/\/gerrit\.instructure\.com(?:\/[\d]+)/);
        if (!url) {
            return displayError('No PS found');
        }
        openUrl(url[0]);
    });
}


async function promptRegexOptions (options: Array<string>, { placeHolder }: { placeHolder: string}) {
    const value = await vscode.window.showQuickPick(
        options,
        { placeHolder }
    );
    return value;
}


function getCommit (cb: Function) {
    const folderPath = vscode.workspace.rootPath;
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
        return cb('no active line');
    }
    const line = activeEditor.selection.active.line;
    const filename = activeEditor.document.fileName;
    const command = `cd ${folderPath} && git log -n 1 $(git blame -L ${line},${line} ${filename} | awk '{print $1}')`;
    exec(command, (err: String, stdout: String, stderr: String) => {
        if (err) {
            return cb('couldnt execute');
        }
        return cb(null, {stdout, stderr});
    });
}

function displayError (errorMsg: string) {
    return vscode.window.showErrorMessage(errorMsg);
}

function openUrl(url: string) {
    vscode.env.openExternal(vscode.Uri.parse(url));
}

function getActiveText() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        return editor.document.getText(editor.selection);
    }
    return '';
}