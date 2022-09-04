import { AppServerOrchestratorMock } from './mocks/orchestrator.mock';
import {
	appMessageMock,
	appMessageInvalidRoomMock
} from './mocks/data/messages.data';
import { MessagesMock } from './mocks/models/Messages.mock';
import { RoomsMock } from './mocks/models/Rooms.mock';
import { UsersMock } from './mocks/models/Users.mock';

jest.doMock('../../../models/server', () => ({
	Users: { findOneById: id => UsersMock.convertedData[id] },
	Rooms: { findOneById: id => RoomsMock.convertedData[id] }
}));

const { AppMessagesConverter } = require('../converters/messages');

describe.skip('The AppMessagesConverter instance', () => {
	let messagesConverter;
	let messagesMock;

	beforeAll(() => {
		const orchestrator = new AppServerOrchestratorMock();

		const usersConverter = orchestrator.getConverters().get('users');

		usersConverter.convertById = function convertUserByIdStub(id) {
			return UsersMock.convertedData[id];
		};

		usersConverter.convertToApp = function convertUserToAppStub(user) {
			return {
				id: user._id,
				username: user.username,
				name: user.name
			};
		};

		orchestrator.getConverters().get('rooms').convertById =
			function convertRoomByIdStub(id) {
				return RoomsMock.convertedData[id];
			};

		messagesConverter = new AppMessagesConverter(orchestrator);
		messagesMock = new MessagesMock();
	});

	const createdAt = new Date('2019-03-30T01:22:08.389Z');
	const updatedAt = new Date('2019-03-30T01:22:08.412Z');

	describe('when converting a message from Rocket.Chat to the Engine schema', () => {
		it('should return `undefined` when `msgObj` is falsy', () => {
			const appMessage = messagesConverter.convertMessage(undefined);

			expect(appMessage).to.be.undefined;
		});

		it('should return a proper schema', () => {
			const appMessage = messagesConverter.convertMessage(
				messagesMock.findOneById('SimpleMessageMock')
			);

			expect(appMessage).toHaveProperty('id', 'SimpleMessageMock');
			expect(appMessage)
				.toHaveProperty('createdAt')
				.which.equalTime(createdAt);
			expect(appMessage)
				.toHaveProperty('updatedAt')
				.which.equalTime(updatedAt);
			expect(appMessage).toHaveProperty('groupable', false);
			expect(appMessage)
				.toHaveProperty('sender')
				.which.includes({ id: 'rocket.cat' });
			expect(appMessage)
				.toHaveProperty('room')
				.which.includes({ id: 'GENERAL' });

			expect(appMessage).not.toHaveProperty('editor');
			expect(appMessage).not.toHaveProperty('attachments');
			expect(appMessage).not.toHaveProperty('reactions');
			expect(appMessage).not.toHaveProperty('avatarUrl');
			expect(appMessage).not.toHaveProperty('alias');
			expect(appMessage).not.toHaveProperty('customFields');
			expect(appMessage).not.toHaveProperty('emoji');
		});

		it('should not mutate the original message object', () => {
			const rocketchatMessageMock =
				messagesMock.findOneById('SimpleMessageMock');

			messagesConverter.convertMessage(rocketchatMessageMock);

			expect(rocketchatMessageMock).to.deep.equal({
				_id: 'SimpleMessageMock',
				t: 'uj',
				rid: 'GENERAL',
				ts: new Date('2019-03-30T01:22:08.389Z'),
				msg: 'rocket.cat',
				u: {
					_id: 'rocket.cat',
					username: 'rocket.cat'
				},
				groupable: false,
				_updatedAt: new Date('2019-03-30T01:22:08.412Z')
			});
		});

		it('should add an `_unmappedProperties_` field to the converted message which contains the `t` property of the message', () => {
			const appMessage = messagesConverter.convertMessage(
				messagesMock.findOneById('SimpleMessageMock')
			);

			expect(appMessage)
				.toHaveProperty('_unmappedProperties_')
				.which.has.property('t', 'uj');
		});

		it("should return basic sender info when it's not a Rocket.Chat user (e.g. Livechat Guest)", () => {
			const appMessage = messagesConverter.convertMessage(
				messagesMock.findOneById('LivechatGuestMessageMock')
			);

			expect(appMessage).toHaveProperty('sender').which.includes({
				id: 'guest1234',
				username: 'guest1234',
				name: 'Livechat Guest'
			});
		});
	});

	describe('when converting a message from the Engine schema back to Rocket.Chat', () => {
		it('should return `undefined` when `message` is falsy', () => {
			const rocketchatMessage =
				messagesConverter.convertAppMessage(undefined);

			expect(rocketchatMessage).to.be.undefined;
		});

		it('should return a proper schema', () => {
			const rocketchatMessage =
				messagesConverter.convertAppMessage(appMessageMock);

			expect(rocketchatMessage).toHaveProperty('_id', 'appMessageMock');
			expect(rocketchatMessage).toHaveProperty('rid', 'GENERAL');
			expect(rocketchatMessage).toHaveProperty('groupable', false);
			expect(rocketchatMessage)
				.toHaveProperty('ts')
				.which.equalTime(createdAt);
			expect(rocketchatMessage)
				.toHaveProperty('_updatedAt')
				.which.equalTime(updatedAt);
			expect(rocketchatMessage).toHaveProperty('u').which.includes({
				_id: 'rocket.cat',
				username: 'rocket.cat',
				name: 'Rocket.Cat'
			});
		});

		it('should merge `_unmappedProperties_` into the returned message', () => {
			const rocketchatMessage =
				messagesConverter.convertAppMessage(appMessageMock);

			expect(rocketchatMessage).not.toHaveProperty(
				'_unmappedProperties_'
			);
			expect(rocketchatMessage).toHaveProperty('t', 'uj');
		});

		it('should throw if message has an invalid room', () => {
			expect(() =>
				messagesConverter.convertAppMessage(appMessageInvalidRoomMock)
			).toThrow(Error, 'Invalid room provided on the message.');
		});
	});
});
