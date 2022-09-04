import { Migrations } from '../../../app/migrations/server';
import { Messages } from '/app/models/server/raw';

const updateAllQuoteAttachments = async () => {
	const cursor = Messages.col.aggregate([
		{
			$unwind: {
				path: '$attachments',
				includeArrayIndex: 'attachmentIndex'
			}
		},
		{
			$match: {
				'attachments.message_link': { $exists: true, $ne: [] }
			}
		},
		{
			$project: {
				_id: 1,
				attachments: 1,
				attachmentIndex: 1,
				msgId: {
					$arrayElemAt: [
						{ $split: ['$attachments.message_link', '?msg='] },
						1
					]
				}
			}
		},
		{
			$lookup: {
				from: 'rocketchat_message',
				localField: 'msgId',
				foreignField: '_id',
				as: 'originalMessages'
			}
		},
		{
			$addFields: {
				originalMessage: {
					$arrayElemAt: ['$originalMessages', 0]
				},
				type: 'quote'
			}
		},
		{
			$project: {
				_id: 1,
				attachmentIndex: 1,
				type: 1,
				msgId: 1,
				rid: '$originalMessage.rid'
			}
		}
	]);

	let actions = [];

	for await (const attachment of cursor) {
		const { _id, attachmentIndex, type, msgId, rid } = attachment;

		const arrayElemToUpdate = `attachments.${attachmentIndex}`;

		actions.push({
			updateOne: {
				filter: { _id },
				update: {
					$set: {
						[`${arrayElemToUpdate}.type`]: type,
						[`${arrayElemToUpdate}.msgId`]: msgId,
						[`${arrayElemToUpdate}.rid`]: rid
					}
				}
			}
		});

		if (actions.length === 100) {
			await Messages.col.bulkWrite(actions, { ordered: true });
			actions = [];
		}
	}

	if (actions.length) {
		await Messages.col.bulkWrite(actions, { ordered: true });
		actions = [];
	}
};

Migrations.add({
	version: 221,
	up() {
		Promise.await(updateAllQuoteAttachments());
	}
});
