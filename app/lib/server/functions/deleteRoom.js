import { Messages, Subscriptions, Rooms } from '../../../models';
import { callbacks } from '../../../callbacks';
import { FileUpload } from '../../../file-upload/server';

export const deleteRoom = function (rid) {
	const { name } = Rooms.findOneById(rid, { fields: { name: 1 } });
	callbacks.run('beforeDeleteRoom', rid);
	Subscriptions.removeByRoomId(rid);
	callbacks.run('afterDeleteRoom', rid);
	Rooms.setOldRoomNameById(rid, name);
	return Rooms.setNameById(rid, rid, rid);
};
