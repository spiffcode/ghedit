/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    'use strict';
});
// export interface ILanguageAutoComplete {
// 	triggers: string;				// characters that trigger auto completion rules
// 	match: string|RegExp;			// autocomplete if this matches
// 	complete: string;				// complete with this string
// }
// export interface ILanguageAutoIndent {
// 	match: string|RegExp; 			// auto indent if this matches on enter
// 	matchAfter: string|RegExp;		// and auto-outdent if this matches on the next line
// }
// /**
// 	* Regular expression based brackets. These are always electric.
// 	*/
// export interface IRegexBracketPair {
// 	// openTrigger?: string; // The character that will trigger the evaluation of 'open'.
// 	open: RegExp; // The definition of when an opening brace is detected. This regex is matched against the entire line upto, and including the last typed character (the trigger character).
// 	closeComplete?: string; // How to complete a matching open brace. Matches from 'open' will be expanded, e.g. '</$1>'
// 	matchCase?: boolean; // If set to true, the case of the string captured in 'open' will be detected an applied also to 'closeComplete'.
// 						// This is useful for cases like BEGIN/END or begin/end where the opening and closing phrases are unrelated.
// 						// For identical phrases, use the $1 replacement syntax above directly in closeComplete, as it will
// 						// include the proper casing from the captured string in 'open'.
// 						// Upper/Lower/Camel cases are detected. Camel case dection uses only the first two characters and assumes
// 						// that 'closeComplete' contains wors separated by spaces (e.g. 'End Loop')
// 	// closeTrigger?: string; // The character that will trigger the evaluation of 'close'.
// 	close?: RegExp; // The definition of when a closing brace is detected. This regex is matched against the entire line upto, and including the last typed character (the trigger character).
// 	tokenType?: string; // The type of the token. Matches from 'open' or 'close' will be expanded, e.g. 'keyword.$1'.
// 						// Only used to auto-(un)indent a closing bracket.
// }
//# sourceMappingURL=types.js.map