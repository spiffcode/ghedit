/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require","exports","vs/base/common/arrays"],function(e,r,n){"use strict";function a(e){return n.binarySearch(r.EMPTY_ELEMENTS,e,function(e,r){return e.localeCompare(r)})>=0}r.EMPTY_ELEMENTS=["area","base","br","col","embed","hr","img","input","keygen","link","menuitem","meta","param","source","track","wbr"],r.isEmptyElement=a});