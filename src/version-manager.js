"use strict";

module.exports = class VersionManager {

    constructor(persister) {

        this._persister = persister;
    }

    async get() {

        let tableExistsResult = await this._persister.query("SELECT EXISTS(SELECT * FROM information_schema.tables  WHERE table_name = 'version') as value");

        if (tableExistsResult.rows[0].value) {

            let versionResult = await this._persister.query("SELECT value FROM version");

            return versionResult.rows[0].value;

        } else {

            await this._persister.query("CREATE TABLE version (value integer)");

            await this._persister.query("INSERT INTO version(value) VALUES(1)");

            return 1;
        }
    }

    async update(version) {

        await this._persister.query("UPDATE version SET value = $1", [version]);
    }
};