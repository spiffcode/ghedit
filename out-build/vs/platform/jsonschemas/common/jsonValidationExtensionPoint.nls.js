/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'Contributes json schema configuration.',
	'The file pattern to match, for example "package.json" or "*.launch".',
	'A schema URL (\'http:\', \'https:\') or relative path to the extension folder (\'./\').',
	"'configuration.jsonValidation' must be a array",
	"'configuration.jsonValidation.fileMatch' must be defined",
	"'configuration.jsonValidation.url' must be a URL or relative path",
	"'configuration.jsonValidation.url' is an invalid relative URL: {0}",
	"'configuration.jsonValidation.url' must start with 'http:', 'https:' or './' to reference schemas located in the extension"
]);