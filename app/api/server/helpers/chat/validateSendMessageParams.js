import { API } from '../../api';
import { Meteor } from 'meteor/meteor';

API.helperMethods.set(
	'validateSendMessageParams',
	function _validateSendMessageParams() {
		check(
			this.bodyParams,
			Match.ObjectIncluding({
				roomId: Match.Optional(String),
				roomName: Match.Optional(String),
				targetUsername: Match.Optional(String),
				fromUsername: String,
				message: String,
				ts: String,
				from: Match.Optional(String)
			})
		);

		this.validateOneFromSomeBodyParamsInclude([
			'roomId',
			'roomName',
			'targetUsername'
		]);
	}
);
