import { Subscriptions } from '/app/models/server';

const getSubscriptionsByRoomId = roomId =>
	Subscriptions.findByRoomId(roomId, {
		fields: { _id: 1, 'u.username': 1, rid: 1 }
	})?.fetch() ?? [];

export default getSubscriptionsByRoomId;
