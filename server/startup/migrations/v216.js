import { Migrations } from '../../../app/migrations/server';
import { Rooms } from '../../../app/models/server';
import { Users } from '../../../app/models/server';

Migrations.add({
	version: 216,
	up() {
		const deletedRooms = Rooms.findByNameContaining('REMOVED_');
		deletedRooms.forEach(room => {
			Rooms.setNameById(room._id, room._id, room._id);
			Rooms.setOldRoomNameById(room._id, room.name.split('_')[1]);
		});

		Users.tryEnsureIndex(
			{
				content: 'text',
				'customFields.fullName': 'text',
				'emails.0.address': 'text',
				username: 'text'
			},
			{ default_language: 'none', name: 'textSearch' }
		);
	}
});
