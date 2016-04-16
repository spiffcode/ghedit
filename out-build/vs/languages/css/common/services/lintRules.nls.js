/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	"When using a vendor-specific prefix make sure to also include all other vendor-specific properties",
	"When using a vendor-specific prefix also include the standard property",
	"Do not use duplicate style definitions",
	"Do not use empty rulesets",
	"Import statements do not load in parallel",
	"Do not use width or height when using padding or border",
	"The universal selector (*) is known to be slow",
	"No unit for zero needed",
	"@font-face rule must define 'src' and 'font-family' properties",
	"Hex colors must consist of three or six hex numbers",
	"Invalid number of parameters",
	"Unknown property.",
	"IE hacks are only necessary when supporting IE7 and older",
	"Unknown vendor specific property.",
	"Property is ignored due to the display. E.g. with 'display: inline', the width, height, margin-top, margin-bottom, and float properties have no effect",
	"Avoid using !important. It is an indication that the specificity of the entire CSS has gotten out of control and needs to be refactored.",
	"Avoid using 'float'. Floats lead to fragile CSS that is easy to break if one aspect of the layout changes.",
	"Selectors should not contain IDs because these rules are too tightly coupled with the HTML.",
	'Enables or disables all validations'
]);