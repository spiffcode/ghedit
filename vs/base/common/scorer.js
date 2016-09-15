/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require","exports"],function(r,e){"use strict";function n(r,e,n){if(!r||!e)return 0;var o=r+e,f=n&&n[o];if("number"==typeof f)return f;for(var i=e.length,a=r.toLowerCase(),c=e.toLowerCase(),s=0,v=0,d=0,b=function(){var n=a.indexOf(c[s],v);return n<0?(d=0,"break"):(d+=1,v===n&&(d+=5),r[n]===e[n]&&(d+=1),0===n?d+=8:u.some(function(e){return e===r[n-1]})?d+=7:t(r.charCodeAt(n))&&(d+=1),v=n+1,void s++)};s<i;){var h=b();if("break"===h)break}return n&&(n[o]=d),d}function t(r){return 65<=r&&r<=90}function o(r,e){if(!r||!e)return!1;for(var n=e.length,t=r.toLowerCase(),o=0,u=-1;o<n;){var f=t.indexOf(e[o],u+1);if(f<0)return!1;u=f,o++}return!0}/*!
    BEGIN THIRD PARTY
    */
/*!
    * string_score.js: String Scoring Algorithm 0.1.22
    *
    * http://joshaven.com/string_score
    * https://github.com/joshaven/string_score
    *
    * Copyright (C) 2009-2014 Joshaven Potter <yourtech@gmail.com>
    * Special thanks to all of the contributors listed here https://github.com/joshaven/string_score
    * MIT License: http://opensource.org/licenses/MIT
    *
    * Date: Tue Mar 1 2011
    * Updated: Tue Mar 10 2015
    */
var u=["-","_"," ","/","\\","."];e.score=n,e.matches=o});