jest.mock('../../../../app/logger/server', () => ({
    Logger: class {
        info = console.info;
        warn = console.warn;
        error = console.error;
    }
}));
