/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require","exports","vs/base/common/marked/marked"],function(e,r,n){"use strict";function a(e,r,n){return'<a href="#" data-href="'+e+'" title="'+(r||n)+'">'+n+"</a>"}r.value={markdownToHtml:function(e,r,t,i,o){var d=new n.marked.Renderer;d.link=a,n.marked(o.source,{gfm:!0,sanitize:!0,renderer:d},function(e,n){e?t(e):r(n)})}}});