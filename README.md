# Flux Store for Meteor

This package adds a Store class to simplify following Facebook's Flux architecture.
The store manages the app state by taking dispatches from the dispatcher, updating
the app state and exposing helpers for views/templates to include.


<a name="Store"></a>
## Store
**Kind**: global class
**Summary**: Store... more is coming

This store partly implements [Facebook&#x27;s example store](https://facebook.github.io/flux/docs/flux-utils.html#store)

* [Store](#Store)
  * [new Store(name, dispatcher)](#new_Store_new)
  * [.actions](#Store.actions) : <code>object</code>
  * [.getDispatcher](#Store.getDispatcher) ⇒ <code>Dispatcher</code>
  * [.getDispatchTokes](#Store.getDispatchTokes) ⇒ <code>String</code>
  * [.helpers](#Store.helpers) : <code>object</code>
  * [.create](#Store.create) : <code>object</code>
  * [.destroy](#Store.destroy) : <code>object</code>
  * [.onCreated](#Store.onCreated) : <code>object</code>
  * [.onDestroyed](#Store.onDestroyed) : <code>object</code>
  * [.created](#Store.created) ⇒ <code>boolean</code>
  * [.subscribe](#Store.subscribe) ⇒ <code>Object</code>

<a name="new_Store_new"></a>
### new Store(name, dispatcher)

| Param | Type |
| --- | --- |
| name | <code>String</code> |
| dispatcher | <code>Dispatcher</code> |

<a name="Store.actions"></a>
### Store.actions : <code>object</code>
**Kind**: static namespace of <code>[Store](#Store)</code>
**Summary**: Register the actions that this store handles. Actions describe a
user&#x27;s action, are not setters. (e.g. select-page not set-page-id)

Note: According to the Flux way of doing things, store actions should
not be called directly, but only via &#x60;Dispatcher.dispatch(&#x27;action&#x27;)&#x60; calls.
**Locus**: Anywhere

| Param | Type | Description |
| --- | --- | --- |
| actions | <code>Object</code> | object of functions where the property corresponds to the action. |

<a name="Store.getDispatcher"></a>
### Store.getDispatcher ⇒ <code>Dispatcher</code>
**Kind**: static namespace of <code>[Store](#Store)</code>
**Summary**: Returns the dispatcher this store is registered with.
<a name="Store.getDispatchTokes"></a>
### Store.getDispatchTokes ⇒ <code>String</code>
**Kind**: static namespace of <code>[Store](#Store)</code>
**Summary**: Returns the dispatch token that the dispatcher recognizes
this store by. Can be used to waitFor() this store.
**Returns**: <code>String</code> - tokenId
<a name="Store.helpers"></a>
### Store.helpers : <code>object</code>
**Kind**: static namespace of <code>[Store](#Store)</code>
**Summary**: Specify this store&#x27;s helpers.
**Locus**: Anywhere

| Param | Type | Description |
| --- | --- | --- |
| helpers | <code>Object</code> | Dictionary of helper functions by name. |

<a name="Store.create"></a>
### Store.create : <code>object</code>
**Kind**: static namespace of <code>[Store](#Store)</code>
**Summary**: Initiate the store. Runs onCreated functions and
registers itself with the dispatcher, and makes its helpers available
in templates.
<a name="Store.destroy"></a>
### Store.destroy : <code>object</code>
**Kind**: static namespace of <code>[Store](#Store)</code>
**Summary**: Destroy the store
<a name="Store.onCreated"></a>
### Store.onCreated : <code>object</code>
**Kind**: static namespace of <code>[Store](#Store)</code>
**Summary**: Register a function that gets called when the store is created.
This is a good place to set variables and subscription this store needs.
Similar to [&#x60;Template.myTemplate.onCreated&#x60;](http://docs.meteor.com/#/full/template_onCreated)

| Param |
| --- |
| callback |

<a name="Store.onDestroyed"></a>
### Store.onDestroyed : <code>object</code>
**Kind**: static namespace of <code>[Store](#Store)</code>
**Summary**: Register a function that gets called when the store is destroyed.
Similar to [&#x60;Template.myTemplate.onDestroyed&#x60;](http://docs.meteor.com/#/full/template_onDestroyed)

| Param | Type |
| --- | --- |
| callback | <code>function</code> |

<a name="Store.created"></a>
### Store.created ⇒ <code>boolean</code>
**Kind**: static namespace of <code>[Store](#Store)</code>
**Summary**: Checks whether the store has been created
&#x60;&#x60;&#x60;
if(!CounterStore.created()) {
    CounterStore.create();
}
&#x60;&#x60;&#x60;
**Example**
```js
<pre>if(!CounterStore.created()) {
    CounterStore.create();
}</pre>
```
<a name="Store.subscribe"></a>
### Store.subscribe ⇒ <code>Object</code>
Subscribe to a record set. Returns a handle that provides stop() and ready() methods.
  Similar to template subscriptions in that they are destroyed when the store is.

Note: Store subscriptions are still under development and are not ready for use

**Kind**: static namespace of <code>[Store](#Store)</code>
**Returns**: <code>Object</code> - Handle that provides stop() and ready() methods.
**Locus**: Client

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | Name of the subscription.  Matches the name of the server's `publish()` call. |
| [arg1,arg2...] | <code>Any</code> | Optional arguments passed to publisher function on server. |
| [callbacks] | <code>function</code> &#124; <code>Object</code> | Optional. May include `onStop` and `onReady` callbacks. If there is an error, it is passed as an argument to `onStop`. If a function is passed instead of an object, it is interpreted as an `onReady` callback. |

