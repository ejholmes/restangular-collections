/* jshint -W030 */
describe('restangularCollections', function() {
  var Collection;

  beforeEach(module('restangularCollections'));

  beforeEach(inject(function(RestangularCollection) {
    Collection = RestangularCollection;
  }));

  describe('RestangularCollection', function() {
    var restangularElem, collection;

    beforeEach(function() {
      restangularElem = {
        create: function() { },
        getList: function() { }
      };

      collection = new Collection(restangularElem);
    });

    describe('constructor', function() {
      it('sets the restangularElem attribute', function() {
        expect(collection.restangularElem).to.eq(restangularElem);
      });

      it('sets the models attribute', function() {
        expect(collection.models).to.deep.eq([]);
      });
    });

    describe('#reset', function() {
      describe('when there are models in the collection', function() {
        var model;

        beforeEach(function() {
          model = { id: 1, body: 'Foobar' };
          collection.add(model);
        });

        it('resets the models', function() {
          collection.reset();
          expect(collection.models).to.be.empty;
        });

        it('does not create a new reference', function() {
          var ref = collection.models;
          collection.reset();
          expect(collection.models).to.eq(ref);
        });
      });
    });

    describe('#create', function() {
      var model, mock, deferred;

      beforeEach(function() {
        model = { body: 'Foobar' };

        mock = sinon.mock(restangularElem);

        deferred = promise();

        restangularElem.create = function() { return deferred.promise; };
      });

      it('adds the resolved model to the collection', function() {
        collection.create(model);
        deferred.resolve(model);
        expect(collection.models).to.contain(model);
      });
    });

    describe('#destroy', function() {
      var model, deferred;

      beforeEach(function() {
        deferred = promise();

        model = { body: 'Foobar', remove: function() { return deferred.promise; } };

        collection.add(model);
      });

      it('adds the resolved model to the collection', function() {
        collection.destroy(model);
        deferred.resolve(model);
        expect(collection.models).to.not.contain(model);
      });
    });

    describe('#find', function() {
      var model;

      beforeEach(function() {
        model = { id: 1, body: 'Foobar' };
        collection.add(model);
        collection.add({ id: 2, body: 'Barfoo' });
      });

      describe('when given an integer', function() {
        it('finds the model by id', function() {
          var found = collection.find(1);
          expect(found).to.eq(model);
        });
      });

      describe('when given an object', function() {
        it('finds the model by reference', function() {
          var found = collection.find(model);
          expect(found).to.eq(model);
        });
      });

      describe('when given an object that is not in the collection', function() {
        it('returns null', function() {
          var found = collection.find({ id: 3, body: 'Whatup' });
          expect(found).to.be.undefined;
        });
      });

      describe('when given an object with a different reference, but an existing id', function() {
        it('returns the existing object', function() {
          var found = collection.find({ id: 1, body: 'Yo yo' });
          expect(found).to.eq(model);
        });
      });
    });

    describe('#at', function() {
      var model;

      beforeEach(function() {
        model = { id: 1, body: 'Foobar' };
        collection.add(model);
      });

      it('returns the model at the index', function() {
        expect(collection.at(0)).to.eq(model);
      });
    });

    describe('#add', function() {
      var model;

      beforeEach(function() {
        model = { id: 1, body: 'Foobar' };
      });

      it('adds the model to the models', function() {
        collection.add(model);
        expect(collection.models).to.contain(model);
      });

      it('increments the length', function() {
        collection.add(model);
        expect(collection.length).to.eq(1);
      });

      describe('when the model is already in the collection', function() {
        beforeEach(function() {
          collection.add(model);
        });

        it('does not add the duplicate model to the models', function() {
          collection.add(model);
          expect(collection.models.length).to.eq(1);
        });
      });

      describe('when the model is in the collection but the references do not match', function() {
        beforeEach(function() {
          collection.add(model);
          collection.add({ id: 1, body: 'Barfoo' });
        });

        it('updates the existing model', function() {
          expect(model.body).to.eq('Barfoo');
        });
      });
    });

    describe('#addAll', function() {
      var models;

      beforeEach(function() {
        models = [
          { id: 1, body: 'Foobar' },
          { id: 2, body: 'Barfoo' }
        ];
      });

      it('adds all models to the models', function() {
        collection.addAll(models);
        angular.forEach(models, function(model) {
          expect(collection.models).to.contain(model);
        });
      });

      describe('when one if the models already in the collection', function() {
        beforeEach(function() {
          collection.add(models[0]);
        });

        it('only adds the models that are not in the collection', function() {
          collection.addAll(models);
          expect(collection.models.length).to.eq(2);
        });

        it('returns the models that were provided', function() {
          var added = collection.addAll(models);
          expect(added).to.eq(models);
        });
      });
    });

    describe('#remove', function() {
      var model;

      beforeEach(function() {
        model = { id: 1, body: 'Foobar' };
      });

      describe('when the model is in the collection', function() {
        beforeEach(function() {
          collection.add(model);
        });

        it('removes the model from the collection', function() {
          collection.remove(model);
          expect(collection.models).to.not.contain(model);
        });

        it('decrements the length', function() {
          collection.remove(model);
          expect(collection.length).to.eq(0);
        });
      });
    });

    describe('#removeAll', function() {
      var models;

      beforeEach(function() {
        models = [
          { id: 1, body: 'Foobar' },
          { id: 2, body: 'Barfoo' }
        ];
      });

      describe('when the models are in the collection', function() {
        beforeEach(function() {
          collection.addAll(models);
        });

        it('removes all models from the collection', function() {
          collection.removeAll(models);
          angular.forEach(models, function(model) {
            expect(collection.models).to.not.contain(model);
          });
        });
      });
    });

    describe('#getList', function() {
      var mock, deferred, models;

      beforeEach(function() {
        models = [
          { id: 1, body: 'Foobar' },
          { id: 2, body: 'Barfoo' }
        ];

        deferred = promise();

        restangularElem.getList = function() { return deferred.promise; };

        mock = sinon.mock(restangularElem);
      });

      it('delegates to getList', function() {
        mock.expects('getList').returns(deferred.promise);
        collection.getList();
      });

      describe('when default params are present', function() {
        beforeEach(function() {
          collection.options.params = { foo: 'bar' };
        });

        it('passes default params', function() {
          mock.expects('getList').withArgs({ foo: 'bar' }).returns(deferred.promise);
          collection.getList();
        });

        it('merges supplied params', function() {
          mock.expects('getList').withArgs({ foo: 'bar', bar: 'foo' }).returns(deferred.promise);
          collection.getList({ bar: 'foo' });
        });
      });

      describe('when default params are not present', function() {
        it('passes the params', function() {
          mock.expects('getList').withArgs({ foo: 'bar' }).returns(deferred.promise);
          collection.getList({ foo: 'bar' });
        });
      });
    });

    describe('#_getList', function() {
      var mock, deferred, models;

      beforeEach(function() {
        models = [
          { id: 1, body: 'Foobar' },
          { id: 2, body: 'Barfoo' }
        ];

        deferred = promise();

        restangularElem.getList = function() { return deferred.promise; };

        mock = sinon.mock(restangularElem);
      });

      it('delegates to the restangularElem', function() {
        mock.expects('getList').withArgs(1).returns(deferred.promise);
        collection._getList(1);
      });

      it('adds all models to the collection when resolved', function() {
        collection._getList();
        deferred.resolve(models);
        angular.forEach(models, function(model) {
          expect(collection.models).to.contain(model);
        });
      });
    });
  });
});
