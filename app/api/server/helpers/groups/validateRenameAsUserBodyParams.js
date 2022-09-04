import { API } from '../../api';
import { Meteor } from 'meteor/meteor';

API.helperMethods.set(
	'validateRenameAsUserBodyParams',
	function _validateRenameAsUserBodyParams() {
		check(
			this.bodyParams,
			Match.ObjectIncluding({
				roomId: Match.Optional(String),
				roomName: Match.Optional(String),
				name: String,
				byUsername: String
			})
		);

		this.validateOneFromSomeBodyParamsInclude(['roomId', 'roomName']);
	}
);
