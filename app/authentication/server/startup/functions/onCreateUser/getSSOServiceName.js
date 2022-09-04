const getSSOServiceName = services => {
	if (!services) return undefined;

	const [key, service] =
		Object.entries(services).find(
			([_key, service]) => service._OAuthCustom
		) || [];

	return service?.serviceName || key;
};

export default getSSOServiceName;
