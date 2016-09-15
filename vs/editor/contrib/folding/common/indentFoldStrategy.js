/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require","exports"],function(n,e){"use strict";function t(n){return n.getIndentRanges()}function r(n,e){if(n.length<=e)return n;var t=[];n.forEach(function(n){n.indent<1e3&&(t[n.indent]=(t[n.indent]||0)+1)});for(var r=t.length,i=0;i<t.length;i++)if(t[i]&&(e-=t[i],e<0)){r=i;break}return n.filter(function(n){return n.indent<r})}e.computeRanges=t,e.limitByIndent=r});