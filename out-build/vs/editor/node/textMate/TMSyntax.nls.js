/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'Contributes textmate tokenizers.',
	'Language id for which this syntax is contributed to.',
	'Textmate scope name used by the tmLanguage file.',
	'Path of the tmLanguage file. The path is relative to the extension folder and typically starts with \'./syntaxes/\'.',
	"Unknown language in `contributes.{0}.language`. Provided value: {1}",
	"Expected string in `contributes.{0}.scopeName`. Provided value: {1}",
	"Expected string in `contributes.{0}.path`. Provided value: {1}",
	"Expected `contributes.{0}.path` ({1}) to be included inside extension's folder ({2}). This might make the extension non-portable."
]);