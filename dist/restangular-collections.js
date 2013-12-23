/*! restangular-collections - v0.1.1 - 2013-12-23 */(function (angular) {
  'use strict';
  var module = angular.module('restangularCollections', ['restangular']);
  function Collection(elem, options) {
    var defaults = {
        id: 'id',
        methods: {
          create: 'create',
          destroy: 'remove'
        }
      };
    this.options = _.extend(defaults, options);
    this.restangularElem = elem;
    this.models = [];
    this.reset();
  }
  _.extend(Collection.prototype, {
    create: function (attributes) {
      var create = this.restangularElem[this.options.methods.create];
      return create(attributes).then(_.bind(this.add, this));
    },
    destroy: function (model) {
      var destroy = model[this.options.methods.destroy];
      return destroy().then(_.bind(this.remove, this));
    },
    find: function (model) {
      var id = this.options.id, find;
      if (_.isNumber(model)) {
        find = function (existing) {
          return existing[id] === model;
        };
      } else {
        find = function (existing) {
          return existing === model;
        };
      }
      return _.find(this.models, find) || model[id] && this.find(model[id]);
    },
    at: function (index) {
      return this.models[index];
    },
    add: function (model) {
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
    replace: function (existing, model) {
      angular.copy(model, existing);
    },
    addAll: function (models) {
      return angular.forEach(models, _.bind(this.add, this));
    },
    remove: function (model) {
      var existing = this.find(model);
      if (existing) {
        this.models.splice(_.indexOf(this.models, model), 1);
        this.length--;
      }
      return model;
    },
    removeAll: function (models) {
      return angular.forEach(models, _.bind(this.remove, this));
    },
    reset: function () {
      this.models.length = 0;
      this.length = 0;
    },
    getList: function (params, headers) {
      if (this.options.params) {
        params = _.defaults(this.options.params, params);
      }
      if (this.options.headers) {
        headers = _.defaults(this.options.headers, headers);
      }
      return this._getList(params, headers);
    },
    get: function (id) {
      return this._get(id);
    }
  });
  var proxyMethods = {
      getList: 'addAll',
      get: 'add'
    };
  angular.forEach(proxyMethods, function (action, method) {
    Collection.prototype['_' + method] = function () {
      return this.restangularElem[method].apply(this.restangularElem, arguments).then(_.bind(this[action], this));
    };
  });
  module.config([
    'RestangularProvider',
    function (RestangularProvider) {
      RestangularProvider.setOnElemRestangularized(function (elem, isCollection, what, Restangular) {
        if (isCollection) {
          elem.getCollection = function (options) {
            options = options || {};
            var collection = new Collection(elem, options);
            if (options.fetch) {
              return collection.getList().then(function () {
                return collection;
              });
            } else {
              return collection;
            }
          };
        }
        return elem;
      });
    }
  ]);
  module.provider('RestangularCollection', function () {
    var collectionClass = Collection;
    this.setCollectionClass = function (klass) {
      collectionClass = klass;
    };
    this.$get = function () {
      return collectionClass;
    };
  });
}(angular));