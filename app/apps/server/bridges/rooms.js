import { RoomType } from '@rocket.chat/apps-engine/definition/rooms';
import { Meteor } from 'meteor/meteor';

import { addUserToRoom } from '../../../lib/server/functions/addUserToRoom';
import { Rooms, Subscriptions, Users } from '../../../models/server';

export class AppRoomBridge {
	constructor(orch) {
		this.orch = orch;
	}

	async create(room, members, appId) {
		this.orch.debugLog(`The App ${appId} is creating a new room.`, room);

		const rcRoom = this.orch
			.getConverters()
			.get('rooms')
			.convertAppRoom(room);
		let method;

		switch (room.type) {
			case RoomType.CHANNEL:
				method = 'createChannel';
				break;
			case RoomType.PRIVATE_GROUP:
				method = 'createPrivateGroup';
				break;
			case RoomType.DIRECT_MESSAGE:
				method = 'createDirectMessage';
				break;
			default:
				throw new Error(
					'Only channels, private groups and direct messages can be created.'
				);
		}

		let rid;
		Meteor.runAsUser(room.creator.id, () => {
			const extraData = Object.assign({}, rcRoom);
			delete extraData.name;
			delete extraData.t;
			delete extraData.ro;
			delete extraData.customFields;
			let info;
			if (room.type === RoomType.DIRECT_MESSAGE) {
				info = Meteor.call(method, ...members);
			} else {
				info = Meteor.call(
					method,
					rcRoom.name,
					members,
					rcRoom.ro,
					rcRoom.customFields,
					extraData
				);
			}
			rid = info.rid;
		});

		return rid;
	}

	async getById(roomId, appId) {
		this.orch.debugLog(
			`The App ${appId} is getting the roomById: "${roomId}"`
		);

		return this.orch.getConverters().get('rooms').convertById(roomId);
	}

	async getByName(roomName, appId) {
		this.orch.debugLog(
			`The App ${appId} is getting the roomByName: "${roomName}"`
		);

		return this.orch.getConverters().get('rooms').convertByName(roomName);
	}

	async getCreatorById(roomId, appId) {
		this.orch.debugLog(
			`The App ${appId} is getting the room's creator by id: "${roomId}"`
		);

		const room = Rooms.findOneById(roomId);

		if (!room || !room.u || !room.u._id) {
			return undefined;
		}

		return this.orch.getConverters().get('users').convertById(room.u._id);
	}

	async getCreatorByName(roomName, appId) {
		this.orch.debugLog(
			`The App ${appId} is getting the room's creator by name: "${roomName}"`
		);

		const room = Rooms.findOneByName(roomName);

		if (!room || !room.u || !room.u._id) {
			return undefined;
		}

		return this.orch.getConverters().get('users').convertById(room.u._id);
	}

	async getMembers(roomId, appId) {
		this.orch.debugLog(
			`The App ${appId} is getting the room's members by room id: "${roomId}"`
		);
		const subscriptions = await Subscriptions.findByRoomId(roomId);
		return subscriptions.map(sub =>
			this.orch
				.getConverters()
				.get('users')
				.convertById(sub.u && sub.u._id)
		);
	}

	async getDirectByUsernames(usernames, appId) {
		this.orch.debugLog(
			`The App ${appId} is getting direct room by usernames: "${usernames}"`
		);
		const room = await Rooms.findDirectRoomContainingAllUsernames(
			usernames
		);
		if (!room) {
			return undefined;
		}
		return this.orch.getConverters().get('rooms').convertRoom(room);
	}

	async update(room, members = [], appId) {
		this.orch.debugLog(`The App ${appId} is updating a room.`);

		if (!room.id || !Rooms.findOneById(room.id)) {
			throw new Error('A room must exist to update.');
		}

		const rm = this.orch.getConverters().get('rooms').convertAppRoom(room);

		Rooms.update(rm._id, rm);

		for (const username of members) {
			const member = Users.findOneByUsername(username);

			if (!member) {
				continue;
			}

			addUserToRoom(rm._id, member);
		}
	}

	async createDiscussion(
		room,
		parentMessage = null,
		reply = '',
		members = [],
		appId
	) {
		this.orch.debugLog(
			`The App ${appId} is creating a new discussion.`,
			room
		);

		const rcRoom = this.orch
			.getConverters()
			.get('rooms')
			.convertAppRoom(room);

		let rcMessage;
		if (parentMessage) {
			rcMessage = this.orch
				.getConverters()
				.get('messages')
				.convertAppMessage(parentMessage);
		}

		if (!rcRoom.prid || !Rooms.findOneById(rcRoom.prid)) {
			throw new Error(
				'There must be a parent room to create a discussion.'
			);
		}

		const discussion = {
			prid: rcRoom.prid,
			t_name: rcRoom.fname,
			pmid: rcMessage ? rcMessage._id : undefined,
			reply: reply && reply.trim() !== '' ? reply : undefined,
			users: members.length > 0 ? members : []
		};

		let rid;
		Meteor.runAsUser(room.creator.id, () => {
			const info = Meteor.call('createDiscussion', discussion);
			rid = info.rid;
		});

		return rid;
	}
}
