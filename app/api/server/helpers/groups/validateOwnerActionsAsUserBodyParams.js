import { API } from '../../api';
import { Meteor } from 'meteor/meteor';

API.helperMethods.set(
	'validateOwnerActionsAsUserBodyParams',
	function _validateOwnerActionsAsUserBodyParams() {
		check(
			this.bodyParams,
			Match.ObjectIncluding({
				roomId: Match.Optional(String),
				roomName: Match.Optional(String),
				originUsername: String,
				username: String,
				readOnly: Match.Optional(Boolean)
			})
		);

		this.validateOneFromSomeBodyParamsInclude(['roomId', 'roomName']);
	}
);
