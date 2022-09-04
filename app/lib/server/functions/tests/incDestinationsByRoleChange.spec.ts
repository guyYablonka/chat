import { IRoom } from '../../../../../definition/IRoom';

type RoomTypeAndDestinations = Pick<IRoom, 't' | '_id' | 'destinations'>;

let rooms: RoomTypeAndDestinations[] = [];

const incDestinationsCount = jest.fn();

jest.doMock('../../../../models/server', () => ({
    Rooms: {
        findBySubscriptionUserId: () => ({ fetch: () => rooms }),
        incDestinationsCount
    }
}));

jest.mock('../../../../utils/server', () => ({
    RoomTypes: {
        DM: 'd',
        PRIVATE_GROUP: 'p',
        CHANNEL: 'c'
    }
}));

const extractRoomCreation = jest.fn();
const extractDirectRoomCreation = jest.fn();

jest.doMock('../extractions', () => ({
    extractRoomCreation,
    extractDirectRoomCreation
}));

import { incDestinationsByRoleChange } from '../incDestinationsByRoleChange';

const testUserId = 'user-id';

describe('incDestinationsByRoleChange', () => {
    describe('no roles added', () => {
        beforeAll(() => {
            jest.clearAllMocks();
            rooms = [
                { _id: '1', t: 'd', destinations: {} },
                { _id: '2', t: 'p', destinations: { 'aman-user': 2 } }
            ];

            incDestinationsByRoleChange(testUserId, []);
        });

        it('should not change destinations', () => {
            expect(incDestinationsCount).not.toHaveBeenCalled();
        });

        it('should not call extract functions', () => {
            expect(extractRoomCreation).not.toHaveBeenCalled();
            expect(extractDirectRoomCreation).not.toHaveBeenCalled();
        });
    });

    describe('roles added', () => {
        describe('user has no rooms', () => {
            beforeAll(() => {
                jest.clearAllMocks();

                rooms = [];

                incDestinationsByRoleChange(testUserId, [
                    'aman-user',
                    'masoah-user'
                ]);
            });

            it('should not change destinations', () => {
                expect(incDestinationsCount).not.toHaveBeenCalled();
            });

            it('should not call extract functions', () => {
                expect(extractRoomCreation).not.toHaveBeenCalled();
                expect(extractDirectRoomCreation).not.toHaveBeenCalled();
            });
        });

        describe('user has only direct rooms', () => {
            beforeAll(() => {
                jest.clearAllMocks();

                rooms = [
                    { _id: '1', t: 'd', destinations: {} },
                    { _id: '2', t: 'd', destinations: { 'aman-user': 1 } }
                ];

                incDestinationsByRoleChange(testUserId, ['masoah-user']);
            });

            it('should inc destinations in all rooms', () => {
                expect(incDestinationsCount).toHaveBeenCalledTimes(2);
            });

            it('should call extractDirectRoomCreation', () => {
                expect(extractDirectRoomCreation).toHaveBeenCalledWith('1');
                expect(extractDirectRoomCreation).toHaveBeenCalledWith('2');
            });

            it('should not call extractRoomCreation', () => {
                expect(extractRoomCreation).not.toHaveBeenCalled();
            });
        });

        describe('user has only group rooms', () => {
            beforeAll(() => {
                jest.clearAllMocks();

                rooms = [
                    { _id: '1', t: 'p', destinations: {} },
                    {
                        _id: '2',
                        t: 'p',
                        destinations: { 'aman-user': 2, 'masoah-user': 1 }
                    },
                    { _id: '3', t: 'p', destinations: { 'masoah-user': 2 } }
                ];

                incDestinationsByRoleChange(testUserId, [
                    'masoah-user',
                    'aman-user'
                ]);
            });

            it('should inc destinations in all rooms', () => {
                expect(incDestinationsCount).toHaveBeenCalledTimes(6);
            });

            it('should call extractRoomCreation', () => {
                expect(extractRoomCreation).toHaveBeenCalledWith('1');
                expect(extractRoomCreation).toHaveBeenCalledWith('3');
                expect(extractRoomCreation).not.toHaveBeenCalledWith('2');
            });

            it('should not call extractDirectRoomCreation', () => {
                expect(extractDirectRoomCreation).not.toHaveBeenCalled();
            });
        });

        describe('user has both direct & group rooms', () => {
            beforeAll(() => {
                jest.clearAllMocks();

                rooms = [
                    { _id: '1', t: 'p', destinations: {} },
                    {
                        _id: '2',
                        t: 'p',
                        destinations: { 'aman-user': 2, 'masoah-user': 1 }
                    },
                    { _id: '3', t: 'p', destinations: { 'masoah-user': 2 } },
                    { _id: '4', t: 'd', destinations: {} },
                    { _id: '5', t: 'd', destinations: { 'aman-user': 1 } }
                ];

                incDestinationsByRoleChange(testUserId, ['aman-user']);
            });

            it('should inc destinations in all rooms', () => {
                expect(incDestinationsCount).toHaveBeenCalledTimes(5);
            });

            it('should call extractRoomCreation', () => {
                expect(extractRoomCreation).toHaveBeenCalledWith('1');
                expect(extractRoomCreation).toHaveBeenCalledWith('3');
                expect(extractRoomCreation).toHaveBeenCalledTimes(2);
            });

            it('should call extractDirectRoomCreation', () => {
                expect(extractDirectRoomCreation).toHaveBeenCalledWith('4');
                expect(extractDirectRoomCreation).toHaveBeenCalledTimes(1);
            });
        });
    });
});
