import { TAPi18n } from 'meteor/rocketchat:tap-i18n';

import { settings } from '../../../settings/server';

const validateFileName = (fileName, language) => {
	const shouldValidateFileName = settings.get('Enable_fileNames_Validation');

	if (shouldValidateFileName) {
		const maxFileNameLength = settings.get('FileName_MaxLength');

		const isFileNameLengthValid = fileName.length <= maxFileNameLength;

		if (!isFileNameLengthValid) {
			return {
				isValid: false,
				reason: getErrorMessage('File_name_too_long', language, {
					max: maxFileNameLength
				})
			};
		}

		const fileNameRegex = new RegExp(settings.get('FileName_Regex'));

		if (!fileName.match(fileNameRegex)) {
			return {
				isValid: false,
				reason: getErrorMessage('File_name_invalid', language, {
					forbidden_chars: fileNameRegex.source
						.slice(3, -3)
						.replace('\\\\', '\\')
						.split('')
						.join(', ')
				})
			};
		}
	}

	return { isValid: true };
};

const getErrorMessage = (reason, language, args) => {
	return TAPi18n.__(reason, args, language);
};

export default validateFileName;
