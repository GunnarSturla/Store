/**
 * @summary Stores manage the app state (variables and collections), exposes it with
 * helpers, and recieve dispatches from the dispatcher.
 *
 * This store partly implements [Facebook's example store](https://facebook.github.io/flux/docs/flux-utils.html#store)
 * @class
 * @param {String} name
 * @param {Dispatcher} dispatcher
 * @constructor
 */

Store = function(name, dispatcher) {
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

		// Run onCreated functions
		_.each(self._onCreated, function(cb){
			var func = _.bind(cb, self);
			func();
		});

		// Only register if actions have been declared
		if(!self._tokenId && self._actions) {
			self._tokenId = self._registerActions();
		}
		self._registerHelpers();
		self._created = true;
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
			callback();
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
	},





	/**
	 * Subscribe to a record set. Returns a handle that provides stop() and ready() methods.
	 *   Similar to template subscriptions in that they are destroyed when the store is.
	 *
	 * Note: Store subscriptions are still under development and are not ready for use
	 * @locus Client
	 * @param {String} name Name of the subscription.  Matches the name of the
	 * server's `publish()` call.
	 * @param {Any} [arg1,arg2...] Optional arguments passed to publisher
	 * function on server.
	 * @param {Function|Object} [callbacks] Optional. May include `onStop`
	 * and `onReady` callbacks. If there is an error, it is passed as an
	 * argument to `onStop`. If a function is passed instead of an object, it
	 * is interpreted as an `onReady` callback.
	 * @returns {Object} Handle that provides stop() and ready() methods.
	 * @namespace Store.subscribe
	 */
	subscribe: function (/* args */) {
		var self = this;
		var name = arguments[0];
		var args = Array.prototype.slice.call(arguments, 1);
		// initiate _subsHandles if it doesn't exist yet
		if(!self._subsHandles) {
			self._subsHandles = [];
		}


		// Is there an existing sub with the same name and param, run in an
		// invalidated Computation? This will happen if we are rerunning an
		// existing computation.
		var exists = _.find(self._subsHandles, function (sub) {
			return sub.inactive && sub.name === name &&
				EJSON.equals(sub.params, params);
		});

		var handle = Meteor.subscribe.apply(this, arguments);

		self._subsReady = false;
		self._subsHandles.push(handle);
		console.log('subscribing: ' + name + ' ' + self._subsHandles.length);
		// The problem seems to be that the subscription is rerun, and gets added
		// to the array, but shouldn't be. But if the sub isn't coming
		// from a reactive source, then it should be. Look at how Meteor.subscribe
		// does it

		return handle;
	},

	subscriptionsReady: function() {
		var self = this;
		Tracker.autorun(function() {
			console.log('sr');
			console.log(self._subsReady);
			self._subsReady = _.any(self._subsHandles, function(sub) {
				console.log(sub.ready());
				return sub.ready() } );
		});

		return self._subsReady;
	}
};
