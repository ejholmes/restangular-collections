(function(angular) {

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
    this.array = [];

    // Reset the collection to it's initial state.
    this.reset();
  }

  /**
   * Creates a new item and adds it to the collection.
   *
   * @param {Object} attributes - A hash of attributes to create the item with.
   *
   * @return {Promise}
   */
  Collection.prototype.create = function(attributes) {
    return this.restangularElem[this.options.methods.create](attributes).then(_.bind(this.add, this));
  };

  /**
   * Destroys an item and removes it from the collection.
   *
   * @param {Object} item - A reference to an item in this collection.
   *
   * @return {Promise}
   */
  Collection.prototype.destroy = function(item) {
    var promise = item[this.options.methods.remove]();
    return promise.then(_.bind(this.remove, this));
  };

  /**
   * Find an item from the collection.
   *
   * @param {Object} item - Can be an id, a reference to an item that's already
   * in this collection, or an object with an `id` attribute.
   *
   * @return {Object} The found object or undefined if not found.
   */
  Collection.prototype.find = function(item) {
    var id = this.options.id,
        find;

    if (_.isNumber(item)) {
      find = function(existing) { return existing[id] === item; };
    } else {
      find = function(existing) { return existing === item; };
    }

    return _.find(this.array, find) || item[id] && this.find(item[id]);
  };

  /**
   * Add an item to the collection.
   *
   * @param {Object} item - The item to add to the collection.
   *
   * @return {Object} The item that was provided.
   */
  Collection.prototype.add = function(item) {
    var existing = this.find(item);

    if (existing) {
      if (existing != item) {
        this.replace(existing, item);
      }
    } else {
      this.array.push(item);
      this.length += 1;
    }

    return item;
  };

  /**
   * Replaces the existing item with the new item, by copying all the
   * attributes.
   *
   * @param {Object} existing - The existing item to replace.
   * @param {Object} item     - The item to replace the existing item with.
   */
  Collection.prototype.replace = function(existing, item) {
    angular.copy(item, existing);
  };

  /**
   * Add an array of items to the collection.
   *
   * @param {Array} items - An array of items to add to the collection.
   */
  Collection.prototype.addAll = function(items) {
    return angular.forEach(items, _.bind(this.add, this));
  };

  /**
   * Remove an item from the collection.
   *
   * @param {Object} item - The item to remove from the collection.
   *
   * @return {Object} The item that was provided.
   */
  Collection.prototype.remove = function(item) {
    var existing = this.find(item);

    if (existing) {
      this.array.splice(_.indexOf(this.array, item), 1);
    }

    return item;
  };

  /**
   * Remove all items from the collection.
   *
   * @param {Array} items - An array of items to remove from the collection.
   */
  Collection.prototype.removeAll = function(items) {
    return angular.forEach(items, _.bind(this.remove, this));
  };

  /**
   * Reset the collection.
   */
  Collection.prototype.reset = function() {
    this.array.length = 0;
  };

  /**
   * A proxy to the underlying getList
   */
  Collection.prototype.getList = function() {
    var promise = this.restangularElem.getList.apply(this.restangularElem, arguments);

    return promise.then(_.bind(this.addAll, this));
  };

  angular.module('restangularCollections', ['restangular'])

    .config(function(RestangularProvider) {
      RestangularProvider.setOnElemRestangularized(function(elem, isCollection, what, Restangular) {
        if (isCollection) {
          elem.getCollection = function() {
            return new Collection(elem);
          };
        }

        return elem;
      });
    })

    .provider('RestangularCollection', function() {
      var config = this;

      this.collectionClass = Collection;

      this.$get = function() {
        return config.collectionClass;
      };
    });

})(angular);
