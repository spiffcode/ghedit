/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'Contributes textmate color themes.',
	'Label of the color theme as shown in the UI.',
	'Base theme defining the colors around the editor: \'vs\' is the light color theme, \'vs-dark\' is the dark color theme.',
	'Path of the tmTheme file. The path is relative to the extension folder and is typically \'./themes/themeFile.tmTheme\'.',
	"Extension point `{0}` must be an array.",
	"Expected string in `contributes.{0}.path`. Provided value: {1}",
	"Expected `contributes.{0}.path` ({1}) to be included inside extension's folder ({2}). This might make the extension non-portable.",
	"Unable to load {0}",
	"Problems parsing JSON theme file: {0}",
	"Problems parsing plist file: {0}"
]);