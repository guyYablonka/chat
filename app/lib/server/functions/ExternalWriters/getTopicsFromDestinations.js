const ROLE_DELIMITER = '-';

const getTopicsFromDestinations = destinations => {
	// Maps destinations array to conatin only the first word, aman for example
	const topicsByDestinations = destinations.map(currentDestination => {
		const splittedDestination = currentDestination.split(ROLE_DELIMITER);

		return splittedDestination[0];
	});

	return topicsByDestinations;
};

module.exports = getTopicsFromDestinations;
