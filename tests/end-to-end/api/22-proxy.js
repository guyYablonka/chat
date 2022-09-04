import { expect } from 'chai';
import fs from 'fs';

import {
	getCredentials,
	api,
	request,
	credentials
} from '../../data/api-data.js';
import { addOwnerToRoom, createRoomAsUser } from '../../data/rooms.helper.js';
import {
	createUser,
	login,
	deleteUser,
	getUserByUsername
} from '../../data/users.helper';
import {
	proxyBotUsername,
	notAmanTestUsername,
	amanTestUsername,
	adminUsername,
	hamalTestUsername,
	password
} from '../../data/user';
import { priveteProxyGroup } from '../../data/channel';
import { Roles } from '../../../app/utils/lib/rolesConfig';
import { imgURL } from '../../data/interactions';

describe('[Proxy]', function () {
	this.retries(0);

	let proxyBotUser;
	let amanUser;
	let notAmanUser;
	let hamalUser;

	let botCredentials;

	before(async () => {
		await new Promise(done => getCredentials(done));

		proxyBotUser = await getUserByUsername(proxyBotUsername);
		amanUser = await getUserByUsername(amanTestUsername);
		notAmanUser = await getUserByUsername(notAmanTestUsername);
		hamalUser = await getUserByUsername(hamalTestUsername);

		proxyBotUser =
			proxyBotUser ||
			(await createUser(proxyBotUsername, [
				Roles.USER,
				Roles.AMAN_PROXY
			]));
		amanUser =
			amanUser ||
			(await createUser(amanTestUsername, [Roles.USER, Roles.AMAN_USER]));
		hamalUser =
			hamalUser ||
			(await createUser(hamalTestUsername, [
				Roles.USER,
				Roles.AMAN_USER
			]));
		notAmanUser = notAmanUser || (await createUser(notAmanTestUsername));

		botCredentials = await login(proxyBotUsername, password);
	});

	after(async () => {
		await deleteUser(proxyBotUser);
		await deleteUser(amanUser);
		await deleteUser(notAmanUser);
		await deleteUser(hamalUser);
	});

	describe('/dm.createAsUser', () => {
		it('should create a DM', done => {
			request
				.post(api('dm.createAsUser'))
				.set(botCredentials)
				.send({
					sender: amanUser.username,
					username: notAmanUser.username
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect(res => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.property('room');
					expect(res.body).to.have.nested.property('room.rid');
					expect(res.body).to.have.nested.property('room.t');
					expect(res.body).to.have.nested.property('room.usernames');
					expect(res.body).to.have.nested.property('room._id');
				})
				.end(done);
		});

		it("should fail - doesn't have role aman-proxy", done => {
			request
				.post(api('dm.createAsUser'))
				.set(credentials)
				.send({
					sender: amanUser.username,
					username: notAmanUser.username
				})
				.expect('Content-Type', 'application/json')
				.expect(403)
				.expect(res => {
					expect(res.body).to.have.property('success', false);
					expect(res.body).to.have.property('error', 'unauthorized');
				})
				.end(done);
		});

		it('should fail - missing parameter', done => {
			request
				.post(api('dm.createAsUser'))
				.set(botCredentials)
				.send({
					username: notAmanUser.username
				})
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect(res => {
					expect(res.body).to.have.property('success', false);
					expect(res.body).to.have.property(
						'error',
						'Parameter is missing. [error-invalid-params]'
					);
				})
				.end(done);
		});

		it('should fail - the sender is not aman user', done => {
			request
				.post(api('dm.createAsUser'))
				.set(botCredentials)
				.send({
					sender: adminUsername,
					usernames: notAmanUser.username
				})
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect(res => {
					expect(res.body).to.have.property('success', false);
					expect(res.body).to.have.property(
						'error',
						'User must have aman role. [error-invalid-user]'
					);
				})
				.end(done);
		});
	});

	describe('/groups.createAsUser', () => {
		it('should create a new group - using creator username', done => {
			request
				.post(api('groups.createAsUser'))
				.set(botCredentials)
				.send({
					creatorUsername: amanUser.username,
					name: `${priveteProxyGroup}-${Date.now()}`
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect(res => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.nested.property('group');
				})
				.end(done);
		});

		it('should create a new group - using creator email', done => {
			request
				.post(api('groups.createAsUser'))
				.set(botCredentials)
				.send({
					creatorUsername: amanUser.emails[0].address,
					name: `${priveteProxyGroup}-${Date.now()}`
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect(res => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.nested.property('group');
				})
				.end(done);
		});

		it('should create a new group - with members', done => {
			request
				.post(api('groups.createAsUser'))
				.set(botCredentials)
				.send({
					creatorUsername: amanUser.username,
					name: `${priveteProxyGroup}-${Date.now()}`,
					members: [notAmanUser.username]
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect(res => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.nested.property('group');
					expect(res.body).to.have.nested.property(
						'group.usersCount',
						2
					);
				})
				.end(done);
		});

		it('should fail - missing group name ', done => {
			request
				.post(api('groups.createAsUser'))
				.set(botCredentials)
				.send({
					creatorUsername: notAmanUser.username
				})
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect(res => {
					expect(res.body).to.have.property('success', false);
					expect(res.body).to.have.property(
						'error',
						"Match error: Missing key 'name'"
					);
				})
				.end(done);
		});

		it('should fail - param members wrong type', done => {
			request
				.post(api('groups.createAsUser'))
				.set(botCredentials)
				.send({
					creatorUsername: notAmanUser.username,
					name: `${priveteProxyGroup}-${Date.now()}`,
					members: notAmanUser.username
				})
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect(res => {
					expect(res.body).to.have.property('success', false);
					expect(res.body).to.have.property(
						'error',
						'Match error: Expected Array in field members'
					);
				})
				.end(done);
		});

		it('should fail - the creator user is not aman user', done => {
			request
				.post(api('groups.createAsUser'))
				.set(botCredentials)
				.send({
					creatorUsername: notAmanUser.username,
					name: `${priveteProxyGroup}-${Date.now()}`
				})
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect(res => {
					expect(res.body).to.have.property('success', false);
					expect(res.body).to.have.property(
						'error',
						'User must have aman role. [error-invalid-user]'
					);
				})
				.end(done);
		});

		it("should fail - doesn't have role aman-proxy", done => {
			request
				.post(api('groups.createAsUser'))
				.set(credentials)
				.send({
					creatorUsername: amanUser.username,
					name: `${priveteProxyGroup}-${Date.now()}`
				})
				.expect('Content-Type', 'application/json')
				.expect(403)
				.expect(res => {
					expect(res.body).to.have.property('success', false);
					expect(res.body).to.have.property('error', 'unauthorized');
				})
				.end(done);
		});
	});

	describe('/groups.addOwnerAsUser', () => {
		let amanGroup;

		before(async () => {
			amanGroup = await createRoomAsUser({
				creatorUsername: amanUser.username,
				name: `${priveteProxyGroup}-${Date.now()}`,
				members: [notAmanUser.username, hamalUser.username],
				userCredentials: botCredentials
			});
		});

		it("should fail - doesn't have role aman-proxy", done => {
			request
				.post(api('groups.addOwnerAsUser'))
				.set(credentials)
				.send({
					originUsername: amanUser.username,
					roomName: amanGroup.name,
					username: notAmanUser.username
				})
				.expect('Content-Type', 'application/json')
				.expect(403)
				.expect(res => {
					expect(res.body).to.have.property('success', false);
					expect(res.body).to.have.property('error', 'unauthorized');
				})
				.end(done);
		});

		it('should fail - missing param roomName', done => {
			request
				.post(api('groups.addOwnerAsUser'))
				.set(botCredentials)
				.send({
					originUsername: amanUser.username,
					username: notAmanUser.username
				})
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect(res => {
					expect(res.body).to.have.property('success', false);
					expect(res.body).to.have.property(
						'error',
						'The roomName parameter must be provided. [error-invalid-params]'
					);
				})
				.end(done);
		});

		it('should add not aman user as owner - using username', done => {
			request
				.post(api('groups.addOwnerAsUser'))
				.set(botCredentials)
				.send({
					originUsername: amanUser.username,
					roomName: amanGroup.name,
					username: notAmanUser.username
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect(res => {
					expect(res.body).to.have.property('success', true);
				})
				.end(done);
		});

		it('should fail - origin user is not aman user', done => {
			request
				.post(api('groups.addOwnerAsUser'))
				.set(botCredentials)
				.send({
					originUsername: notAmanUser.username,
					roomName: amanGroup.name,
					username: hamalUser.emails[0].address
				})
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect(res => {
					expect(res.body).to.have.property('success', false);
					expect(res.body).to.have.property(
						'error',
						'User must have aman role. [error-invalid-user]'
					);
				})
				.end(done);
		});

		it('should add aman user as owner - using emails', done => {
			request
				.post(api('groups.addOwnerAsUser'))
				.set(botCredentials)
				.send({
					originUsername: amanUser.username,
					roomName: amanGroup.name,
					username: hamalUser.emails[0].address
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect(res => {
					expect(res.body).to.have.property('success', true);
				})
				.end(done);
		});

		it('should fail - user is already an owner', done => {
			request
				.post(api('groups.addOwnerAsUser'))
				.set(botCredentials)
				.send({
					originUsername: amanUser.username,
					roomName: amanGroup.name,
					username: hamalUser.emails[0].address
				})
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect(res => {
					expect(res.body).to.have.property('success', false);
					expect(res.body).to.have.property(
						'error',
						'User is already an owner [error-user-already-owner]'
					);
				})
				.end(done);
		});
	});

	describe('/groups.removeOwnerAsUser', () => {
		let amanGroup;

		before(async () => {
			amanGroup = await createRoomAsUser({
				creatorUsername: amanUser.username,
				name: `${priveteProxyGroup}-${Date.now()}`,
				members: [notAmanUser.username, hamalUser.username],
				userCredentials: botCredentials
			});

			await request
				.post(api('groups.addOwnerAsUser'))
				.set(botCredentials)
				.send({
					originUsername: amanUser.username,
					roomName: amanGroup.name,
					username: notAmanUser.username
				});

			await request
				.post(api('groups.addOwnerAsUser'))
				.set(botCredentials)
				.send({
					originUsername: amanUser.username,
					roomName: amanGroup.name,
					username: hamalUser.username
				});
		});

		it("should fail - doesn't have role aman-proxy", done => {
			request
				.post(api('groups.removeOwnerAsUser'))
				.set(credentials)
				.send({
					originUsername: amanUser.username,
					roomName: amanGroup.name,
					username: notAmanUser.username
				})
				.expect('Content-Type', 'application/json')
				.expect(403)
				.expect(res => {
					expect(res.body).to.have.property('success', false);
					expect(res.body).to.have.property('error', 'unauthorized');
				})
				.end(done);
		});

		it('should fail - missing param roomName', done => {
			request
				.post(api('groups.removeOwnerAsUser'))
				.set(botCredentials)
				.send({
					originUsername: amanUser.username,
					username: notAmanUser.username
				})
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect(res => {
					expect(res.body).to.have.property('success', false);
					expect(res.body).to.have.property(
						'error',
						'The roomName parameter must be provided. [error-invalid-params]'
					);
				})
				.end(done);
		});

		it('should add not aman user as owner - using username', done => {
			request
				.post(api('groups.removeOwnerAsUser'))
				.set(botCredentials)
				.send({
					originUsername: amanUser.username,
					roomName: amanGroup.name,
					username: notAmanUser.username
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect(res => {
					expect(res.body).to.have.property('success', true);
				})
				.end(done);
		});

		it('should fail - origin user is not aman user', done => {
			request
				.post(api('groups.removeOwnerAsUser'))
				.set(botCredentials)
				.send({
					originUsername: notAmanUser.username,
					roomName: amanGroup.name,
					username: hamalUser.emails[0].address
				})
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect(res => {
					expect(res.body).to.have.property('success', false);
					expect(res.body).to.have.property(
						'error',
						'User must have aman role. [error-invalid-user]'
					);
				})
				.end(done);
		});

		it('should add aman user as owner - using emails', done => {
			request
				.post(api('groups.removeOwnerAsUser'))
				.set(botCredentials)
				.send({
					originUsername: amanUser.username,
					roomName: amanGroup.name,
					username: hamalUser.emails[0].address
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect(res => {
					expect(res.body).to.have.property('success', true);
				})
				.end(done);
		});

		it('should fail - user is not an owner', done => {
			request
				.post(api('groups.removeOwnerAsUser'))
				.set(botCredentials)
				.send({
					originUsername: amanUser.username,
					roomName: amanGroup.name,
					username: hamalUser.emails[0].address
				})
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect(res => {
					expect(res.body).to.have.property('success', false);
					expect(res.body).to.have.property(
						'error',
						'User is not an owner [error-user-not-owner]'
					);
				})
				.end(done);
		});
	});

	describe('/groups.inviteAsUser', done => {
		let amanGroup;

		before(async () => {
			amanGroup = await createRoomAsUser({
				creatorUsername: amanUser.username,
				name: `${priveteProxyGroup}-${Date.now()}`,
				userCredentials: botCredentials
			});
		});

		it("should fail - doesn't have role aman-proxy", done => {
			request
				.post(api('groups.inviteAsUser'))
				.set(credentials)
				.send({
					originUsername: notAmanUser.username,
					roomId: amanGroup._id,
					username: amanUser.username
				})
				.expect('Content-Type', 'application/json')
				.expect(403)
				.expect(res => {
					expect(res.body).to.have.property('success', false);
					expect(res.body).to.have.property('error', 'unauthorized');
				})
				.end(done);
		});

		it('should fail - the origin user is not aman user', done => {
			request
				.post(api('groups.inviteAsUser'))
				.set(botCredentials)
				.send({
					originUsername: notAmanUser.username,
					roomId: amanGroup._id,
					username: amanUser.username
				})
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect(res => {
					expect(res.body).to.have.property('success', false);
					expect(res.body).to.have.property(
						'error',
						'User must have aman role. [error-invalid-user]'
					);
				})
				.end(done);
		});

		it('should fail - missing param roomName', done => {
			request
				.post(api('groups.inviteAsUser'))
				.set(botCredentials)
				.send({
					originUsername: notAmanUser.username,
					username: amanUser.username
				})
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect(res => {
					expect(res.body).to.have.property('success', false);
					expect(res.body).to.have.property(
						'error',
						'The roomName parameter must be provided. [error-invalid-params]'
					);
				})
				.end(done);
		});

		it('should fail - room does not exist', done => {
			request
				.post(api('groups.inviteAsUser'))
				.set(botCredentials)
				.send({
					originUsername: amanUser.username,
					roomName: `${amanGroup._id}test-not-found`,
					username: notAmanUser.username
				})
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect(res => {
					expect(res.body).to.have.property('success', false);
					expect(res.body).to.have.property(
						'error',
						'The required "roomId" or "roomName" param provided does not match any group [error-room-not-found]'
					);
				})
				.end(done);
		});

		it('should invite user - using username', done => {
			request
				.post(api('groups.inviteAsUser'))
				.set(botCredentials)
				.send({
					originUsername: amanUser.username,
					roomName: `${amanGroup._id}`,
					username: notAmanUser.username
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect(res => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.nested.property(
						'group.usersCount',
						2
					);
				})
				.end(done);
		});

		it('should invite user - using email', done => {
			request
				.post(api('groups.inviteAsUser'))
				.set(botCredentials)
				.send({
					originUsername: amanUser.username,
					roomName: `${amanGroup._id}`,
					username: hamalUser.emails[0].address
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect(res => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.nested.property(
						'group.usersCount',
						3
					);
				})
				.end(done);
		});
	});

	describe('/groups.kickAsUser', done => {
		let amanGroup;

		before(async () => {
			amanGroup = await createRoomAsUser({
				creatorUsername: amanUser.username,
				name: `${priveteProxyGroup}-${Date.now()}`,
				members: [notAmanUser.username, hamalUser.username],
				userCredentials: botCredentials
			});
		});

		it("should fail - doesn't have role aman-proxy", done => {
			request
				.post(api('groups.kickAsUser'))
				.set(credentials)
				.send({
					originUsername: notAmanUser.username,
					roomId: amanGroup._id,
					username: amanUser.username
				})
				.expect('Content-Type', 'application/json')
				.expect(403)
				.expect(res => {
					expect(res.body).to.have.property('success', false);
					expect(res.body).to.have.property('error', 'unauthorized');
				})
				.end(done);
		});

		it('should fail - the origin user is not aman user', done => {
			request
				.post(api('groups.kickAsUser'))
				.set(botCredentials)
				.send({
					originUsername: notAmanUser.username,
					roomId: amanGroup._id,
					username: amanUser.username
				})
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect(res => {
					expect(res.body).to.have.property('success', false);
					expect(res.body).to.have.property(
						'error',
						'User must have aman role. [error-invalid-user]'
					);
				})
				.end(done);
		});

		it('should fail - missing param roomName', done => {
			request
				.post(api('groups.kickAsUser'))
				.set(botCredentials)
				.send({
					originUsername: notAmanUser.username,
					username: amanUser.username
				})
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect(res => {
					expect(res.body).to.have.property('success', false);
					expect(res.body).to.have.property(
						'error',
						'The roomName parameter must be provided. [error-invalid-params]'
					);
				})
				.end(done);
		});

		it('should fail - room does not exist', done => {
			request
				.post(api('groups.kickAsUser'))
				.set(botCredentials)
				.send({
					originUsername: amanUser.username,
					roomName: `${amanGroup._id}test-not-found`,
					username: notAmanUser.username
				})
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect(res => {
					expect(res.body).to.have.property('success', false);
					expect(res.body).to.have.property(
						'error',
						'The required "roomId" or "roomName" param provided does not match any group [error-room-not-found]'
					);
				})
				.end(done);
		});

		it('should kick user - using username', done => {
			request
				.post(api('groups.kickAsUser'))
				.set(botCredentials)
				.send({
					originUsername: amanUser.username,
					roomName: `${amanGroup._id}`,
					username: notAmanUser.username
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect(res => {
					expect(res.body).to.have.property('success', true);
				})
				.end(done);
		});

		it('should kick user - using email', done => {
			request
				.post(api('groups.kickAsUser'))
				.set(botCredentials)
				.send({
					originUsername: amanUser.username,
					roomName: `${amanGroup._id}`,
					username: hamalUser.emails[0].address
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect(res => {
					expect(res.body).to.have.property('success', true);
				})
				.end(done);
		});

		it('should fail - the user is not in the room', done => {
			request
				.post(api('groups.kickAsUser'))
				.set(botCredentials)
				.send({
					originUsername: amanUser.username,
					roomName: `${amanGroup._id}`,
					username: hamalUser.emails[0].address
				})
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect(res => {
					expect(res.body).to.have.property('success', false);
					expect(res.body).to.have.property(
						'error',
						'User is not in this room [error-user-not-in-room]'
					);
				})
				.end(done);
		});
	});

	describe('/groups.leaveAsUser', done => {
		let amanGroup;

		before(async () => {
			amanGroup = await createRoomAsUser({
				creatorUsername: amanUser.username,
				name: `${priveteProxyGroup}-${Date.now()}`,
				members: [notAmanUser.username, hamalUser.username],
				userCredentials: botCredentials
			});

			const res = await request
				.post(api('groups.addOwnerAsUser'))
				.set(botCredentials)
				.send({
					originUsername: amanUser.username,
					username: notAmanUser.username,
					roomId: amanGroup._id
				});
		});

		it("should fail - doesn't have role aman-proxy", done => {
			request
				.post(api('groups.leaveAsUser'))
				.set(credentials)
				.send({
					leaver: hamalUser.username,
					roomId: amanGroup._id
				})
				.expect('Content-Type', 'application/json')
				.expect(403)
				.expect(res => {
					expect(res.body).to.have.property('success', false);
					expect(res.body).to.have.property('error', 'unauthorized');
				})
				.end(done);
		});

		it('should fail - the origin user is not aman user', done => {
			request
				.post(api('groups.leaveAsUser'))
				.set(botCredentials)
				.send({
					leaver: notAmanUser.username,
					roomId: amanGroup._id
				})
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect(res => {
					expect(res.body).to.have.property('success', false);
					expect(res.body).to.have.property(
						'error',
						'User must have aman role. [error-invalid-user]'
					);
				})
				.end(done);
		});

		it('should fail - missing param roomName', done => {
			request
				.post(api('groups.leaveAsUser'))
				.set(botCredentials)
				.send({
					leaver: amanUser.username
				})
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect(res => {
					expect(res.body).to.have.property('success', false);
					expect(res.body).to.have.property(
						'error',
						'The roomName parameter must be provided. [error-invalid-params]'
					);
				})
				.end(done);
		});

		it('should fail - room does not exist', done => {
			request
				.post(api('groups.leaveAsUser'))
				.set(botCredentials)
				.send({
					leaver: hamalUser.username,
					roomName: `${amanGroup._id}test-not-found`
				})
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect(res => {
					expect(res.body).to.have.property('success', false);
					expect(res.body).to.have.property(
						'error',
						'The required "roomId" or "roomName" param provided does not match any group [error-room-not-found]'
					);
				})
				.end(done);
		});

		it('should leave successfuly - using username', done => {
			request
				.post(api('groups.leaveAsUser'))
				.set(botCredentials)
				.send({
					leaver: amanUser.username,
					roomId: amanGroup._id
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect(res => {
					expect(res.body).to.have.property('success', true);
				})
				.end(done);
		});

		it('should leave successfuly - using email', done => {
			request
				.post(api('groups.leaveAsUser'))
				.set(botCredentials)
				.send({
					leaver: hamalUser.emails[0].address,
					roomId: amanGroup._id
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect(res => {
					expect(res.body).to.have.property('success', true);
				})
				.end(done);
		});

		it('should fail - the user is not in the room', done => {
			request
				.post(api('groups.leaveAsUser'))
				.set(botCredentials)
				.send({
					leaver: amanUser.username,
					roomName: `${amanGroup._id}`
				})
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect(res => {
					expect(res.body).to.have.property('success', false);
					expect(res.body).to.have.property(
						'error',
						'The required "roomId" or "roomName" param provided does not match any group [error-room-not-found]'
					);
				})
				.end(done);
		});
	});

	describe('/groups.renameAsUser', done => {
		let amanGroup;
		let name = `${priveteProxyGroup}-${Date.now()}`;

		before(async () => {
			amanGroup = await createRoomAsUser({
				creatorUsername: amanUser.username,
				name: name,
				members: [notAmanUser.username, hamalUser.username],
				userCredentials: botCredentials
			});

			await addOwnerToRoom({
				originUsername: amanUser.username,
				username: hamalUser.username,
				roomId: amanGroup._id,
				userCredentials: botCredentials
			});
		});

		it("should fail - doesn't have role aman-proxy", done => {
			request
				.post(api('groups.renameAsUser'))
				.set(credentials)
				.send({
					byUsername: amanUser.username,
					roomId: amanGroup._id,
					name: `${name}1`
				})
				.expect('Content-Type', 'application/json')
				.expect(403)
				.expect(res => {
					expect(res.body).to.have.property('success', false);
					expect(res.body).to.have.property('error', 'unauthorized');
				})
				.end(done);
		});

		it('should fail - the origin user is not aman user', done => {
			request
				.post(api('groups.renameAsUser'))
				.set(botCredentials)
				.send({
					byUsername: notAmanUser.username,
					roomId: amanGroup._id,
					name: `${name}1`
				})
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect(res => {
					expect(res.body).to.have.property('success', false);
					expect(res.body).to.have.property(
						'error',
						'User must have aman role. [error-invalid-user]'
					);
				})
				.end(done);
		});

		it('should fail - missing param roomName', done => {
			request
				.post(api('groups.renameAsUser'))
				.set(botCredentials)
				.send({
					byUsername: amanUser.username,
					name: `${name}1`
				})
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect(res => {
					expect(res.body).to.have.property('success', false);
					expect(res.body).to.have.property(
						'error',
						'The roomName parameter must be provided. [error-invalid-params]'
					);
				})
				.end(done);
		});

		it('should fail - user does not exist', done => {
			request
				.post(api('groups.renameAsUser'))
				.set(botCredentials)
				.send({
					byUsername: amanGroup._id,
					roomId: amanGroup._id,
					name: `${name}1`
				})
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect(res => {
					expect(res.body).to.have.property('success', false);
					expect(res.body).to.have.property(
						'error',
						`User ${amanGroup._id} does not exist. [error-invalid-user]`
					);
				})
				.end(done);
		});

		it('should rename group successfuly - using username', done => {
			request
				.post(api('groups.renameAsUser'))
				.set(botCredentials)
				.send({
					byUsername: amanUser.username,
					roomId: amanGroup._id,
					name: `${name}1`
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect(res => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.nested.property(
						'group.name',
						`${name}1`
					);
				})
				.end(done);
		});

		it('should rename group successfuly - using email', done => {
			request
				.post(api('groups.renameAsUser'))
				.set(botCredentials)
				.send({
					byUsername: hamalUser.username,
					roomId: amanGroup._id,
					name: `${name}2`
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect(res => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.nested.property(
						'group.name',
						`${name}2`
					);
				})
				.end(done);
		});
	});

	describe('/chat.sendMessageAsUser', () => {
		let amanGroup;

		before(async () => {
			amanGroup = await createRoomAsUser({
				name: `${priveteProxyGroup}-${Date.now()}`,
				creatorUsername: amanUser.username,
				members: [notAmanTestUsername],
				userCredentials: botCredentials
			});
		});

		it('should send a new direct message successfully', done => {
			request
				.post(api('chat.sendMessageAsUser'))
				.set(botCredentials)
				.send({
					fromUsername: amanUser.username,
					targetUsername: notAmanUser.username,
					message: 'TEST message',
					ts: new Date().toISOString()
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect(res => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.nested.property(
						'message.msg',
						'TEST message'
					);
				})
				.end(done);
		});

		it('should send an existing direct message successfully', done => {
			request
				.post(api('chat.sendMessageAsUser'))
				.set(botCredentials)
				.send({
					fromUsername: amanUser.username,
					targetUsername: notAmanUser.username,
					message: 'TEST message',
					ts: new Date().toISOString()
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect(res => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.nested.property(
						'message.msg',
						'TEST message'
					);
				})
				.end(done);
		});

		it('should send a message in a group successfully', done => {
			request
				.post(api('chat.sendMessageAsUser'))
				.set(botCredentials)
				.send({
					fromUsername: amanUser.username,
					roomId: amanGroup._id,
					message: 'TEST message',
					ts: new Date().toISOString()
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect(res => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.nested.property(
						'message.msg',
						'TEST message'
					);
				})
				.end(done);
		});

		it('should fail - the sender user is not aman user', done => {
			request
				.post(api('chat.sendMessageAsUser'))
				.set(botCredentials)
				.send({
					fromUsername: notAmanUser.username,
					roomId: amanGroup._id,
					message: 'TEST message',
					ts: new Date().toISOString()
				})
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect(res => {
					expect(res.body).to.have.property('success', false);
					expect(res.body).to.have.property(
						'error',
						'User must have aman role. [error-invalid-user]'
					);
				})
				.end(done);
		});

		it('should fail - missing param roomId', done => {
			request
				.post(api('chat.sendMessageAsUser'))
				.set(botCredentials)
				.send({
					fromUsername: notAmanUser.username,
					message: 'TEST message',
					ts: new Date().toISOString()
				})
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect(res => {
					expect(res.body).to.have.property('success', false);
					expect(res.body).to.have.property(
						'error',
						'Body must include either roomId or roomName / targetUsername [error-missing-parameter]'
					);
				})
				.end(done);
		});

		it("should fail - doesn't have role aman-proxy", done => {
			request
				.post(api('chat.sendMessageAsUser'))
				.set(credentials)
				.send({
					fromUsername: amanUser.username,
					targetUsername: notAmanUser.username,
					message: 'TEST message',
					ts: new Date().toISOString()
				})
				.expect('Content-Type', 'application/json')
				.expect(403)
				.expect(res => {
					expect(res.body).to.have.property('success', false);
					expect(res.body).to.have.property('error', 'unauthorized');
				})
				.end(done);
		});
	});

	describe('/rooms.uploadAsUser', () => {
		let amanGroup;

		before(async () => {
			amanGroup = await createRoomAsUser({
				name: `${priveteProxyGroup}-${Date.now()}`,
				creatorUsername: amanUser.username,
				members: [notAmanTestUsername],
				userCredentials: botCredentials
			});
		});

		it('should send a file successfully to DM', done => {
			request
				.post(api('rooms.uploadAsUser'))
				.set(botCredentials)
				.send({
					fileName: 'test.png',
					description: 'TEST',
					mimeType: 'image/png',
					byUsername: amanUser.username,
					targetUsername: notAmanUser.username,
					msgData: {
						ts: new Date().toISOString()
					},
					file: {
						file_png: fs.readFileSync(imgURL)
					}
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect(res => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.nested.property(
						'message.file.name',
						'test.png'
					);
				})
				.end(done);
		});

		it('should send a file successfully to DM - using email', done => {
			request
				.post(api('rooms.uploadAsUser'))
				.set(botCredentials)
				.send({
					fileName: 'test.png',
					description: 'TEST',
					mimeType: 'image/png',
					byUsername: hamalUser.emails[0].address,
					targetUsername: notAmanUser.username,
					msgData: {
						ts: new Date().toISOString()
					},
					file: {
						file_png: fs.readFileSync(imgURL)
					}
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect(res => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.nested.property(
						'message.file.name',
						'test.png'
					);
				})
				.end(done);
		});

		it('should send a file successfully to a group', done => {
			request
				.post(api('rooms.uploadAsUser'))
				.set(botCredentials)
				.send({
					fileName: 'test.png',
					description: 'TEST',
					mimeType: 'image/png',
					byUsername: amanUser.username,
					roomName: amanGroup.name,
					msgData: {
						ts: new Date().toISOString()
					},
					file: {
						file_png: fs.readFileSync(imgURL)
					}
				})
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect(res => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.nested.property(
						'message.file.name',
						'test.png'
					);
				})
				.end(done);
		});

		it('should fail - fileName is missing', done => {
			request
				.post(api('rooms.uploadAsUser'))
				.set(botCredentials)
				.send({
					description: 'TEST',
					mimeType: 'image/png',
					byUsername: amanUser.username,
					roomName: amanGroup.name,
					msgData: {
						ts: new Date().toISOString()
					},
					file: {
						file_png: fs.readFileSync(imgURL)
					}
				})
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect(res => {
					expect(res.body).to.have.property('success', false);
					expect(res.body).to.have.nested.property(
						'error',
						"Match error: Missing key 'fileName'"
					);
				})
				.end(done);
		});

		it('should fail - the origin user is not aman user', done => {
			request
				.post(api('rooms.uploadAsUser'))
				.set(botCredentials)
				.send({
					fileName: 'test.png',
					description: 'TEST',
					mimeType: 'image/png',
					byUsername: notAmanUser.username,
					targetUsername: amanUser.username,
					msgData: {
						ts: new Date().toISOString()
					},
					file: {
						file_png: fs.readFileSync(imgURL)
					}
				})
				.expect('Content-Type', 'application/json')
				.expect(400)
				.expect(res => {
					expect(res.body).to.have.property('success', false);
					expect(res.body).to.have.nested.property(
						'error',
						'User must have aman role. [error-invalid-user]'
					);
				})
				.end(done);
		});
	});
});
