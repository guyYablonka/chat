import { Migrations } from '../../../app/migrations/server';
import { Rooms } from '../../../app/models/server';
import { Users } from '../../../app/models/server';

const updateAllRooms = async () => {
	const roomCollection = Rooms.model.rawCollection();
	const cursor = roomCollection.aggregate(
		[
			{
				$unwind: '$usernames'
			},
			{
				$group: {
					_id: {
						username: '$usernames',
						id: '$_id'
					},
					t: { $first: '$t' },
					usersCount: { $first: '$usersCount' },
					uids: { $first: '$uids' },
					count: {
						$sum: 1.0
					}
				}
			},
			{
				$match: {
					t: 'd',
					count: {
						$gt: 1.0
					}
				}
			}
		],
		{ allowDiskUse: true }
	);

	let actions = [];

	for await (const room of cursor) {
		let user;

		if (room?._id) {
			user = Users.findOneByUsername(room._id.username);
		}

		if (user?._id) {
			actions.push({
				updateOne: {
					filter: { _id: room._id.id },
					update: {
						$set: {
							usernames: [room._id.username],
							usersCount: 1,
							uids: [user._id]
						}
					}
				}
			});

			if (actions.length === 100) {
				await roomCollection.bulkWrite(actions, {
					ordered: false
				});
				actions = [];
			}
		}
	}

	if (actions.length) {
		await roomCollection.bulkWrite(actions, {
			ordered: false
		});
	}
};
Migrations.add({
	version: 217,
	up() {
		Promise.await(updateAllRooms());
	}
});
