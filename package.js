Package.describe({
  name: 'gunnarsturla:flux-store',
  version: '1.0.0',
  // Brief, one-line summary of the package.
  summary: "A Store class to simplify following Facebook's Flux architecture in Meteor",
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/GunnarSturla/Store.git',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.use('templating', 'client');
  api.use('meteorflux:dispatcher');
  api.use('underscore');
  api.versionsFrom('1.1.0.2');
  api.addFiles('store.js');

  api.export('Dispatcher');
  api.export('Store');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('gunnarsturla:flux-store');
  api.addFiles('store-tests.js');
});
