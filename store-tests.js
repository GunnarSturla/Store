var store,
    dispatcher,
    destroyed;

var setup = function() {
  dispatcher = {
    registered: 0,

    register: function (callback) {
      this.actionCallbacks = callback;
      this.registered++;
      return this.registered;
    },
    unregister: function () {
      this.registered--;
    }

  };


  store = new Store('testStore', dispatcher);

  store.onCreated(function() {

    this.count = 0;

  });
  store.helpers({
    getCount: function() {
      return this.count;
    }
  });

  store.actions({
    increment: function() {
      this.count++;
    },
    incrementBy: function(n) {
      this.count = this.count + n;
    }
  });

  store.onDestroyed(function() {
    destroyed++;
  });

  destroyed = 0;

};

var create = function() {
  store.create();
};

var destroy = function() {
  store.destroy();
};

var teardown = function() {
  store = null;
  dispatcher = null;
  destroyed = null;
};


Tinytest.add('Store - should be prototype of Store', function (test) {
  setup();
  create();

  test.instanceOf(store, Store);

  teardown();

});

Tinytest.add('Store - should not get created until create() is called', function (test) {
  setup();

  test.isUndefined(store.count, 'vars not set');
  test.isUndefined(store.getCount);
  test.isFalse(store.created());
  test.equal(dispatcher.registered, 0);

  teardown();
});

Tinytest.add('Store - should get created correctly', function (test) {
  setup();

  test.isUndefined(store.count, 'vars not set');
  test.isUndefined(store.getCount);
  test.isFalse(store.created());
  test.equal(dispatcher.registered, 0);

  create();

  test.equal(store.count, 0);
  test.isNotUndefined(store.getCount);
  test.isTrue(store.created(),'created function should be true');
  test.equal(dispatcher.registered, 1, 'if store has registered with dispatcher');

  teardown();
});

Tinytest.add('Store - onDestroyed - should call onDestroyed functions when destroyed', function(test) {
  setup();
  create();

  test.equal(destroyed, 0);
  destroy();

  test.equal(destroyed, 1);

  teardown();
});

Tinytest.add('Store - onDestroyed - should call multiple onDestroyed functions when destroyed', function(test) {
  setup();

  store.onDestroyed(function() {
    destroyed++;
  });

  create();
  test.equal(destroyed, 0);

  destroy();
  test.equal(destroyed, 2);

  teardown();
});

Tinytest.add('Store - onDestroyed - should unregister from dispatcher', function(test) {
  setup();
  create();

  test.equal(dispatcher.registered, 1);

  destroy();
  test.equal(dispatcher.registered, 0);

  teardown();
});

Tinytest.add('Store - onDestroyed - should remove helper functions', function(test) {
  setup();
  create();

  test.equal(store.getCount(), 0);

  destroy();
  test.isUndefined(store.getCount);

  teardown();
});





Tinytest.add('Store - Helpers - should return value of count', function (test) {
  setup();
  create();

  test.equal(store.count, store.getCount());

  teardown();
});


Tinytest.add("Store - Actions - should register with dispatcher" +
    " when store is created", function (test) {
  setup();
  test.equal(dispatcher.registered, 0);

  create();

  test.equal(dispatcher.registered, 1);


  teardown();
});


Tinytest.add('Store - Actions - Calls to the dispatcher should call the action', function (test) {
  setup();
  create();

  test.equal(store.count, 0);
  dispatcher.actionCallbacks('increment');
  test.equal(store.count, 1);

  teardown();
});

Tinytest.add('Store - Actions - should increment counter', function (test) {
  setup();
  create();

  test.equal(store.getCount(), 0);

  store._actions.increment();

  test.equal(store.getCount(), 1);

  teardown();
});


Tinytest.add('Store - Actions - should take arguments', function (test) {
  setup();
  create();

  test.equal(store.getCount(), 0);

  store._actions.incrementBy(2);

  test.equal(store.getCount(), 2);

  teardown();
});
