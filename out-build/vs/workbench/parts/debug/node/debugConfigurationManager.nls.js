/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	'Contributes debug adapters.',
	"Unique identifier for this debug adapter.",
	"Display name for this debug adapter.",
	"Allow breakpoints for these languages.",
	"List of languages.",
	"Path to the debug adapter program. Path is either absolute or relative to the extension folder.",
	"Optional arguments to pass to the adapter.",
	"Optional runtime in case the program attribute is not an executable but requires a runtime.",
	"Optional runtime arguments.",
	"Configurations for generating the initial \'launch.json\'.",
	"JSON schema configurations for validating \'launch.json\'.",
	"Windows specific settings.",
	"Runtime used for Windows.",
	"OS X specific settings.",
	"Runtime used for OSX.",
	"Linux specific settings.",
	"Runtime used for Linux.",
	"Launch configuration",
	"Version of this file format.",
	"List of configurations. Add new configurations or edit existing ones.",
	"Debug adapter 'type' can not be omitted and must be of type 'string'.",
	"Debug type '{0}' is already registered and has attribute '{1}', ignoring attribute '{1}'.",
	"Unable to create 'launch.json' file inside the '.vscode' folder ({0}).",
	"Select Environment"
]);