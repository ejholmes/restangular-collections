(function(angular) {
  function Collection(elem, options) {
    this.restangularElem = elem;

    this.array = [];

    // Reset the collection to it's initial state.
    this.reset();
  };

  /*
   * Find an item from the collection.
   */
  Collection.prototype.find = function(item) {
    var find;

    if (_.isNumber(item)) {
      find = function(existing) { return existing.id === item; };
    } else {
      find = function(existing) { return existing === item; };
    };

    return _.find(this.array, find);
  };

  /*
   * Add an item to the collection.
   */
  Collection.prototype.add = function(item) {
    var existing = this.find(item);

    if (!existing) {
      this.array.push(item);
      this.length += 1;
    };

    return item;
  };

  /*
   * Add an array of items to the collection.
   */
  Collection.prototype.addAll = function(items) {
    return angular.forEach(items, _.bind(this.add, this));
  };

  /*
   * Remove an item from the collection.
   */
  Collection.prototype.remove = function(item) {
    var existing = this.find(item);

    if (existing) {
      this.array.splice(_.indexOf(this.array, item), 1);
    };

    return item;
  };

  /*
   * Remove all items from the collection.
   */
  Collection.prototype.removeAll = function(items) {
    return angular.forEach(items, _.bind(this.remove, this));
  };

  /*
   * Reset the collection.
   */
  Collection.prototype.reset = function() {
    this.array.length = 0;
  };

  angular.module('restangularCollections', ['restangular'])

    .config(function(RestangularProvider) {
      RestangularProvider.setOnElemRestangularized(function(elem, isCollection, what, Restangular) {
        if (isCollection) {
          elem.getCollection = function() {
            return new Collection(elem);
          }
        }

        return elem;
      });
    })

    .value('RestangularCollection', Collection);

})(angular);
