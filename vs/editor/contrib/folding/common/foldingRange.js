/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require","exports"],function(e,n){"use strict";function t(e){return(e?e.startLineNumber+"/"+e.endLineNumber:"null")+(e.isCollapsed?" (collapsed)":"")+" - "+e.indent}n.toString=t});