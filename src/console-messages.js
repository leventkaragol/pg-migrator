"use strict";

module.exports = {
    USAGE_INFO: "\npg-migrator connectionString [targetVersion]\n\nconnectionString\tMust be a valid PostgreSQL ConnectionString like postgres://username:password@localhost/db\ntargetVersion\t\tOptional target version, might be +1, -1, version number or blank for the latest version available",
    CURRENT_VERSION: "Current Version : ",
    TARGET_VERSION: "Target Version : ",
    FIRST_INITIALIZE: "\"version\" table does not exist, will be created for the first time",
    CONNECTION_STRING_MUST_BE_PROVIDED: "ConnectionString must be provided",
    INVALID_TARGET_VERSION: "Target version parameter must be;\n* a valid number to migrate it\n* or +1 to roll one step forward\n* or -1 to roll one step back\n* or empty to migrate to the latest version available",
    ALREADY_MIGRATED: "Database is already migrated to the target version",
    MIGRATION_SCRIPT_NOT_FOUND: "There is no migration script file in current folder and sub-folders",
    FILE_NOT_FOUND: "Migration script could not be found : ",
    NO_MORE_ROLLBACK: "Database at the initial state, can't roll back more",
    CONNECTION_ERROR: "Could not be connect to PostgreSQL, Error Detail : ",
    MIGRATION_COMPLETED: "Migration has been completed successfully\nCurrent database version : "
};