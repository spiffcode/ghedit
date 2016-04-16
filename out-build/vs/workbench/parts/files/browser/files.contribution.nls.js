/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define([], [
	"Show Explorer",
	"Explorer",
	"View",
	"Text File Editor",
	"Binary File Editor",
	"Files configuration",
	"Configure glob patterns for excluding files and folders.",
	"The glob pattern to match file paths against. Set to true or false to enable or disable the pattern.",
	'Additional check on the siblings of a matching file. Use $(basename) as variable for the matching file name.',
	"Configure file associations to languages (e.g. \"*.extension\": \"html\"). These have precedence over the default associations of the languages installed.",
	"The default character set encoding to use when reading and writing files.",
	"The default end of line character.",
	"When enabled, will trim trailing whitespace when you save a file.",
	"Controls auto save of dirty files. Accepted values:  \"{0}\", \"{1}\", \"{2}\". If set to \"{3}\" you can configure the delay in \"files.autoSaveDelay\".",
	"Controls the delay in ms after which a dirty file is saved automatically. Only applies when \"files.autoSave\" is set to \"{0}\"",
	"Configure glob patterns of file paths to exclude from file watching. Changing this setting requires a restart. When you experience Code consuming lots of cpu time on startup, you can exclude large folders to reduce the initial load.",
	"File Explorer configuration",
	"Maximum number of working files to show before scrollbars appear.",
	"Controls if the height of the working files section should adapt dynamically to the number of elements or not.",
	"Controls if the explorer should automatically reveal files when opening them.",
	"Open Working File by Name",
	"Open Working File By Name",
	"Files"
]);