## Restangular Collections

This is a small extension to restangular that adds a `getCollection()` function
to restangularized routes.

### Usage

```js
controller: 'PostsCtrl',
resolve: {
  posts: function (api) {
    api.all('posts').getCollection();
  }
}
```

```js
function PostsCtrl (posts) {
  // Create a new post:
  // Same as api.all('posts').post(body: "Foobar"), except once the promise is
  // resolved. The new post will be added to the posts collection.
  posts.create(body: "Foobar");


  // Destroy an existing post:
  posts.destroy(1)

  // Update a post:
  posts.update
}
```
