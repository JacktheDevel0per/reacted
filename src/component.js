const fs = require("fs");
const path = require("path");
const vscode = require("vscode");





async function handleComponentCreateCommand(args) {
    const componentName = await vscode.window.showInputBox({
        prompt: `What is the name of your component?`,
        ignoreFocusOut: true,
        valueSelection: [-1, -1],
    });

    if (!componentName) {
        return;
    }

    if (args) {
        const path = args.fsPath;
        console.log(path);

        createComponent(componentName, path);
    } else {
        createComponent(componentName, null);
    }
}



const createComponent = async(componentName, dir) => {

    const COMPONENT_FILE_NAME = `${componentName}.jsx`;
    const projectRoot = (vscode.workspace.workspaceFolders)[0].uri.fsPath;

    if (!dir) {
        dir =
            (await vscode.window.showInputBox({
                value: "/",
                prompt: `File Path from root of project (e.g. /src/components)`,
                ignoreFocusOut: true,
                valueSelection: [-1, -1],
            })) || "";
    }
    if (!dir.includes(projectRoot)) {
        dir = projectRoot + dir;
    }
    if (dir[dir.length - 1] !== "/") {
        dir = dir + "/";
    }
    const filePath = (fileName) => dir + fileName;

    createDir(dir);


    await createComponentInFile(filePath(COMPONENT_FILE_NAME));

    setTimeout(() => {
        vscode.workspace
            .openTextDocument(filePath(COMPONENT_FILE_NAME))
            .then((editor) => {
                if (!editor) {
                    return;
                }
                vscode.window.showTextDocument(editor);

            });
    }, 50);
    setTimeout(() => {
        vscode.commands.executeCommand("editor.action.insertSnippet", { "name": "ReactedJS Component" });
    }, 100);
};

const createDir = (targetDir) => {
    const pathSeperator = path.sep;
    const initDir = path.isAbsolute(targetDir) ? pathSeperator : "";
    const baseDir = __dirname;

    return targetDir.split(pathSeperator).reduce((parentDir, childDir) => {
        const cwd = path.resolve(baseDir, parentDir, childDir);
        try {
            fs.mkdirSync(cwd);
        } catch (err) {
            if (err.code === "EEXIST") {
                return cwd;
            }

            // To avoid `EISDIR` error on Mac and `EACCES`-->`ENOENT` and `EPERM` on Windows.
            if (err.code === "ENOENT") {
                // Throw the original parentDir error on curDir `ENOENT` failure.
                throw new Error(`EACCES: permission denied, mkdir '${parentDir}'`);
            }

            const error = ["EACCES", "EPERM", "EISDIR"].indexOf(err.code) > -1;
            if (!error || (error && cwd === path.resolve(targetDir))) {
                throw err;
            }
        }

        return cwd;
    }, initDir);
};

const createComponentInFile = async(filePath) => {
    if (!fs.existsSync(filePath)) {
        fs.createWriteStream(filePath).close();

        fs.writeFile(filePath, "", (err) => {
            if (err) {
                vscode.window.showErrorMessage("ReactedJS is unable to write to the specified file");
            }
        });
    } else {
        vscode.window.showWarningMessage("That file already exists.");
    }
};



module.exports = handleComponentCreateCommand;