/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require","exports","vs/platform/instantiation/common/instantiation"],function(n,t,i){"use strict";function e(n,t,i){function e(n,t){for(var i=n,e=0;e<t.length;e++)if(i=i[t[e]],!i)return;return i}var r=t.split("."),o=e(n,r);return"undefined"==typeof o?i:o}t.IConfigurationService=i.createDecorator("configurationService"),t.getConfigurationValue=e});