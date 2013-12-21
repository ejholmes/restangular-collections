(function(angular) {
  'use strict';

  function Collection(elem, options) {
    // Default options.
    var defaults = {
      id: 'id',
      methods: {
        create: 'create',
        remove: 'remove'
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

  /**
   * Creates a new model and adds it to the collection.
   *
   * @param {Object} attributes - A hash of attributes to create the model with.
   *
   * @return {Promise}
   */
  Collection.prototype.create = function(attributes) {
    return this.restangularElem[this.options.methods.create](attributes).then(_.bind(this.add, this));
  };

  /**
   * Destroys a model and removes it from the collection.
   *
   * @param {Object} model - A reference to a model in this collection.
   *
   * @return {Promise}
   */
  Collection.prototype.destroy = function(model) {
    var promise = model[this.options.methods.remove]();
    return promise.then(_.bind(this.remove, this));
  };

  /**
   * Find a model from the collection.
   *
   * @param {Object} model - Can be an id, a reference to a model that's already
   * in this collection, or an object with an `id` attribute.
   *
   * @return {Object} The found object or undefined if not found.
   */
  Collection.prototype.find = function(model) {
    var id = this.options.id,
        find;

    if (_.isNumber(model)) {
      find = function(existing) { return existing[id] === model; };
    } else {
      find = function(existing) { return existing === model; };
    }

    return _.find(this.models, find) || model[id] && this.find(model[id]);
  };

  /**
   * Add a model to the collection.
   *
   * @param {Object} model - The model to add to the collection.
   *
   * @return {Object} The model that was provided.
   */
  Collection.prototype.add = function(model) {
    var existing = this.find(model);

    if (existing) {
      if (existing != model) {
        this.replace(existing, model);
      }
    } else {
      this.models.push(model);
      this.length++;
      this._addReference(model);
    }

    return model;
  };

  /**
   * Replaces the existing model with the new model, by copying all the
   * attributes.
   *
   * @param {Object} existing - The existing model to replace.
   * @param {Object} model    - The model to replace the existing model with.
   */
  Collection.prototype.replace = function(existing, model) {
    angular.copy(model, existing);
  };

  /**
   * Add an array of models to the collection.
   *
   * @param {Array} models - An array of models to add to the collection.
   */
  Collection.prototype.addAll = function(models) {
    return angular.forEach(models, _.bind(this.add, this));
  };

  /**
   * Remove a model from the collection.
   *
   * @param {Object} model - The model to remove from the collection.
   *
   * @return {Object} The model that was provided.
   */
  Collection.prototype.remove = function(model) {
    var existing = this.find(model);

    if (existing) {
      this.models.splice(_.indexOf(this.models, model), 1);
      this._removeReference(existing);
      this.length--;
    }

    return model;
  };

  /**
   * Remove all models from the collection.
   *
   * @param {Array} models - An array of models to remove from the collection.
   */
  Collection.prototype.removeAll = function(models) {
    return angular.forEach(models, _.bind(this.remove, this));
  };

  /**
   * Reset the collection.
   */
  Collection.prototype.reset = function() {
    this.models.length = 0;
    this.length = 0;
  };

  /**
   * Adds a reference to the provided model to reference this collection.
   *
   * @param {Object} model - The model to add the reference to.
   */
  Collection.prototype._addReference = function(model) {
    if (!model.collection) {
      model.collection = this;
    }
  };

  /**
   * Removes the reference to this collection from the model.
   *
   * @param {Object} model - The model to remove the reference from.
   */
  Collection.prototype._removeReference = function(model) {
    if (this === model.collection) {
      delete model.collection;
    }
  };

  /**
   * A proxy to the underlying getList
   */
  Collection.prototype.getList = function() {
    var promise = this.restangularElem.getList.apply(this.restangularElem, arguments);

    return promise.then(_.bind(this.addAll, this));
  };

  var module = angular.module('restangularCollections', ['restangular']);

  module.config(function(RestangularProvider) {
    RestangularProvider.setOnElemRestangularized(function(elem, isCollection, what, Restangular) {
      if (isCollection) {
        elem.getCollection = function() {
          return new Collection(elem);
        };
      }

      return elem;
    });
  });

  module.provider('RestangularCollection', function() {
    var config = this;

    this.collectionClass = Collection;

    this.$get = function() {
      return config.collectionClass;
    };
  });

})(angular);
