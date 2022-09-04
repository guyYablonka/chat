import { Users } from '../../../models';
import httpContext from 'express-http-context';

export default request => {
	httpContext.set('requestId', Random.id());
	httpContext.set('route', request.url);
	const userId = request.headers['x-user-id'];

	if ('x-user-id' in request.headers && userId) {
		const username = Users.findOneById(userId, {
			fields: { username: 1 }
		})?.username;

		username && httpContext.set('username', username);
	}
};
