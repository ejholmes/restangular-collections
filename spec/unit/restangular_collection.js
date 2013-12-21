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

      it('sets the array attribute', function() {
        expect(collection.array).to.deep.eq([]);
      });
    });

    describe('#reset', function() {
      describe('when there are items in the collection', function() {
        var item;

        beforeEach(function() {
          item = { id: 1, body: 'Foobar' };
          collection.add(item);
        });

        it('resets the array', function() {
          collection.reset();
          expect(collection.array).to.be.empty;
        });

        it('does not create a new reference', function() {
          var ref = collection.array;
          collection.reset();
          expect(collection.array).to.eq(ref);
        });
      });
    });

    describe('#create', function() {
      var item, mock, deferred;

      beforeEach(function() {
        item = { body: 'Foobar' };

        mock = sinon.mock(restangularElem);

        deferred = promise();

        restangularElem.create = function() { return deferred.promise; };
      });

      it('adds the resolved item to the collection', function() {
        collection.create(item);
        deferred.resolve(item);
        expect(collection.array).to.contain(item);
      });
    });

    describe('#destroy', function() {
      var item, mock, deferred;

      beforeEach(function() {
        deferred = promise();

        item = { body: 'Foobar', remove: function() { return deferred.promise; } };

        collection.add(item);
        
        mock= sinon.mock(item);
      });

      it('destroys the item', function() {
        mock.expects('remove').returns(deferred.promise);
        collection.destroy(item);
      });

      it('removes the item from the collection', function() {
        collection.destroy(item);
        deferred.resolve(item);
        expect(collection.array.length).to.eq(0);
      });
    });

    describe('#find', function() {
      var item;

      beforeEach(function() {
        item = { id: 1, body: 'Foobar' };
        collection.add(item);
        collection.add({ id: 2, body: 'Barfoo' });
      });

      describe('when given an integer', function() {
        it('finds the item by id', function() {
          var found = collection.find(1);
          expect(found).to.eq(item);
        });
      });

      describe('when given an object', function() {
        it('finds the item by reference', function() {
          var found = collection.find(item);
          expect(found).to.eq(item);
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
          expect(found).to.eq(item);
        });
      });
    });

    describe('#add', function() {
      var item;

      beforeEach(function() {
        item = { id: 1, body: 'Foobar' };
      });

      it('adds the item to the array', function() {
        collection.add(item);
        expect(collection.array).to.contain(item);
      });

      describe('when the item is already in the collection', function() {
        beforeEach(function() {
          collection.add(item);
        });

        it('does not add the duplicate item to the array', function() {
          collection.add(item);
          expect(collection.array.length).to.eq(1);
        });
      });

      describe('when the item is in the collection but the references do not match', function() {
        beforeEach(function() {
          collection.add(item);
          collection.add({ id: 1, body: 'Barfoo' });
        });

        it('updates the existing item', function() {
          expect(item.body).to.eq('Barfoo');
        });
      });
    });

    describe('#addAll', function() {
      var items;

      beforeEach(function() {
        items = [
          { id: 1, body: 'Foobar' },
          { id: 2, body: 'Barfoo' }
        ];
      });

      it('adds all items to the array', function() {
        collection.addAll(items);
        angular.forEach(items, function(item) {
          expect(collection.array).to.contain(item);
        });
      });

      describe('when one if the items already in the collection', function() {
        beforeEach(function() {
          collection.add(items[0]);
        });

        it('only adds the items that are not in the collection', function() {
          collection.addAll(items);
          expect(collection.array.length).to.eq(2);
        });

        it('returns the items that were provided', function() {
          var added = collection.addAll(items);
          expect(added).to.eq(items);
        });
      });
    });

    describe('#remove', function() {
      var item;

      beforeEach(function() {
        item = { id: 1, body: 'Foobar' };
      });

      describe('when the item is in the collection', function() {
        beforeEach(function() {
          collection.add(item);
        });

        it('removes the item from the collection', function() {
          collection.remove(item);
          expect(collection.array).to.not.contain(item);
        });
      });
    });

    describe('#removeAll', function() {
      var items;

      beforeEach(function() {
        items = [
          { id: 1, body: 'Foobar' },
          { id: 2, body: 'Barfoo' }
        ];
      });

      describe('when the items are in the collection', function() {
        beforeEach(function() {
          collection.addAll(items);
        });

        it('removes all items from the collection', function() {
          collection.removeAll(items);
          angular.forEach(items, function(item) {
            expect(collection.array).to.not.contain(item);
          });
        });
      });
    });

    describe('#getList', function() {
      var mock, deferred, items;

      beforeEach(function() {
        items = [
          { id: 1, body: 'Foobar' },
          { id: 2, body: 'Barfoo' }
        ];

        deferred = promise();

        restangularElem.getList = function() { return deferred.promise; };

        mock = sinon.mock(restangularElem);
      });

      it('delegates to the restangularElem', function() {
        mock.expects('getList').withArgs(1).returns(deferred.promise);
        collection.getList(1);
      });

      it('adds all items to the collection when resolved', function() {
        collection.getList();
        deferred.resolve(items);
        angular.forEach(items, function(item) {
          expect(collection.array).to.contain(item);
        });
      });
    });
  });
});
