# Flux Store for Meteor

This package adds a Store class to simplify following Facebook's Flux architecture.
The store manages the app state by taking dispatches from the dispatcher, updating
the app state and exposing helpers for views/templates to include.

## Installation
This package has not yet been published, but you can clone/copy it into a
`project_root/packages/foldername` folder and then add it with `meteor add foldername`.

You will also need to install the [dispatcher](#dispatcher) package in the same way.


## Flux
![Diagram of data flow in Flux](https://facebook.github.io/flux/img/flux-simple-f8-diagram-with-client-action-1300w.png)

### Dispatcher
Dispatcher is used to broadcast payloads to registered callbacks.

This package uses a modified version of [meteorflux:dispatcher](https://github.com/meteorflux/dispatcher) that [can be found here](https://github.com/GunnarSturla/dispatcher) and
can be installed in a similar way to this one. The difference between the two
versions is that the modified version allows dispatch calls to be made in a more
"Meteor-like" way by calling `Dispatcher.dispatch('action_performed', data);`

### Store
Manages the app state. It recieves dispatches from the dispatcher, acts on them (by changing the app state)
and updates the views


I recommend reading [Facebook's Flux overview](https://facebook.github.io/flux/docs/overview.html) to get a feeling for it.

## Using Flux Store for Meteor

### Create a new store
```
PlayerStore = new Store('PlayerStore', Dispatcher);
```
The `'PlayerStore'` (a string) is what the store will be registered under with the
`Template.registerHelper`, and will be accessable in themplates with `{{|PlayerStore.[helper]}}`



### onCreated
Similar to `Template.myTemplate.onCreated`, it lets you define functions that are called
when the store is created. This is a good place to set up subscriptions and initiate variables.
```
Players = new Mongo.Collection('players');

PlayerStore.onCreated(function() {
  this.handle = Meteor.subscribe('allplayers');
}
```


### Helpers
The stores have helpers that expose the store state to Templates and your code.

First define your helpers just like you would your Template helpers
```
PlayerStore.helpers({
  players: function() {
    return Players.get();
  },
  player: function(id) {
    return Players.find({_id: id});
  }
});
```
Then you can call it from your views / templates
```
{{|#each PlayerStore.players}}
<p>Player name: {{|name}} ({{|score}})</p>
{{|/each}}
```
or in your code
```
var players = PlayerStore.players().fetch();
var playerName = PlayerStore.player(id).name;
var playerAge  = PlayerStore.player(id).age;
```

### Actions
Store Actions are functions that get registered with the dispatcher and called whenever
the dispatcher recieves dispatches with the same action.

Events are declared in `Template.myTemplate.events`, but the only thing they do is dispatch
actions.
```
//myTemplate.js
Template.myTemplate.events({
  'click .resetScore': function() {
    Dispatcher.dispatch('resets_score', this._id);
  }
});

//PlayerStore.js
PlayerStore.actions({
  'resets_score': function(id) {
    Players.update(id, {$set: {score: 0}});
  }
});
```

### onDestroyed
Similar to `Template.myTemplate.onDestroyed` it gets called when the store is destroyed.


