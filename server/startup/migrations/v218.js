import { Migrations } from '../../../app/migrations/server';
import { Rooms } from '../../../app/models/server';

Migrations.add({
	version: 218,
	up() {
		Rooms.update(
			{
				sysMes: { $exists: true }
			},
			{
				$unset: { sysMes: '' }
			},
			{
				multi: true
			},
			{ allowDiskUse: true }
		);
	}
});
