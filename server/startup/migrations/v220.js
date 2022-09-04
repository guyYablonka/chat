import { Migrations } from '../../../app/migrations/server';
import { Subscriptions } from '../../../app/models/server/raw';
import { getDirectDisplayName } from '/app/lib/server/functions/getDirectDisplayName';

const updateAllSubscriptions = async () => {
	const cursor = Subscriptions.col.aggregate([
		{ $match: { t: 'd' } },
		{
			$lookup: {
				from: 'users',
				localField: 'name',
				foreignField: 'username',
				as: 'user'
			}
		},
		{
			$addFields: {
				user: {
					$arrayElemAt: ['$user', 0]
				}
			}
		}
	]);

	let actions = [];

	const DELETED_USER_LABEL = 'User has been deleted';

	for await (const { _id, user } of cursor) {
		actions.push({
			updateOne: {
				filter: { _id: _id },
				update: {
					$set: {
						directDisplayName: user
							? getDirectDisplayName(user)
							: DELETED_USER_LABEL
					}
				}
			}
		});
		if (actions.length === 100) {
			await Subscriptions.col.bulkWrite(actions, { ordered: false });
			actions = [];
		}
	}

	if (actions.length) {
		await Subscriptions.col.bulkWrite(actions, { ordered: false });
	}
};

Migrations.add({
	version: 220,
	up() {
		Promise.await(updateAllSubscriptions());
	}
});
