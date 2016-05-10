/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Sort of forked from 31ce12f023580d67a66d14843e7f9983caadbe56:./vs/workbench/browser/parts/statusbar/statusbarPart.ts

'use strict';

import 'vs/css!./navbarPart';
import dom = require('vs/base/browser/dom');
import types = require('vs/base/common/types');
import nls = require('vs/nls');
import {toErrorMessage} from 'vs/base/common/errors';
import {TPromise} from 'vs/base/common/winjs.base';
import {dispose, IDisposable} from 'vs/base/common/lifecycle';
import {Builder, $} from 'vs/base/browser/builder';
import {OcticonLabel} from 'vs/base/browser/ui/octiconLabel/octiconLabel';
import {Registry} from 'vs/platform/platform';
import {IKeybindingService} from 'vs/platform/keybinding/common/keybindingService';
import {IAction} from 'vs/base/common/actions';
import {IWorkbenchEditorService} from 'vs/workbench/services/editor/common/editorService';
import {Part} from 'vs/workbench/browser/part';
import {IWorkbenchActionRegistry, Extensions as ActionExtensions} from 'vs/workbench/common/actionRegistry';
import {NavbarAlignment, INavbarRegistry, Extensions, INavbarItem} from 'navbar';
import {IInstantiationService} from 'vs/platform/instantiation/common/instantiation';
import {ITelemetryService} from 'vs/platform/telemetry/common/telemetry';
import {IMessageService, Severity} from 'vs/platform/message/common/message';
import {INavbarService, INavbarEntry} from 'navbarService';

export class NavbarPart extends Part implements INavbarService {

	public serviceId = INavbarService;

	private static PRIORITY_PROP = 'priority';
	private static ALIGNMENT_PROP = 'alignment';

	private toDispose: IDisposable[];
	private navItemsContainer: Builder;

	constructor(
		id: string,
		@IInstantiationService private instantiationService: IInstantiationService
	) {
		super(id);

		this.toDispose = [];
	}

	public addEntry(entry: INavbarEntry, alignment: NavbarAlignment, priority: number = 0): IDisposable {
		let item = this.instantiationService.createInstance(NavBarEntryItem, entry);
        return this.addItem(item, alignment, priority);
    }

	public addItem(item: INavbarItem, alignment: NavbarAlignment, priority: number = 0): IDisposable {
		let el = this.doCreateNavItem(alignment, priority);

		// Render entry in nav bar
		let toDispose = item.render(el);

		// Insert according to priority
		let container = this.navItemsContainer.getHTMLElement();
		let neighbours = this.getEntries(alignment);
		let inserted = false;
		for (let i = 0; i < neighbours.length; i++) {
			let neighbour = neighbours[i];
			let nPriority = $(neighbour).getProperty(NavbarPart.PRIORITY_PROP);
			if (
				alignment === NavbarAlignment.LEFT && nPriority < priority ||
				alignment === NavbarAlignment.RIGHT && nPriority > priority
			) {
				container.insertBefore(el, neighbour);
				inserted = true;
				break;
			}
		}

		if (!inserted) {
			container.appendChild(el);
		}

		return {
			dispose: () => {
				$(el).destroy();

				if (toDispose) {
					toDispose.dispose();
				}
			}
		};
	}

	private getEntries(alignment: NavbarAlignment): HTMLElement[] {
		let entries: HTMLElement[] = [];

		let container = this.navItemsContainer.getHTMLElement();
		let children = container.children;
		for (let i = 0; i < children.length; i++) {
			let childElement = <HTMLElement>children.item(i);
			if ($(childElement).getProperty(NavbarPart.ALIGNMENT_PROP) === alignment) {
				entries.push(childElement);
			}
		}

		return entries;
	}

	public createContentArea(parent: Builder): Builder {
		this.navItemsContainer = $(parent);

		// Fill in initial items that were contributed from the registry
		let registry = (<INavbarRegistry>Registry.as(Extensions.Navbar));

		let leftDescriptors = registry.items.filter(d => d.alignment === NavbarAlignment.LEFT).sort((a, b) => b.priority - a.priority);
		let rightDescriptors = registry.items.filter(d => d.alignment === NavbarAlignment.RIGHT).sort((a, b) => a.priority - b.priority);

		let descriptors = rightDescriptors.concat(leftDescriptors); // right first because they float

		this.toDispose.push(...descriptors.map(descriptor => {
			let item = this.instantiationService.createInstance(descriptor.syncDescriptor);
			let el = this.doCreateNavItem(descriptor.alignment, descriptor.priority);

			let dispose = item.render(el);
			this.navItemsContainer.append(el);

			return dispose;
		}));

		return this.navItemsContainer;
	}

	private doCreateNavItem(alignment: NavbarAlignment, priority: number = 0): HTMLElement {
		let el = document.createElement('div');
		dom.addClass(el, 'navbar-item');

		if (alignment === NavbarAlignment.RIGHT) {
			dom.addClass(el, 'right');
		} else {
			dom.addClass(el, 'left');
		}

		$(el).setProperty(NavbarPart.PRIORITY_PROP, priority);
		$(el).setProperty(NavbarPart.ALIGNMENT_PROP, alignment);

		return el;
	}

	public dispose(): void {
		this.toDispose = dispose(this.toDispose);

		super.dispose();
	}
}

class NavBarEntryItem implements INavbarItem {
	private entry: INavbarEntry;

	constructor(
		entry: INavbarEntry,
		@IKeybindingService private keybindingService: IKeybindingService,
		@IInstantiationService private instantiationService: IInstantiationService,
		@IMessageService private messageService: IMessageService,
		@ITelemetryService private telemetryService: ITelemetryService,
		@IWorkbenchEditorService private editorService: IWorkbenchEditorService
	) {
		this.entry = entry;
	}

	public render(el: HTMLElement): IDisposable {
		let toDispose: IDisposable[] = [];
		dom.addClass(el, 'navbar-entry');

		// Text Container
		let textContainer: HTMLElement;
		if (this.entry.command) {
			textContainer = document.createElement('a');

			$(textContainer).on('click', () => this.executeCommand(this.entry.command), toDispose);
		} else {
			textContainer = document.createElement('span');
		}

		// Label
		new OcticonLabel(textContainer).text = this.entry.text;

		// Tooltip
		if (this.entry.tooltip) {
			$(textContainer).title(this.entry.tooltip);
		}

		// Color
		if (this.entry.color) {
			$(textContainer).color(this.entry.color);
		}

		el.appendChild(textContainer);

		return {
			dispose: () => {
				toDispose = dispose(toDispose);
			}
		};
	}

	private executeCommand(id: string) {
		let action: IAction;
		let activeEditor = this.editorService.getActiveEditor();

		// Lookup built in commands
		let builtInActionDescriptor = (<IWorkbenchActionRegistry>Registry.as(ActionExtensions.WorkbenchActions)).getWorkbenchAction(id);
		if (builtInActionDescriptor) {
			action = this.instantiationService.createInstance(builtInActionDescriptor.syncDescriptor);
		}

		// Lookup editor commands
		if (!action) {
			let activeEditorControl = <any>(activeEditor ? activeEditor.getControl() : null);
			if (activeEditorControl && types.isFunction(activeEditorControl.getAction)) {
				action = activeEditorControl.getAction(id);
			}
		}

		// Some actions or commands might only be enabled for an active editor, so focus it first
		if (activeEditor) {
			activeEditor.focus();
		}

		// Run it if enabled
		if (action) {
			if (action.enabled) {
				this.telemetryService.publicLog('workbenchActionExecuted', { id: action.id, from: 'nav bar' });
				(action.run() || TPromise.as(null)).done(() => {
					action.dispose();
				}, (err) => this.messageService.show(Severity.Error, toErrorMessage(err)));
			} else {
				this.messageService.show(Severity.Warning, nls.localize('canNotRun', "Command '{0}' can not be run from here.", action.label || id));
			}
		}

		// Fallback to the keybinding service for any other case
		else {
			this.keybindingService.executeCommand(id).done(undefined, err => this.messageService.show(Severity.Error, toErrorMessage(err)));
		}
	}
}