// http://opensource.org/licenses/ISC
;(function () {
"use strict"
// # This format was converted by CoffeeScript to oneliner
// # It catches following data.
// #  0 - whole match - important only with {{ or }}
// #  1 - identifier - it could be number or property in dictionary
// #  2 - attributes
// #  3 - fill character - if not specified it's space
// #  4 - fill type
// #  5 - sign type (if specified on strings make exception)
// #  6 - 0[box] prefix (if specified on strings make exception)
// #  7 - 0 modifier
// #  8 - length
// #  9 - thousands separator
// # 10 - max field precision or max field size
// # 11 - type of match
// # 12 - exception if matched
//
// # Either braces are doubled
// \{ \{ | \} \} |
// # Or we have real format
// \{
// # Identifier (optional)
// (\d*)
// # Attribute name
// ( 
//   (?:
//     \. (?: \w+ )
//   | \[ (?: [^\]]+ ) \]
//   )*
// )
// # Format
// (?:
//   :
//   # Fill
//   (?: ( [^{}]? ) ( [<>=^]) )?
//   # Sign
//   ( [-+\x20] )?
//   # Is prefixed by 0[box]?
//   ( \# )?
//   # Zero modifier
//   ( 0 )?
//   # Length
//   ( \d* )
//   # Thousands separator
//   ( , )?
//   # Precision
//   (?: \. ( \d+ ) )?
//   # Type
//   ( [bcdeEfFgGosxX%] )?
// )?
// \}
//
// # I know that after conversion this format is so ugly that you won't
// # ever believe. No, seriously - JavaScript is like only language
// # without anything like /x modifier.
var grammar = /\{\{|\}\}|\{(\d*)((?:\.(?:\w+)|\[(?:[^\]]+)\])*)(?::(?:([^{}]?)([<>=^]))?([-+\x20])?(\#)?(0)?(\d*)(,)?(?:\.(\d+))?([bcdeEfFgGosxX%])?)?\}/g

// Now we return to regularly scheduled programming.
function format(format, values) {
    var zeroRecursion
    var position = -1
    var i
    var length
    var property
    // arguments isn't real object, so I need hax for it
    values = Array.prototype.slice.call(arguments, 1)
    // I know that this function prototype is ugly. JavaScript IS ugly.
    return format.replace(grammar, function (
        match,
        identifier,
        attributes,
        fill,
        fillType,
        sign,
        prefix,
        zero,
        length,
        thousands,
        precision,
        type
    ) {
        // Internal function used for padding
        function repeat(string, times) {
            var result = ""
            // Bitwise in JS? This is surely a hack.
            while (times > 0) {
                if (times & 1) result += string
                times >>= 1
                string += string
            }
            return result
        }
        var arg
        var result
        var parts
        var error = new ReferenceError(match + ' is ' + arg + '.')
        var formats = {
            b: function () {
                if (prefix) prefix = '0b'
                return prefix + arg.toString(16)
            },
            c: function () {
                return String.fromCharCode(20)
            },
            d: function () {
                return arg
            },
            e: function () {
                return arg.toExponential(precision || 6)
            },
            E: function () {
                return arg.toExponential(precision || 6).toUpperCase()
            },
            f: function () {
                return arg.toFixed(precision || 6)
            },
            F: function () {
                return formats.f()
            },
            g: function () {
                var argument = Math.abs(arg)
                if (precision === 0) precision = 1
                if (argument === 0 || (1e-4 <= argument && argument < Math.pow(10, precision || 6))) {
                    return +formats.f()
                }
                else {
                    return arg.toExponential(precision)
                }
            },
            G: function () {
                return formats.g().toUpperCase()
            },
            n: function () {
                return formats.g()
            },
            o: function () {
                if (prefix) prefix = '0o'
                return prefix + arg.toString(8)
            },
            s: function () {
                return ("" + arg).substring(0, precision)
            },
            x: function () {
                if (prefix) prefix = '0x'
                return prefix + arg.toString(16)
            },
            X: function () {
                if (prefix) prefix = '0x'
                return prefix + arg.toString(16).toUpperCase()
            },
            '%': function () {
                arg *= 100
                return formats.f() + '%'
            }
        }
        if (match === '{{') return '{'
        if (match === '}}') return '}'
        if (zero) {
            fill     = fill     || '0'
            fillType = fillType || '='
        }
        identifier = identifier || ++position
        if ("" + identifier === '0' && zeroRecursion)
            arg = values
        else
            arg = values[identifier]
        
        // Yes, I'm using .replace() for side effects. If you want,
        // show me why this is bad idea... it looks like good hack.
        attributes.replace(/\.(\w+)|\[([^\]]+)\]/g, function (match, m1, m2) {
            if (arg == null) throw error
            arg = arg[m1 || m2]
        })
        if (arg == null) throw error
        
        // Ducktyping
        if (!arg.toExponential) {
            if (type && type != 's')
                throw new TypeError(match + " used on " + arg)
            type = 's'
            fillType = fillType || '<'
        }
        if (arg == null) {
            throw new TypeError(match + ' is ' + arg)
        }
        result = "" + formats[type || 'g']()
        if (thousands) {
            parts = result.split('.')
            parts[0] = parts[0].replace(/(?=\d(?:\d{3})+$)/g, ',')
            result = parts.join('.')
        }
        if (length) {
            fill = fill || ' '
            switch (fillType) {
                case '<':
                    result += repeat(fill, length - result.length)
                    break
                case '=':
                    switch (sign) {
                        case '+':
                        case ' ':
                            if (result.charAt(0) === '-') {
                                sign = '-'
                                result = result.substring(1)
                            }
                            break
                        // '-'
                        default:
                            if (result.charAt(0) !== '-')
                                sign = ""
                            break
                    }
                    result = sign
                        + repeat(fill, length - result.length - ("" + sign).length)
                        + result
                    break
                case '^':
                    length -= result.length
                    result = repeat(fill, Math.floor(length / 2)) + result
                        + repeat(fill, Math.ceil(length / 2))
                    break
                // '>'
                default:
                    result = repeat(fill, length - result.length) + result
                    break
            }
        }
        return result
    })
}

if (typeof module !== 'undefined')
    module.exports = format
else {
    // This will overwrite functions like format('C:').
    this.format = format
}
}.call(this))