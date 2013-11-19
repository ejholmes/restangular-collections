describe('restangularCollections', function() {
  var client, Collection;

  beforeEach(module('restangularCollections'));

  beforeEach(inject(function(Restangular, RestangularCollection) {
    client = Restangular;
    Collection = RestangularCollection;
  }));

  disableHTTP(this);

  describe('config', function() {
    describe('getCollection()', function() {
      var elem, posts;

      beforeEach(function() {
        elem = client.all('posts')
        posts = elem.getCollection();
      });

      it('is a collection', function() {
        expect(posts).to.be.an.instanceof(Collection);
      });

      it('sets the restangularElem attribute', function() {
        expect(posts.restangularElem).to.eq(elem);
      })
    });
  });

  describe('RestangularCollection', function() {
    var elem, collection;

    beforeEach(function() {
      elem = sinon.stub();
      collection = new Collection(elem);
    });

    describe('constructor', function() {
      it('sets the restangularElem attribute', function() {
        expect(collection.restangularElem).to.eq(elem);
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
    });

    describe('#addAll', function() {
      var items;

      beforeEach(function() {
        items = [
          { id: 1, body: 'Foobar' },
          { id: 2, body: 'Barfoo' }
        ]
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
        ]
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
  });
})
