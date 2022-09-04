import { API } from '../../api';
import { Meteor } from 'meteor/meteor';

API.helperMethods.set(
	'validateUpdateMessageBodyParameters',
	function _validateUpdateMessageBodyParameters() {
		check(
			this.bodyParams,
			Match.ObjectIncluding({
				roomId: Match.Optional(String),
				roomName: Match.Optional(String),
				targetUsername: Match.Optional(String),
				message: String,
				newMessage: String,
				fromUsername: String,
				ts: String
			})
		);

		this.validateOneFromSomeBodyParamsInclude([
			'roomId',
			'roomName',
			'targetUsername'
		]);
	}
);
