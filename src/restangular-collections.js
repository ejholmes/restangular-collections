(function(angular) {
  'use strict';

  var module = angular.module('restangularCollections', ['restangular']);

  function Collection(elem, options) {
    // Default options.
    var defaults = {
      id: 'id',
      methods: {
        create: 'create',
        destroy: 'remove'
      }
    };

    this.options = _.extend(defaults, options);

    // The original restangular element.
    this.restangularElem = elem;

    // The underlying array that stores everything.
    this.models = [];

    // Reset the collection to it's initial state.
    this.reset();
  }

  _.extend(Collection.prototype, {

    /**
     * Creates a new model and adds it to the collection.
     *
     * @param {Object} attributes - A hash of attributes to create the model with.
     *
     * @return {Promise}
     */
    create: function(attributes) {
      var create = this.restangularElem[this.options.methods.create];

      return create(attributes).then(_.bind(this.add, this));
    },

    /**
     * Destroys a model and removes it from the collection.
     *
     * @param {Object} model - The model to destroy.
     *
     * @return {Promise}
     */
    destroy: function(model) {
      var destroy = model[this.options.methods.destroy];

      return destroy().then(_.bind(this.remove, this));
    },

    /**
     * Find a model from the collection.
     *
     * @param {Object} model - Can be an id, a reference to a model that's already
     * in this collection, or an object with an `id` attribute.
     *
     * @return {Object} The found object or undefined if not found.
     */
    find: function(model) {
      var id = this.options.id,
          find;

      if (_.isNumber(model)) {
        find = function(existing) { return existing[id] === model; };
      } else {
        find = function(existing) { return existing === model; };
      }

      return _.find(this.models, find) || model[id] && this.find(model[id]);
    },

    /**
     * Returns the model at the given index.
     *
     * @param {Integer} index - The index of the model.
     *
     * @return {Object}
     */
    at: function(index) {
      return this.models[index];
    },

    /**
     * Add a model to the collection.
     *
     * @param {Object} model - The model to add to the collection.
     *
     * @return {Object} The model that was provided.
     */
    add: function(model) {
      var existing = this.find(model);

      if (existing) {
        if (existing != model) {
          this.replace(existing, model);
        }
      } else {
        this.models.push(model);
        this.length++;
      }

      return model;
    },

    /**
     * Replaces the existing model with the new model, by copying all the
     * attributes.
     *
     * @param {Object} existing - The existing model to replace.
     * @param {Object} model    - The model to replace the existing model with.
     */
    replace: function(existing, model) {
      angular.copy(model, existing);
    },

    /**
     * Add an array of models to the collection.
     *
     * @param {Array} models - An array of models to add to the collection.
     */
    addAll: function(models) {
      return angular.forEach(models, _.bind(this.add, this));
    },

    /**
     * Remove a model from the collection.
     *
     * @param {Object} model - The model to remove from the collection.
     *
     * @return {Object} The model that was provided.
     */
    remove: function(model) {
      var existing = this.find(model);

      if (existing) {
        this.models.splice(_.indexOf(this.models, model), 1);
        this.length--;
      }

      return model;
    },

    /**
     * Remove all models from the collection.
     *
     * @param {Array} models - An array of models to remove from the collection.
     */
    removeAll: function(models) {
      return angular.forEach(models, _.bind(this.remove, this));
    },

    /**
     * Reset the collection.
     */
    reset: function() {
      this.models.length = 0;
      this.length = 0;
    },

    /**
     * A proxy to the underlying getList
     */
    getList: function() {
      var promise = this.restangularElem.getList.apply(this.restangularElem, arguments);

      return promise.then(_.bind(this.addAll, this));
    }
  });

  module.config(function(RestangularProvider) {
    RestangularProvider.setOnElemRestangularized(function(elem, isCollection, what, Restangular) {
      if (isCollection) {

        /**
         * Builds a new Collection and returns it.
         *
         * @param {Object} options - A hash of options to pass along to the
         * Collection class.
         *
         * @return {Object|Promise}
         */
        elem.getCollection = function(options) {
          options = options || {};

          var collection = new Collection(elem, options);

          if (options.fetch) {
            return collection.getList().then(function() { return collection; });
          } else {
            return collection;
          }
        };
      }

      return elem;
    });
  });

  module.provider('RestangularCollection', function() {
    var collectionClass = Collection;
    this.setCollectionClass = function(klass) {
      collectionClass = klass;
    };

    this.$get = function() {
      return collectionClass;
    };
  });

})(angular);
