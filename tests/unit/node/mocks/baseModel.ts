jest.mock('../../../../app/models/server/models/_Base', () => ({
    Base: class {
        model = {
            rawDatabase() {
                return {
                    collection: jest.fn(),
                    options: {}
                };
            }
        };

        tryEnsureIndex = jest.fn();
    }
}));
