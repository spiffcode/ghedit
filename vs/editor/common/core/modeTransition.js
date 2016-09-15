define(["require","exports","vs/editor/common/core/arrays"],function(n,e,r){/*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
"use strict";var t=function(){function n(n,e){this.startIndex=0|n,this.mode=e,this.modeId=e.getId()}return n.findIndexInSegmentsArray=function(n,e){return r.Arrays.findIndexInSegmentsArray(n,e)},n.create=function(e){for(var r=[],t=0,i=e.length;t<i;t++){var o=e[t];r.push(new n(o.startIndex,o.mode))}return r},n}();e.ModeTransition=t});