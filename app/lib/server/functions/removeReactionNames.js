export const removeReactionNames = messageList => {
	const messagesWithoutReactionNames = messageList.map(currMsg => {
		const reactions = Object.keys(currMsg.reactions || {}).reduce(
			(output, currReaction) => {
				const { names, ...otherFields } =
					currMsg.reactions[currReaction];

				return { ...output, [currReaction]: otherFields };
			},
			{}
		);

		return { ...currMsg, reactions };
	});

	return messagesWithoutReactionNames;
};
