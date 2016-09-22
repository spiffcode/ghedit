var __extends=this&&this.__extends||function(e,t){function i(){this.constructor=e}for(var o in t)t.hasOwnProperty(o)&&(e[o]=t[o]);e.prototype=null===t?Object.create(t):(i.prototype=t.prototype,new i)},__decorate=this&&this.__decorate||function(e,t,i,o){var r,n=arguments.length,s=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,o);else for(var c=e.length-1;c>=0;c--)(r=e[c])&&(s=(n<3?r(s):n>3?r(t,i,s):r(t,i))||s);return n>3&&s&&Object.defineProperty(t,i,s),s},__param=this&&this.__param||function(e,t){return function(i,o){t(i,o,e)}};define(["require","exports","vs/nls","vs/platform/platform","vs/editor/common/editorAction","vs/editor/common/editorActionEnablement","vs/editor/common/editorCommonExtensions","vs/editor/contrib/snippet/common/snippet","vs/editor/common/services/codeEditorService","vs/workbench/services/quickopen/common/quickOpenService","vs/editor/common/modes/snippetsRegistry"],function(e,t,i,o,r,n,s,c,p,d,a){/*---------------------------------------------------------------------------------------------
     *  Copyright (c) Microsoft Corporation. All rights reserved.
     *  Licensed under the MIT License. See License.txt in the project root for license information.
     *--------------------------------------------------------------------------------------------*/
"use strict";var u=function(e){function t(t,i,o,r){e.call(this,t,i,n.Behaviour.Writeable),this._quickOpenService=o,this._editorService=r}return __extends(t,e),t.prototype.run=function(){var e=this,t=this._editorService.getFocusedCodeEditor();if(t&&t.getModel()){var i=[];return o.Registry.as(a.Extensions.Snippets).visitSnippets(t.getModel().getModeId(),function(e){return i.push({label:e.prefix,detail:e.description,snippet:e}),!0}),this._quickOpenService.pick(i).then(function(t){if(t)return c.getSnippetController(e.editor).run(new c.CodeSnippet(t.snippet.codeSnippet),0,0),!0})}},t.ID="editor.action.showSnippets",t=__decorate([__param(2,d.IQuickOpenService),__param(3,p.ICodeEditorService)],t)}(r.EditorAction);s.CommonEditorRegistry.registerEditorAction(new s.EditorActionDescriptor(u,u.ID,i.localize("snippet.suggestions.label","Insert Snippet"),(void 0),"Insert Snippet"))});