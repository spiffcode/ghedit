/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __extends=this&&this.__extends||function(e,o){function t(){this.constructor=e}for(var r in o)o.hasOwnProperty(r)&&(e[r]=o[r]);e.prototype=null===o?Object.create(o):(t.prototype=o.prototype,new t)};define(["require","exports","vs/base/common/severity","vs/base/common/winjs.base","vs/platform/event/common/eventService","vs/platform/event/common/event","vs/platform/extensions/common/abstractExtensionService","vs/platform/extensions/common/extensions","vs/platform/instantiation/common/serviceCollection","vs/platform/instantiation/common/instantiationService","vs/editor/common/services/modeServiceImpl","vs/editor/common/services/modeService","vs/editor/common/services/resourceServiceImpl","vs/editor/common/services/resourceService","vs/editor/common/services/compatWorkerServiceWorker","vs/editor/common/services/compatWorkerService","vs/editor/common/languages.common"],function(e,o,t,r,n,i,c,s,a,v,m,p,u,l,d,f){"use strict";var S=function(e){function o(){e.call(this,!0)}return __extends(o,e),o.prototype._showMessage=function(e,o){switch(e){case t["default"].Error:console.error(o);break;case t["default"].Warning:console.warn(o);break;case t["default"].Info:console.info(o);break;default:console.log(o)}},o.prototype._createFailedExtension=function(){throw new Error("unexpected")},o.prototype._actualActivateExtension=function(e){throw new Error("unexpected")},o}(c.AbstractExtensionService),w=function(){function e(){}return e.prototype.initialize=function(e,o,t,r,c){var w=new a.ServiceCollection,h=new v.InstantiationService(w),x=new S;w.set(s.IExtensionService,x);var k=new u.ResourceService;w.set(l.IResourceService,k),w.set(i.IEventService,new n.EventService);var y=new m.ModeServiceImpl(h,x);w.set(p.IModeService,y),this.compatWorkerService=new d.CompatWorkerServiceWorker(k,y,c.modesRegistryData),w.set(f.ICompatWorkerService,this.compatWorkerService),o(void 0)},e.prototype.request=function(e,o,t,n,i){try{r.TPromise.as(this.compatWorkerService.handleMainRequest(i.target,i.methodName,i.args)).then(o,t)}catch(c){t(c)}},e}();o.EditorWorkerServer=w,o.value=new w});