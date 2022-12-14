import { Migrations } from '../../../app/migrations/server';
import { LivechatRooms, LivechatInquiry } from '../../../app/models/server';

Migrations.add({
	version: 180,
	up() {
		// Remove Old Omnichannel Inquiries related to rooms already closed
		LivechatInquiry.find().forEach(inquiry => {
			const { rid, status } = inquiry;
			if (status === 'closed') {
				return LivechatInquiry.removeByRoomId(rid);
			}

			const room = LivechatRooms.findOneById(rid, { closedAt: 1 });
			if (!room || room.closedAt) {
				LivechatInquiry.removeByRoomId(rid);
			}
		});
	}
});
