/*
Flux Store for Meteor

Licenced under the MIT License

  Copyright (c) 2015 Gunnar Sturla Ágústuson - gunnar@gunnarsturla.com github.com/GunnarSturla

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

/**
 * @summary Stores manage the app state (variables and collections), exposes it with
 * helpers, and receive dispatches from the dispatcher.
 *
 * This store partly implements [Facebook's example store](https://facebook.github.io/flux/docs/flux-utils.html#store)
 * @class
 * @param {String} name
 * @param {Dispatcher} dispatcher
 * @param {Boolean} [autocreate] If set to false, you need to call `store.create()` to
 * create the store
 * @constructor
 */

Store = function(name, dispatcher, autocreate) {
	var self = this;
	self.name = name;
	self._dispatcher = dispatcher;
	self._created = false;

	self._tokenId = null;
	self._subsHandles = null;
	self._subsReady = true;

	self._onCreated = [];
	self._onDestroyed = [];

	self._actions = null;
	self._helpers = null;

	if(typeof autocreate === 'undefined' || autocreate) {
		this.create();
	}
};
Store.prototype = {

	/**
	 * @summary Register the actions that this store handles. Actions describe a
	 * user's action, are not setters. (e.g. select-page not set-page-id)
	 *
	 * Note: According to the Flux way of doing things, store actions should
	 * not be called directly, but only via `Dispatcher.dispatch('action')` calls.
	 * @locus Anywhere
	 * @param {Object} actions - object of functions where the property
	 * corresponds to the action.
	 * @namespace Store.actions
	 */
	actions: function (actions) {
		var self = this;

		if(!self._actions) {
			self._actions = {};
		}

		// Bind the store's context to each of its actions
		_.each(actions, function(action, key) {
			self._actions[key] = _.bind(action, self);
		});

		// Register actions is the store has already been initiated
		// This happens if create() is called before the actions are
		// defined
		if(this._created && !self._tokenId) {
			self._tokedId = self._registerActions();
		}
	},

	/**
	 * Register the store's actions with the dispatcher
	 * @returns {String} tokenId the store got from the dispatcher
	 * @private
	 */
	_registerActions: function() {
		var self = this;

		return self._dispatcher.register(function (/*actionType, [arguments] */) {
			var actionType = null;
			var args;
			var func;
			if(typeof arguments[0] === 'string') {
				// if arguments[0] is string
				// TODO: Throw error if not
				actionType = arguments[0];
			}


			if (_.has(self._actions, actionType)) {

				func = self._actions[actionType];

				args = Array.prototype.slice.call(arguments, 1);
				// TODO: Stop leakage

				func.apply(args);
			}
		});
	},

	/**
	 * @summary Returns the dispatcher this store is registered with.
	 * @returns {Dispatcher}
	 * @namespace Store.getDispatcher
	 */
	getDispatcher: function() {
		return this._dispatcher;
	},

	/**
	 * Returns the dispatch token that the dispatcher recognizes
	 * this store by. Can be used to waitFor() this store.
	 * @namespace Store.getDispatchTokes
	 * @returns {String} tokenId
	 */
	getDispatchToken: function() {
		return this._tokenId;
	},

	/**
	 * @summary Specify this store's helpers.
	 * @locus Anywhere
	 * @param {Object} helpers Dictionary of helper functions by name.
	 * @namespace Store.helpers
	 */
	helpers: function (helpers) {
		var self = this;

		self._helpers = helpers;

		// Register helpers is the store has already been initiated
		if(this._created) {
			self._registerHelpers();
		}
	},

	/**
	 * Register helpers with Template and attach the helper functions
	 * directly to the store
	 * @private
	 */
	_registerHelpers: function() {
		var self = this;

		var helpers = self._helpers;

		// Bind the store's context to each of its helpers
		_.each(helpers, function(helper, key) {
			helpers[key] = _.bind(helper, self);
		});

		// Attach the helpers to the Store object
		_.extend(self, helpers);

		// Only register helpers to templates on client.
		// Helpers will be available as functions on server
		if(Meteor.isClient) {
			Template.registerHelper(self.name, helpers);
		}
	},

	/**
	 * @summary Initiate the store. Runs onCreated functions and
	 * registers itself with the dispatcher, and makes its helpers available
	 * in templates.
	 * @namespace Store.create
	 */
	create: function() {
		var self = this;

		if(!self._created) {
			// Run onCreated functions
			_.each(self._onCreated, function (cb) {
				var func = _.bind(cb, self);
				func();
			});

			// Only register if actions have been declared
			if (!self._tokenId && self._actions) {
				self._tokenId = self._registerActions();
			}
			self._registerHelpers();
			self._created = true;
		}
	},

	/**
	 * @summary Destroy the store
	 * @namespace Store.destroy
	 */
	destroy: function() {
		var self = this;

		//Run onDestroyed functions
		_.each(self._onDestroyed, function(cb){
			var func = _.bind(cb, self);
			func();
		});

		// Unregister helpers from Template
		if(Meteor.isClient) {
			Template.registerHelper(self.name, null);
		}

		// Unregister actions from Dispatcher
		self._dispatcher.unregister(self._tokenId);
		self._tokenId = null;

		// Reset all functions and whatever else the store has set
		var important = ['name','_actions', '_dispatcher', '_helpers', '_onCreated', '_onDestroyed', '__proto__'];
		_.each(self, function(value, key, list) {

			var key = key;
			var isImportant = _.find(important, function(item) { return item === key });

			if(!isImportant) {
				self[key] = undefined;
			}
		});

		self._created = false;
	},


	/**
	 * @summary Register a function that gets called when the store is created.
	 * This is a good place to set variables and subscription this store needs.
	 * Similar to [`Template.myTemplate.onCreated`](http://docs.meteor.com/#/full/template_onCreated)
	 * @param callback
	 * @namespace Store.onCreated
	 */
	onCreated: function(callback) {
		this._onCreated.push(callback);

		if(this._created) {
			var cb = _.bind(callback, this);
			cb();
		}
	},

	/**
	 * @summary Register a function that gets called when the store is destroyed.
	 * Similar to [`Template.myTemplate.onDestroyed`](http://docs.meteor.com/#/full/template_onDestroyed)
	 * @param {function} callback
	 * @namespace Store.onDestroyed
	 */
	onDestroyed: function(callback) {
		this._onDestroyed.push(callback);
	},

	/**
	 * @summary Checks whether the store has been created
	 * @returns {boolean}
	 * @namespace Store.created
	 * @example
	 * ```
	 * if(!CounterStore.created()) {
	 *     CounterStore.create();
	 * }
	 * ```
	 */
	created: function() {
		return this._created;
	}
};
