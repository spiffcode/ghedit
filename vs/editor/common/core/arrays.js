define(["require","exports"],function(r,n){/*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
"use strict";var e;!function(r){function n(r,n){var e=0,t=r.length-1;if(t<=0)return 0;for(;e<t;){var i=e+Math.ceil((t-e)/2);r[i].startIndex>n?t=i-1:e=i}return e}r.findIndexInSegmentsArray=n}(e=n.Arrays||(n.Arrays={}))});