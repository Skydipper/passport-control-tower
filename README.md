# Passport Control Cower Strategy

A Passport's strategy for applications based on [Control Tower](https://github.com/control-tower/control-tower)'s authentication.

## Installation

```bash
npm install --save passport-control-tower
```


## Usage

```js
passport.use(new ControlTowerStrategy({
  apiUrl: '[CONTROL_TOWER_API_URL]',
  callbackUrl: '[YOUR_CALLBACK_URL]'
}));
```

### Examples of use:

* [Express JS](./examples/express.js)
* [Next JS](./examples/next.js)


## Contributing

* Fork it!
* Create your feature branch: git checkout -b feature/my-new-feature
* Commit your changes: git commit -am 'Add some feature'
* Push to the branch: git push origin feature/my-new-feature
* Submit a pull request :D
