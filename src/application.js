"use strict";

const pg = require("pg"),
    fs = require("fs");

const VersionManager = require("./version-manager"),
    Validator = require("./validator"),
    ScriptManager = require("./script-manager"),
    consoleMessages = require("./console-messages");

module.exports = class Application {

    constructor() {

        const colors = require("colors");

        colors.setTheme({
            verbose: "cyan", info: "green", warn: "yellow", error: "red"
        });
    }

    async run(args, workingDirectory = ".") {

        if (!new Validator(consoleMessages).validate(args)) {

            console.log(consoleMessages.USAGE_INFO.error);

            process.exit(1);
        }

        const scriptFiles = new ScriptManager().getList(workingDirectory);

        if (scriptFiles.length === 0) {

            // There is no migration script file in current folder and sub-folders
            console.log(consoleMessages.MIGRATION_SCRIPT_NOT_FOUND.error);

            process.exit(1);
        }

        const persister = new pg.Client(args[0]);

        try {

            await persister.connect();

        } catch (err) {

            console.error((consoleMessages.CONNECTION_ERROR + err).error);

            process.exit(1);
        }

        await persister.query("BEGIN TRANSACTION");

        const versionManager = new VersionManager(persister);

        const currentVersion = await versionManager.get();

        let targetVersion;

        if (args.length < 2) {

            // User didn't specify target version
            // Looking for the file that has the biggest target version number
            targetVersion = Math.max(...scriptFiles.map(x => x.targetVersion));

        } else if (args[1] === "+1") {

            // One step forward request
            targetVersion = currentVersion + 1;

        } else if (args[1] === "-1") {

            // One step roll back request
            targetVersion = currentVersion - 1;

            if (currentVersion <= 1) {

                // DB in the initial state, can't go back no more
                console.log(consoleMessages.NO_MORE_ROLLBACK.error);

                process.exit(1);
            }

        } else {

            targetVersion = parseInt(args[1]);
        }

        console.log((consoleMessages.CURRENT_VERSION + currentVersion).verbose);
        console.log((consoleMessages.TARGET_VERSION + targetVersion).verbose);

        if (currentVersion === targetVersion) {
            // DB is already migrated to the target version
            console.log(consoleMessages.ALREADY_MIGRATED.warn);

            process.exit(0);
        }

        // Recursively call "executeScript" function until reach to target version
        await this._executeScript(persister, scriptFiles, currentVersion, targetVersion);

        await versionManager.update(targetVersion);

        await persister.query("COMMIT TRANSACTION");

        await persister.end();
    }

    async _executeScript(persister, scriptFiles, currentVersion, targetVersion) {

        const direction = currentVersion < targetVersion ? 1 : -1;

        // Calculate the version after migration step according to direction
        const nextVersion = currentVersion + direction;

        // Get migration step file
        const scriptFile = scriptFiles.find((file) => {
            return file.baseVersion === currentVersion && file.targetVersion === nextVersion
        });

        if (!scriptFile) {

            // Migration file is not found. Probably some steps missing, stop migration
            console.log((consoleMessages.FILE_NOT_FOUND + currentVersion + "-" + nextVersion + ".sql").error);

            process.exit(1);

        } else {

            // Get migration step script file content
            const scriptContent = fs.readFileSync(scriptFile.path, "utf8");

            // Execute migration step script file

            await persister.query(scriptContent);

            console.log("--------------------------------------------------".grey);

            console.log(scriptContent.white);

            console.log((currentVersion + "-" + nextVersion + ".sql executed").info);

            console.log("--------------------------------------------------".grey);

            // Update current version
            currentVersion += direction;

            if (currentVersion !== targetVersion) {

                // Recursive call until reach to target version
                await this._executeScript(persister, scriptFiles, currentVersion, targetVersion);
            }
        }
    }
};