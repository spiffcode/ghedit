define(["require","exports"],function(n,r){/*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
"use strict";function t(){return Object.create(null)}function e(){return Object.create(null)}function u(n,r,t){void 0===t&&(t=null);var e=String(r);return i(n,e)?n[e]:t}function o(n,r,t){var e=String(r);return i(n,e)?n[e]:("function"==typeof t&&(t=t()),n[e]=t,t)}function c(n,r,t){n[t(r)]=r}function i(n,r){return p.call(n,r)}function a(n){var r=[];for(var t in n)p.call(n,t)&&r.push(n[t]);return r}function f(n,r){for(var t in n)if(p.call(n,t)){var e=r({key:t,value:n[t]},function(){delete n[t]});if(e===!1)return}}function l(n,r){return!!p.call(n,r)&&(delete n[r],!0)}function v(n,r){var e=t();return n.forEach(function(n){return o(e,r(n),[]).push(n)}),e}r.createStringDictionary=t,r.createNumberDictionary=e,r.lookup=u,r.lookupOrInsert=o,r.insert=c;var p=Object.prototype.hasOwnProperty;r.contains=i,r.values=a,r.forEach=f,r.remove=l,r.groupBy=v});