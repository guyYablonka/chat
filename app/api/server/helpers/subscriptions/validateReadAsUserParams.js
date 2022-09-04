import { API } from '../../api';
import { Meteor } from 'meteor/meteor';

API.helperMethods.set(
	'validateReadAsUserParams',
	function _validateReadAsUserBodyParams() {
		check(
			this.bodyParams,
			Match.ObjectIncluding({
				roomId: Match.Optional(String),
				roomName: Match.Optional(String),
				targetUsername: Match.Optional(String),
				fromUsername: String
			})
		);

		this.validateOneFromSomeBodyParamsInclude([
			'roomId',
			'roomName',
			'targetUsername'
		]);
	}
);
