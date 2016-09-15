define(["require","exports","vs/platform/platform","vs/workbench/browser/parts/statusbar/statusbar","vs/workbench/parts/feedback/electron-browser/feedbackStatusbarItem"],function(t,e,r,s,a){/*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
"use strict";r.Registry.as(s.Extensions.Statusbar).registerStatusbarItem(new s.StatusbarItemDescriptor(a.FeedbackStatusbarItem,s.StatusbarAlignment.RIGHT,(-100)))});