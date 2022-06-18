"use strict";

module.exports = class ScriptManager {

    getList(currentPath) {

        const fs = require("fs"),
            path = require("path");

        let sqlFiles = [];

        let files = fs.readdirSync(currentPath);

        for (let file of files) {

            let fullPath = `${currentPath}/${file}`;

            let stats = fs.statSync(fullPath);

            if (stats.isDirectory()) {

                // Looking for all files in all sub-directories recursively
                sqlFiles = sqlFiles.concat(this.getList(fullPath));

            } else if (stats.isFile()) {

                // Files must have an extension with ".sql" (case insensitive)
                // with and "x-y.sql" format that x and y must be valid numbers
                // Both numbers also must be sequential
                // All other files will be ignored
                if (path.extname(fullPath).toUpperCase() === ".SQL") {

                    let fileName = path.basename(fullPath, ".sql");

                    // There is no "-" sign, ignore the file
                    if (fileName.indexOf("-") === -1) {

                        continue;
                    }

                    // "x-y.sql"
                    // x: base version
                    // y: target version
                    let baseVersion = fileName.substring(0, fileName.indexOf("-"));
                    let targetVersion = fileName.substring(fileName.indexOf("-") + 1);

                    // x or y is not a valid number, ignore the file
                    if (!baseVersion || !targetVersion || isNaN(baseVersion) || isNaN(targetVersion)) {

                        continue;
                    }

                    // Make sure we use integers
                    baseVersion = parseInt(baseVersion);
                    targetVersion = parseInt(targetVersion);

                    // x and y are not sequential, ignore the file
                    if (Math.abs(baseVersion - targetVersion) !== 1) {

                        continue;
                    }

                    sqlFiles.push({baseVersion: baseVersion, targetVersion: targetVersion, path: fullPath});
                }
            }
        }

        return sqlFiles;
    }
};