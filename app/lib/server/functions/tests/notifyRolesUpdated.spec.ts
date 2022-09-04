jest.mock('../extractions', () => ({
    extractRoomCreation: jest.fn(),
    extractDirectRoomCreation: jest.fn()
}));

jest.mock('../../../../settings/server', () => ({
    settings: {
        get: () => JSON.stringify(['aman-user', 'masoah-user'])
    }
}));

const incDestinationsByRoleChange = jest.fn();
const decDestinationsByRoleChange = jest.fn();

jest.doMock('../incDestinationsByRoleChange', () => ({
    incDestinationsByRoleChange
}));

jest.doMock('../decDestinationsByRoleChange', () => ({
    decDestinationsByRoleChange
}));

const testUserId = 'user-id';

import { notifyRolesUpdated } from '../notifyRolesUpdated';

describe('notifyRolesUpdated', () => {
    describe('no destinations roles removed nor added', () => {
        beforeAll(() => {
            jest.clearAllMocks();

            notifyRolesUpdated(
                testUserId,
                ['user', 'user-creator'],
                ['user', 'mobile-user']
            );
        });

        it('should call dec with empty array', () => {
            expect(decDestinationsByRoleChange).toHaveBeenCalledWith(
                testUserId,
                []
            );
        });

        it('should call inc with empty array', () => {
            expect(incDestinationsByRoleChange).toHaveBeenCalledWith(
                testUserId,
                []
            );
        });
    });

    describe('destination roles removed', () => {
        beforeAll(() => {
            jest.clearAllMocks();
            notifyRolesUpdated(testUserId, ['user', 'aman-user'], ['user']);
        });

        it('should call dec with relevant roles', () => {
            expect(decDestinationsByRoleChange).toHaveBeenCalledWith(
                testUserId,
                ['aman-user']
            );
        });

        it('should call inc with empty array', () => {
            expect(incDestinationsByRoleChange).toHaveBeenCalledWith(
                testUserId,
                []
            );
        });
    });

    describe('destination roles added', () => {
        beforeAll(() => {
            jest.clearAllMocks();
            notifyRolesUpdated(testUserId, ['user'], ['masoah-user', 'user']);
        });

        it('should call dec with empty array', () => {
            expect(decDestinationsByRoleChange).toHaveBeenCalledWith(
                testUserId,
                []
            );
        });

        it('should call inc with relevant roles', () => {
            expect(incDestinationsByRoleChange).toHaveBeenCalledWith(
                testUserId,
                ['masoah-user']
            );
        });
    });

    describe('destination roles added and removed', () => {
        beforeAll(() => {
            jest.clearAllMocks();

            notifyRolesUpdated(
                testUserId,
                ['user', 'masoah-user'],
                ['aman-user', 'user', 'mobile-user']
            );
        });

        it('should call dec with relevant roles', () => {
            expect(decDestinationsByRoleChange).toHaveBeenCalledWith(
                testUserId,
                ['masoah-user']
            );
        });

        it('should call inc with relevant roles', () => {
            expect(incDestinationsByRoleChange).toHaveBeenCalledWith(
                testUserId,
                ['aman-user']
            );
        });
    });
});
