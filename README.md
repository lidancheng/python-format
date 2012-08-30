[![Build Status](https://secure.travis-ci.org/GlitchMr/python-format.png?branch=master)](http://travis-ci.org/GlitchMr/python-format) 

`python-format` is implementation of Python's `str.format()`. It works
both in browser and in Node.js. If you want to use this in Node.js,
just type `npm install python-format` in console.

```javascript
var format = require('python-format')
console.log(format('My nick is {0}.', 'GlitchMr'))
```

If you want to use this in browser, download
[python-format.js](https://raw.github.com/GlitchMr/python-format/master/lib/python-format.js),
if you want, pass it using your favorite JavaScript minifizer (I prefer
[UglifyJS](http://marijnhaverbeke.nl/uglifyjs), but you can use other
minifizers).

For more details see http://docs.python.org/py3k/library/stdtypes.html#str.format.