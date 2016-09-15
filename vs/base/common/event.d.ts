import { IDisposable } from 'vs/base/common/lifecycle';
import { EventEmitter } from 'vs/base/common/eventEmitter';
import { TPromise } from 'vs/base/common/winjs.base';
/**
 * To an event a function with one or zero parameters
 * can be subscribed. The event is the subscriber function itself.
 */
interface Event<T> {
    (listener: (e: T) => any, thisArgs?: any, disposables?: IDisposable[]): IDisposable;
}
declare namespace Event {
    const None: Event<any>;
}
export default Event;
export interface EmitterOptions {
    onFirstListenerAdd?: Function;
    onLastListenerRemove?: Function;
}
/**
 * The Emitter can be used to expose an Event to the public
 * to fire it from the insides.
 * Sample:
    class Document {

        private _onDidChange = new Emitter<(value:string)=>any>();

        public onDidChange = this._onDidChange.event;

        // getter-style
        // get onDidChange(): Event<(value:string)=>any> {
        // 	return this._onDidChange.event;
        // }

        private _doIt() {
            //...
            this._onDidChange.fire(value);
        }
    }
 */
export declare class Emitter<T> {
    private _options;
    private static _noop;
    private _event;
    private _callbacks;
    private _disposed;
    constructor(_options?: EmitterOptions);
    /**
     * For the public to allow to subscribe
     * to events from this Emitter
     */
    event: Event<T>;
    /**
     * To be kept private to fire an event to
     * subscribers
     */
    fire(event?: T): any;
    dispose(): void;
}
/**
 * Creates an Event which is backed-up by the event emitter. This allows
 * to use the existing eventing pattern and is likely using less memory.
 * Sample:
 *
 * 	class Document {
 *
 *		private _eventbus = new EventEmitter();
 *
 *		public onDidChange = fromEventEmitter(this._eventbus, 'changed');
 *
 *		// getter-style
 *		// get onDidChange(): Event<(value:string)=>any> {
 *		// 	cache fromEventEmitter result and return
 *		// }
 *
 *		private _doIt() {
 *			// ...
 *			this._eventbus.emit('changed', value)
 *		}
 *	}
 */
export declare function fromEventEmitter<T>(emitter: EventEmitter, eventType: string): Event<T>;
export declare function fromPromise<T>(promise: TPromise<Event<T>>): Event<T>;
export declare function mapEvent<I, O>(event: Event<I>, map: (i: I) => O): Event<O>;
export declare function filterEvent<T>(event: Event<T>, filter: (e: T) => boolean): Event<T>;
export declare function debounceEvent<I, O>(event: Event<I>, merger: (last: O, event: I) => O, delay?: number): Event<O>;
/**
 * The EventDelayer is useful in situations in which you want
 * to delay firing your events during some code.
 * You can wrap that code and be sure that the event will not
 * be fired during that wrap.
 *
 * ```
 * const emitter: Emitter;
 * const delayer = new EventDelayer();
 * const delayedEvent = delayer.delay(emitter.event);
 *
 * delayedEvent(console.log);
 *
 * delayer.wrap(() => {
 *   emitter.fire(); // event will not be fired yet
 * });
 *
 * // event will only be fired at this point
 * ```
 */
export declare class EventBufferer {
    private buffers;
    wrapEvent<T>(event: Event<T>): Event<T>;
    bufferEvents(fn: () => void): void;
}
