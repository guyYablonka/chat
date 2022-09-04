import { Migrations } from '../../../app/migrations/server';
import { Users } from '../../../app/models/server/raw';

const updateUsersFullnames = async () => {
	const cursor = Users.col.find({});

	let actions = [];

	for await (const user of cursor) {
		actions.push({
			updateOne: {
				filter: { _id: user._id },
				update: {
					$set: {
						'customFields.fullName': convertToFullName(
							user.customFields?.firstName || '',
							user.customFields?.lastName || ''
						)
					}
				}
			}
		});
		if (actions.length === 100) {
			await Users.col.bulkWrite(actions, { ordered: false });
			actions = [];
		}
	}

	if (actions.length) {
		await Users.col.bulkWrite(actions, { ordered: false });
	}
};

const convertToFullName = (fullFirstName = '', fullLastName = '') => {
	fullFirstName = fullFirstName.trim();
	fullLastName = fullLastName.trim();
	if (fullFirstName === fullLastName) return [fullFirstName];

	const combinations = new Set();

	combinations.add(`${fullFirstName} ${fullLastName}`);
	combinations.add(`${fullLastName} ${fullFirstName}`);

	const firstNameWords = fullFirstName.split(' ');
	const lastNameWords = fullLastName.split(' ');

	firstNameWords.forEach(firstNameWord => {
		lastNameWords.forEach(lastNameWord => {
			combinations.add(`${firstNameWord} ${lastNameWord}`);
			combinations.add(`${lastNameWord} ${firstNameWord}`);
		});
	});

	return [...combinations];
};

Migrations.add({
	version: 219,
	up() {
		Promise.await(updateUsersFullnames());
	}
});
