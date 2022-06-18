"use strict";

module.exports = class Validator {

    constructor(consoleMessages) {

        this._consoleMessages = consoleMessages;
    }

    validate(args) {

        if (args.length === 0) {

            // There is no argument provided but connection string argument is mandatory
            console.log(this._consoleMessages.CONNECTION_STRING_MUST_BE_PROVIDED.error);

            return false;
        }

        if (args.length > 1 && isNaN(args[1])) {

            // Target version is provided but not a valid number
            console.log(this._consoleMessages.INVALID_TARGET_VERSION.error);

            return false;
        }

        return true;
    }
};