import {
	request,
	getCredentials,
	proxyBotUsername,
	notAmanTestUsername,
	amanTestUsername
} from '../data/api-data.js';
import { getUserByUsername, deleteUser } from '../data/users.helper';

const methods = ['get', 'post', 'put', 'del'];
const constantTestUsers = [
	'apiuser.test',
	'fname_apiuser.test',
	'customField_apiuser.test',
	'ufs',
	'fake.name',
	proxyBotUsername,
	notAmanTestUsername,
	amanTestUsername
];

let lastUrl;
let lastResponse;

methods.forEach(method => {
	const original = request[method];
	request[method] = function (url, fn) {
		lastUrl = url;
		return original(url, fn).expect(res => {
			lastResponse = res;
		});
	};
});

afterEach(async function () {
	if (this.currentTest.state === 'failed') {
		console.log({
			lastUrl,
			lastResponse: lastResponse.text
		});

		for (let username of constantTestUsers) {
			try {
				const user = await getUserByUsername(username);
				const responseDelete = await deleteUser(user);
			} catch (e) {
				// console.log(e);
			}
		}
	}
});

after(async function () {
	for (let username of constantTestUsers) {
		try {
			const user = await getUserByUsername(username);
			const responseDelete = await deleteUser(user);
		} catch (e) {
			// console.log(e);
		}
	}
});
