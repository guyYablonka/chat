import { check } from 'meteor/check';
import { HTTP } from 'meteor/http';
import { ServiceConfiguration } from 'meteor/service-configuration';

const avatarProviders = {
	customOAuth(user) {
		const avatars = [];
		for (const service in user.services) {
			if (user.services[service]._OAuthCustom) {
				const services = ServiceConfiguration.configurations
					.find({ service }, { fields: { secret: 0 } })
					.fetch();

				if (services.length > 0) {
					if (user.services[service].avatarUrl) {
						avatars.push({
							service,
							url: user.services[service].avatarUrl
						});
					}
				}
			}
		}
		return avatars;
	}
};

export function getAvatarSuggestionForUser(user) {
	check(user, Object);

	const avatars = [];

	for (const avatarProvider of Object.values(avatarProviders)) {
		const avatar = avatarProvider(user);
		if (avatar) {
			if (Array.isArray(avatar)) {
				avatars.push(...avatar);
			} else {
				avatars.push(avatar);
			}
		}
	}

	const validAvatars = {};
	for (const avatar of avatars) {
		try {
			const result = HTTP.get(avatar.url, {
				npmRequestOptions: {
					encoding: 'binary'
				}
			});

			if (result.statusCode === 200) {
				let blob = `data:${result.headers['content-type']};base64,`;
				blob += Buffer.from(result.content, 'binary').toString(
					'base64'
				);
				avatar.blob = blob;
				avatar.contentType = result.headers['content-type'];
				validAvatars[avatar.service] = avatar;
			}
		} catch (error) {
			// error;
		}
	}
	return validAvatars;
}
