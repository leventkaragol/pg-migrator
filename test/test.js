describe("Migration", () => {

    beforeEach(() => {

        jest.clearAllMocks();
        jest.resetAllMocks();
        jest.resetModules();
    });

    test("Simple forward migration with no version table", async () => {

        const pgClient = {
            connect: jest.fn(),
            query: jest.fn()
                .mockImplementationOnce(() => Promise.resolve({rows: [], rowCount: 0})) // BEGIN TRANSACTION
                .mockImplementationOnce(() => Promise.resolve({rows: [{value: false}], rowCount: 1})) // Table check
                .mockImplementationOnce(() => Promise.resolve({rows: [], rowCount: 0})) // Create table
                .mockImplementationOnce(() => Promise.resolve({rows: [], rowCount: 0})) // Insert Row
                .mockImplementationOnce(() => Promise.resolve({rows: [], rowCount: 0})) // 1-2.sql
                .mockImplementationOnce(() => Promise.resolve({rows: [], rowCount: 0})) // 2-3.sql
                .mockImplementationOnce(() => Promise.resolve({rows: [], rowCount: 0})) // 3-4.sql
                .mockImplementationOnce(() => Promise.resolve({rows: [], rowCount: 0})) // 4-5.sql
                .mockImplementationOnce(() => Promise.resolve({rows: [], rowCount: 0})) // Update version
                .mockImplementationOnce(() => Promise.resolve({rows: [], rowCount: 0})), // COMMIT TRANSACTION
            end: jest.fn()
        };

        const querySpy = jest.spyOn(pgClient, "query");

        const mockClient = jest.fn(() => pgClient);

        jest.mock("pg", () => {

            return {Client: mockClient};
        });

        const Application = require("../src/application");

        const args = ["postgres://user:password@localhost/testdb"];

        const application = new Application();

        await application.run(args, "examples");

        expect(querySpy).toHaveBeenCalledTimes(10);

        expect(querySpy).toHaveBeenNthCalledWith(1, "BEGIN TRANSACTION");
        expect(querySpy).toHaveBeenNthCalledWith(2, "SELECT EXISTS(SELECT * FROM information_schema.tables  WHERE table_name = 'version') as value");
        expect(querySpy).toHaveBeenNthCalledWith(3, "CREATE TABLE version (value integer)");
        expect(querySpy).toHaveBeenNthCalledWith(4, "INSERT INTO version(value) VALUES(1)");
        expect(querySpy).toHaveBeenNthCalledWith(9, "UPDATE version SET value = $1", [5]);
        expect(querySpy).toHaveBeenNthCalledWith(10, "COMMIT TRANSACTION");
    });

    test("Simple forward migration with version table", async () => {

        const pgClient = {
            connect: jest.fn(),
            query: jest.fn()
                .mockImplementationOnce(() => Promise.resolve({rows: [], rowCount: 0})) // BEGIN TRANSACTION
                .mockImplementationOnce(() => Promise.resolve({rows: [{value: true}], rowCount: 1})) // Table check
                .mockImplementationOnce(() => Promise.resolve({rows: [{value: 2}], rowCount: 1})) // Select version
                .mockImplementationOnce(() => Promise.resolve({rows: [], rowCount: 0})) // 2-3.sql
                .mockImplementationOnce(() => Promise.resolve({rows: [], rowCount: 0})) // 3-4.sql
                .mockImplementationOnce(() => Promise.resolve({rows: [], rowCount: 0})) // 4-5.sql
                .mockImplementationOnce(() => Promise.resolve({rows: [], rowCount: 0})) // Update version
                .mockImplementationOnce(() => Promise.resolve({rows: [], rowCount: 0})), // COMMIT TRANSACTION
            end: jest.fn()
        };

        const querySpy = jest.spyOn(pgClient, "query");

        const mockClient = jest.fn(() => pgClient);

        jest.mock("pg", () => {

            return {Client: mockClient};
        });

        const Application = require("../src/application");

        const args = ["postgres://user:password@localhost/testdb"];

        const application = new Application();

        await application.run(args, "examples");

        expect(querySpy).toHaveBeenCalledTimes(8);

        expect(querySpy).toHaveBeenNthCalledWith(1, "BEGIN TRANSACTION");
        expect(querySpy).toHaveBeenNthCalledWith(2, "SELECT EXISTS(SELECT * FROM information_schema.tables  WHERE table_name = 'version') as value");
        expect(querySpy).toHaveBeenNthCalledWith(3, "SELECT value FROM version");
        expect(querySpy).toHaveBeenNthCalledWith(7, "UPDATE version SET value = $1", [5]);
        expect(querySpy).toHaveBeenNthCalledWith(8, "COMMIT TRANSACTION");
    });

    test("+1 forward migration", async () => {

        const pgClient = {
            connect: jest.fn(),
            query: jest.fn()
                .mockImplementationOnce(() => Promise.resolve({rows: [], rowCount: 0})) // BEGIN TRANSACTION
                .mockImplementationOnce(() => Promise.resolve({rows: [{value: true}], rowCount: 1})) // Table check
                .mockImplementationOnce(() => Promise.resolve({rows: [{value: 2}], rowCount: 1})) // Select version
                .mockImplementationOnce(() => Promise.resolve({rows: [], rowCount: 0})) // 2-3.sql
                .mockImplementationOnce(() => Promise.resolve({rows: [], rowCount: 0})) // Update version
                .mockImplementationOnce(() => Promise.resolve({rows: [], rowCount: 0})), // COMMIT TRANSACTION
            end: jest.fn()
        };

        const querySpy = jest.spyOn(pgClient, "query");

        const mockClient = jest.fn(() => pgClient);

        jest.mock("pg", () => {

            return {Client: mockClient};
        });

        const Application = require("../src/application");

        const args = ["postgres://user:password@localhost/testdb", "+1"];

        const application = new Application();

        await application.run(args, "examples");

        expect(querySpy).toHaveBeenCalledTimes(6);

        expect(querySpy).toHaveBeenNthCalledWith(1, "BEGIN TRANSACTION");
        expect(querySpy).toHaveBeenNthCalledWith(2, "SELECT EXISTS(SELECT * FROM information_schema.tables  WHERE table_name = 'version') as value");
        expect(querySpy).toHaveBeenNthCalledWith(3, "SELECT value FROM version");
        expect(querySpy).toHaveBeenNthCalledWith(5, "UPDATE version SET value = $1", [3]);
        expect(querySpy).toHaveBeenNthCalledWith(6, "COMMIT TRANSACTION");
    });

    test("-1 backward migration", async () => {

        const pgClient = {
            connect: jest.fn(),
            query: jest.fn()
                .mockImplementationOnce(() => Promise.resolve({rows: [], rowCount: 0})) // BEGIN TRANSACTION
                .mockImplementationOnce(() => Promise.resolve({rows: [{value: true}], rowCount: 1})) // Table check
                .mockImplementationOnce(() => Promise.resolve({rows: [{value: 3}], rowCount: 1})) // Select version
                .mockImplementationOnce(() => Promise.resolve({rows: [], rowCount: 0})) // 2-3.sql
                .mockImplementationOnce(() => Promise.resolve({rows: [], rowCount: 0})) // Update version
                .mockImplementationOnce(() => Promise.resolve({rows: [], rowCount: 0})), // COMMIT TRANSACTION
            end: jest.fn()
        };

        const querySpy = jest.spyOn(pgClient, "query");

        const mockClient = jest.fn(() => pgClient);

        jest.mock("pg", () => {

            return {Client: mockClient};
        });

        const Application = require("../src/application");

        const args = ["postgres://user:password@localhost/testdb", "-1"];

        const application = new Application();

        await application.run(args, "examples");

        expect(querySpy).toHaveBeenCalledTimes(6);

        expect(querySpy).toHaveBeenNthCalledWith(1, "BEGIN TRANSACTION");
        expect(querySpy).toHaveBeenNthCalledWith(2, "SELECT EXISTS(SELECT * FROM information_schema.tables  WHERE table_name = 'version') as value");
        expect(querySpy).toHaveBeenNthCalledWith(3, "SELECT value FROM version");
        expect(querySpy).toHaveBeenNthCalledWith(5, "UPDATE version SET value = $1", [2]);
        expect(querySpy).toHaveBeenNthCalledWith(6, "COMMIT TRANSACTION");
    });

    test("Numbered forward migration", async () => {

        const pgClient = {
            connect: jest.fn(),
            query: jest.fn()
                .mockImplementationOnce(() => Promise.resolve({rows: [], rowCount: 0})) // BEGIN TRANSACTION
                .mockImplementationOnce(() => Promise.resolve({rows: [{value: true}], rowCount: 1})) // Table check
                .mockImplementationOnce(() => Promise.resolve({rows: [{value: 2}], rowCount: 1})) // Select version
                .mockImplementationOnce(() => Promise.resolve({rows: [], rowCount: 0})) // 2-3.sql
                .mockImplementationOnce(() => Promise.resolve({rows: [], rowCount: 0})) // 3-4.sql
                .mockImplementationOnce(() => Promise.resolve({rows: [], rowCount: 0})) // Update version
                .mockImplementationOnce(() => Promise.resolve({rows: [], rowCount: 0})), // COMMIT TRANSACTION
            end: jest.fn()
        };

        const querySpy = jest.spyOn(pgClient, "query");

        const mockClient = jest.fn(() => pgClient);

        jest.mock("pg", () => {

            return {Client: mockClient};
        });

        const Application = require("../src/application");

        const args = ["postgres://user:password@localhost/testdb", "4"];

        const application = new Application();

        await application.run(args, "examples");

        expect(querySpy).toHaveBeenCalledTimes(7);

        expect(querySpy).toHaveBeenNthCalledWith(1, "BEGIN TRANSACTION");
        expect(querySpy).toHaveBeenNthCalledWith(2, "SELECT EXISTS(SELECT * FROM information_schema.tables  WHERE table_name = 'version') as value");
        expect(querySpy).toHaveBeenNthCalledWith(3, "SELECT value FROM version");
        expect(querySpy).toHaveBeenNthCalledWith(6, "UPDATE version SET value = $1", [4]);
        expect(querySpy).toHaveBeenNthCalledWith(7, "COMMIT TRANSACTION");
    });

    test("Numbered backward migration", async () => {

        const pgClient = {
            connect: jest.fn(),
            query: jest.fn()
                .mockImplementationOnce(() => Promise.resolve({rows: [], rowCount: 0})) // BEGIN TRANSACTION
                .mockImplementationOnce(() => Promise.resolve({rows: [{value: true}], rowCount: 1})) // Table check
                .mockImplementationOnce(() => Promise.resolve({rows: [{value: 4}], rowCount: 1})) // Select version
                .mockImplementationOnce(() => Promise.resolve({rows: [], rowCount: 0})) // 2-3.sql
                .mockImplementationOnce(() => Promise.resolve({rows: [], rowCount: 0})) // 3-4.sql
                .mockImplementationOnce(() => Promise.resolve({rows: [], rowCount: 0})) // Update version
                .mockImplementationOnce(() => Promise.resolve({rows: [], rowCount: 0})), // COMMIT TRANSACTION
            end: jest.fn()
        };

        const querySpy = jest.spyOn(pgClient, "query");

        const mockClient = jest.fn(() => pgClient);

        jest.mock("pg", () => {

            return {Client: mockClient};
        });

        const Application = require("../src/application");

        const args = ["postgres://user:password@localhost/testdb", "2"];

        const application = new Application();

        await application.run(args, "examples");

        expect(querySpy).toHaveBeenCalledTimes(7);

        expect(querySpy).toHaveBeenNthCalledWith(1, "BEGIN TRANSACTION");
        expect(querySpy).toHaveBeenNthCalledWith(2, "SELECT EXISTS(SELECT * FROM information_schema.tables  WHERE table_name = 'version') as value");
        expect(querySpy).toHaveBeenNthCalledWith(3, "SELECT value FROM version");
        expect(querySpy).toHaveBeenNthCalledWith(6, "UPDATE version SET value = $1", [2]);
        expect(querySpy).toHaveBeenNthCalledWith(7, "COMMIT TRANSACTION");
    });

    test("Numbered no migration", async () => {

        const pgClient = {
            connect: jest.fn(),
            query: jest.fn()
                .mockImplementationOnce(() => Promise.resolve({rows: [], rowCount: 0})) // BEGIN TRANSACTION
                .mockImplementationOnce(() => Promise.resolve({rows: [{value: true}], rowCount: 1})) // Table check
                .mockImplementationOnce(() => Promise.resolve({rows: [{value: 2}], rowCount: 1})), // Select version
            end: jest.fn()
        };

        const querySpy = jest.spyOn(pgClient, "query");

        const mockClient = jest.fn(() => pgClient);

        jest.mock("pg", () => {

            return {Client: mockClient};
        });

        const Application = require("../src/application");

        const args = ["postgres://user:password@localhost/testdb", "2"];

        const application = new Application();

        jest.spyOn(process, "exit")
            .mockImplementation((number) => {
                throw new Error("process.exit: " + number);
            });

        try {

            await application.run(args, "examples");

        } catch (error) {

            expect(error.message).toBe("process.exit: 0");
        }

        expect(querySpy).toHaveBeenCalledTimes(3);

        expect(querySpy).toHaveBeenNthCalledWith(1, "BEGIN TRANSACTION");
        expect(querySpy).toHaveBeenNthCalledWith(2, "SELECT EXISTS(SELECT * FROM information_schema.tables  WHERE table_name = 'version') as value");
        expect(querySpy).toHaveBeenNthCalledWith(3, "SELECT value FROM version");
    });

    test("Invalid call with no args", async () => {

        const pgClient = {
            connect: jest.fn(),
            query: jest.fn(),
            end: jest.fn()
        };

        const querySpy = jest.spyOn(pgClient, "query");

        const mockClient = jest.fn(() => pgClient);

        jest.mock("pg", () => {

            return {Client: mockClient};
        });

        const Application = require("../src/application");

        const args = [];

        const application = new Application();

        jest.spyOn(process, "exit")
            .mockImplementation((number) => {
                throw new Error("process.exit: " + number);
            });

        try {

            await application.run(args, "examples");

        } catch (error) {

            expect(error.message).toBe("process.exit: 1");
        }

        expect(querySpy).toHaveBeenCalledTimes(0);
    });

    test("Invalid call with NAN version", async () => {

        const pgClient = {
            connect: jest.fn(),
            query: jest.fn(),
            end: jest.fn()
        };

        const querySpy = jest.spyOn(pgClient, "query");

        const mockClient = jest.fn(() => pgClient);

        jest.mock("pg", () => {

            return {Client: mockClient};
        });

        const Application = require("../src/application");

        const args = ["postgres://user:password@localhost/testdb", "abc"];

        const application = new Application();

        jest.spyOn(process, "exit")
            .mockImplementation((number) => {
                throw new Error("process.exit: " + number);
            });

        try {

            await application.run(args, "examples");

        } catch (error) {

            expect(error.message).toBe("process.exit: 1");
        }

        expect(querySpy).toHaveBeenCalledTimes(0);
    });

    test("Invalid call without scripts", async () => {

        const pgClient = {
            connect: jest.fn(),
            query: jest.fn(),
            end: jest.fn()
        };

        const querySpy = jest.spyOn(pgClient, "query");

        const mockClient = jest.fn(() => pgClient);

        jest.mock("pg", () => {

            return {Client: mockClient};
        });

        const Application = require("../src/application");

        const args = ["postgres://user:password@localhost/testdb"];

        const application = new Application();

        jest.spyOn(process, "exit")
            .mockImplementation((number) => {
                throw new Error("process.exit: " + number);
            });

        try {

            await application.run(args, "src");

        } catch (error) {

            expect(error.message).toBe("process.exit: 1");
        }

        expect(querySpy).toHaveBeenCalledTimes(0);
    });

    test("Invalid call with db connection error", async () => {

        const pgClient = {
            connect: jest.fn().mockImplementation(() => {
                throw new Error("DB Connection Error");
            }),
            query: jest.fn(),
            end: jest.fn()
        };

        const querySpy = jest.spyOn(pgClient, "query");

        const mockClient = jest.fn(() => pgClient);

        jest.mock("pg", () => {

            return {Client: mockClient};
        });

        const Application = require("../src/application");

        const args = ["postgres://user:password@localhost/testdb"];

        const application = new Application();

        jest.spyOn(process, "exit")
            .mockImplementation((number) => {
                throw new Error("process.exit: " + number);
            });

        try {

            await application.run(args, "examples");

        } catch (error) {

            expect(error.message).toBe("process.exit: 1");
        }

        expect(querySpy).toHaveBeenCalledTimes(0);
    });

    test("Invalid call with negative version", async () => {

        const pgClient = {
            connect: jest.fn(),
            query: jest.fn()
                .mockImplementationOnce(() => Promise.resolve({rows: [], rowCount: 0})) // BEGIN TRANSACTION
                .mockImplementationOnce(() => Promise.resolve({rows: [{value: true}], rowCount: 1})) // Table check
                .mockImplementationOnce(() => Promise.resolve({rows: [{value: 1}], rowCount: 1})), // Select version
            end: jest.fn()
        };

        const querySpy = jest.spyOn(pgClient, "query");

        const mockClient = jest.fn(() => pgClient);

        jest.mock("pg", () => {

            return {Client: mockClient};
        });

        const Application = require("../src/application");

        const args = ["postgres://user:password@localhost/testdb", "-1"];

        const application = new Application();

        jest.spyOn(process, "exit")
            .mockImplementation((number) => {
                throw new Error("process.exit: " + number);
            });

        try {

            await application.run(args, "examples");

        } catch (error) {

            expect(error.message).toBe("process.exit: 1");
        }

        expect(querySpy).toHaveBeenCalledTimes(3);

        expect(querySpy).toHaveBeenNthCalledWith(1, "BEGIN TRANSACTION");
        expect(querySpy).toHaveBeenNthCalledWith(2, "SELECT EXISTS(SELECT * FROM information_schema.tables  WHERE table_name = 'version') as value");
        expect(querySpy).toHaveBeenNthCalledWith(3, "SELECT value FROM version");
    });
});