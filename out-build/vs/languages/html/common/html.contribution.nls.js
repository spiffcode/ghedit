/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	"HTML configuration",
	"Maximum amount of characters per line (0 = disable).",
	"List of tags, comma separated, that shouldn't be reformatted. 'null' defaults to all inline tags.",
	"Indent <head> and <body> sections.",
	"Whether existing line breaks before elements should be preserved. Only works before elements, not inside tags or for text.",
	"Maximum number of line breaks to be preserved in one chunk. Use 'null' for unlimited.",
	"Format and indent {{#foo}} and {{/foo}}.",
	"End with a newline.",
	"List of tags, comma separated, that should have an extra newline before them. 'null' defaults to \"head, body, /html\"."
]);