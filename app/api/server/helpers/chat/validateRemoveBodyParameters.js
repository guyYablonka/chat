import { API } from '../../api';
import { Meteor } from 'meteor/meteor';

API.helperMethods.set(
	'validateRemoveBodyParameters',
	function _validateRemoveBodyParameters() {
		check(
			this.bodyParams,
			Match.ObjectIncluding({
				roomId: Match.Optional(String),
				roomName: Match.Optional(String),
				targetUsername: Match.Optional(String),
				fromUsername: String,
				message: String,
				ts: Match.OneOf(String, Date, Number)
			})
		);
		this.validateOneFromSomeBodyParamsInclude([
			'roomId',
			'roomName',
			'targetUsername'
		]);
	}
);
