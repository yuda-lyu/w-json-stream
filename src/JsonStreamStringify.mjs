//fork from: https://github.com/Faleij/json-stream-stringify/blob/master/src/JsonStreamStringify.ts
import { Readable } from 'stream'
import { setImmediate } from 'timers'


let extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) {
            d.__proto__ = b
        }) ||
        function (d, b) {
            for (let p in b) if (b.hasOwnProperty(p)) d[p] = b[p]
        }
    return extendStatics(d, b)
}

function __extends(d, b) {
    extendStatics(d, b)
    function __() {
        this.constructor = d
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __())
}

let rxEscapable = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g
// table of character substitutions
let meta = {
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '"': '\\"',
    '\\': '\\\\'
}
function isReadableStream(value) {
    return typeof value.read === 'function' &&
        typeof value.pause === 'function' &&
        typeof value.resume === 'function' &&
        typeof value.pipe === 'function' &&
        typeof value.once === 'function' &&
        typeof value.removeListener === 'function'
}
function getType(value) {
    if (!value) {
        return Types.Primitive
    }
    if (typeof value.then === 'function') {
        return Types.Promise
    }
    if (isReadableStream(value)) {
        return value._readableState.objectMode ? Types.ReadableObject : Types.ReadableString
    }
    if (Array.isArray(value)) {
        return Types.Array
    }
    if (typeof value === 'object' || value instanceof Object) {
        return Types.Object
    }
    return Types.Primitive
}
let Types;
(function (Types) {
    Types[Types['Array'] = 0] = 'Array'
    Types[Types['Object'] = 1] = 'Object'
    Types[Types['ReadableString'] = 2] = 'ReadableString'
    Types[Types['ReadableObject'] = 3] = 'ReadableObject'
    Types[Types['Primitive'] = 4] = 'Primitive'
    Types[Types['Promise'] = 5] = 'Promise'
})(Types || (Types = {}))
let stackItemOpen = []
stackItemOpen[Types.Array] = '['
stackItemOpen[Types.Object] = '{'
stackItemOpen[Types.ReadableString] = '"'
stackItemOpen[Types.ReadableObject] = '['
let stackItemEnd = []
stackItemEnd[Types.Array] = ']'
stackItemEnd[Types.Object] = '}'
stackItemEnd[Types.ReadableString] = '"'
stackItemEnd[Types.ReadableObject] = ']'
let processFunctionLookupTable = []
for (let _i = 0, _a = Object.entries(Types); _i < _a.length; _i++) {
    let _b = _a[_i]; let key = _b[0]; let val = _b[1]
    if (typeof val === 'number') {
        processFunctionLookupTable[val] = 'process' + key
    }
}
function escapeString(string) {
    // Modified code, original code by Douglas Crockford
    // Original: https://github.com/douglascrockford/JSON-js/blob/master/json2.js
    // If the string contains no control characters, no quote characters, and no
    // backslash characters, then we can safely slap some quotes around it.
    // Otherwise we must also replace the offending characters with safe escape
    // sequences.
    return string.replace(rxEscapable, function (a) {
        let c = meta[a]
        return typeof c === 'string' ? c : '\\u' + a.charCodeAt(0).toString(16).padStart(4, '0')
    })
}
function quoteString(string) {
    return '"' + escapeString(string) + '"'
}
function readAsPromised(stream, size) {
    let value = stream.read(size)
    if (value === null) {
        return new Promise(function (resolve, reject) {
            let endListener = function () {
                return resolve(null)
            }
            stream.once('end', endListener)
            stream.once('error', reject)
            stream.once('readable', function () {
                stream.removeListener('end', endListener)
                stream.removeListener('error', reject)
                resolve(stream.read())
            })
        })
    }
    return Promise.resolve(value)
}
function recursiveResolve(promise) {
    return promise.then(function (res) {
        return getType(res) === Types.Promise ? recursiveResolve(res) : res
    })
}
let JsonStreamStringify = /** @class */ (function (_super) {
    __extends(JsonStreamStringify, _super)
    function JsonStreamStringify(value, replacer, spaces, cycle) {
        if (cycle === undefined) {
            cycle = false
        }
        let _this = _super.call(this) || this
        _this.cycle = cycle
        _this.stack = []
        _this.depth = 0
        _this.pushCalled = false
        _this.end = false
        _this.isReading = false
        _this.readMore = false
        let spaceType = typeof spaces
        if (spaceType === 'string' || spaceType === 'number') {
            _this.gap = Number.isFinite(spaces) ? ' '.repeat(spaces) : spaces
        }
        Object.assign(_this, {
            visited: cycle ? new WeakMap() : new WeakSet(),
            replacerFunction: replacer instanceof Function && replacer,
            replacerArray: Array.isArray(replacer) && replacer
        })
        if (replacer instanceof Function) {
            _this.replacerFunction = replacer
        }
        if (Array.isArray(replacer)) {
            _this.replacerArray = replacer
        }
        _this.addToStack(value)
        return _this
    }
    JsonStreamStringify.prototype.cycler = function (key, value) {
        let existingPath = this.visited.get(value)
        if (existingPath) {
            return {
                $ref: existingPath
            }
        }
        let path = this.path()
        if (key !== undefined) {
            path.push(key)
        }
        path = path.map(function (v) {
            return '[' + (Number.isInteger(v) ? v : quoteString(v)) + ']'
        })
        this.visited.set(value, path.length ? '$' + path.join('') : '$')
        return value
    }
    JsonStreamStringify.prototype.addToStack = function (value, key, index, parent) {
        let _this = this
        let _a, _b
        let realValue = value
        if (this.replacerFunction) {
            realValue = this.replacerFunction(key || index, realValue, this)
        }
        // ORDER?
        if (realValue && realValue.toJSON instanceof Function) {
            realValue = realValue.toJSON()
        }
        if (realValue instanceof Function || typeof value === 'symbol') {
            realValue = undefined
        }
        if (key !== undefined && this.replacerArray) {
            if (!this.replacerArray.includes(key)) {
                realValue = undefined
            }
        }
        let type = getType(realValue)
        if (((parent && parent.type === Types.Array) ? true : realValue !== undefined) && type !== Types.Promise) {
            if (parent && !parent.first) {
                this._push(',')
            }
            if (parent) {
                parent.first = false
            }
        }
        if (realValue !== undefined && type !== Types.Promise && key) {
            if (this.gap) {
                this._push('\n' + this.gap.repeat(this.depth) + '"' + escapeString(key) + '": ')
            }
            else {
                this._push('"' + escapeString(key) + '":')
            }
        }
        if (type !== Types.Primitive) {
            if (this.cycle) {
                // run cycler
                realValue = this.cycler(key || index, realValue)
                type = getType(realValue)
            }
            else {
                // check for circular structure
                if (this.visited.has(realValue)) {
                    throw Object.assign(new Error('Converting circular structure to JSON'), {
                        realValue: realValue,
                        key: key || index
                    })
                }
                this.visited.add(realValue)
            }
        }
        if (!key && index > -1 && this.depth && this.gap) {
            this._push('\n' + this.gap.repeat(this.depth))
        }
        let open = stackItemOpen[type]
        if (open) {
            this._push(open)
        }
        let obj = {
            key: key,
            index: index,
            type: type,
            parent: parent,
            value: realValue,
            first: true
        }
        if (type === Types.Object) {
            this.depth += 1
            obj.unread = Object.keys(realValue)
            obj.isEmpty = !obj.unread.length
        }
        else if (type === Types.Array) {
            this.depth += 1
            obj.unread = realValue.length
            obj.arrayLength = obj.unread
            obj.isEmpty = !obj.unread
        }
        else if (type === Types.ReadableString || type === Types.ReadableObject) {
            this.depth += 1
            if (realValue.readableEnded || ((_a = realValue._readableState) === null || _a === undefined ? undefined : _a.endEmitted)) {
                this.emit('error', new Error('Readable Stream has ended before it was serialized. All stream data have been lost'), realValue, key || index)
            }
            else if (realValue.readableFlowing || ((_b = realValue._readableState) === null || _b === undefined ? undefined : _b.flowing)) {
                realValue.pause()
                this.emit('error', new Error('Readable Stream is in flowing mode, data may have been lost. Trying to pause stream.'), realValue, key || index)
            }
            obj.readCount = 0
            realValue.once('end', function () {
                obj.end = true
                _this.__read()
            })
            realValue.once('error', function (err) {
                _this.error = true
                _this.emit('error', err)
            })
        }
        this.stack.unshift(obj)
        return obj
    }
    JsonStreamStringify.prototype.removeFromStack = function (item) {
        let type = item.type
        let isObject = type === Types.Object || type === Types.Array || type === Types.ReadableString || type === Types.ReadableObject
        if (type !== Types.Primitive) {
            if (!this.cycle) {
                this.visited['delete'](item.value)
            }
            if (isObject) {
                this.depth -= 1
            }
        }
        let end = stackItemEnd[type]
        if (isObject && !item.isEmpty && this.gap) {
            this._push('\n' + this.gap.repeat(this.depth))
        }
        if (end) {
            this._push(end)
        }
        let stackIndex = this.stack.indexOf(item)
        this.stack.splice(stackIndex, 1)
    }
    // tslint:disable-next-line:function-name
    JsonStreamStringify.prototype._push = function (data) {
        this.pushCalled = true
        this.push(data)
    }
    JsonStreamStringify.prototype.processReadableObject = function (current, size) {
        let _this = this
        if (current.end) {
            this.removeFromStack(current)
            return undefined
        }
        return readAsPromised(current.value, size)
            .then(function (value) {
                if (value !== null) {
                    if (!current.first) {
                        _this._push(',')
                    }
                    current.first = false
                    _this.addToStack(value, undefined, current.readCount)
                    current.readCount += 1
                }
            })
    }
    JsonStreamStringify.prototype.processObject = function (current) {
        // when no keys left, remove obj from stack
        if (!current.unread.length) {
            this.removeFromStack(current)
            return
        }
        let key = current.unread.shift()
        let value = current.value[key]
        this.addToStack(value, key, undefined, current)
    }
    JsonStreamStringify.prototype.processArray = function (current) {
        let key = current.unread
        if (!key) {
            this.removeFromStack(current)
            return
        }
        let index = current.arrayLength - key
        let value = current.value[index]
        current.unread -= 1
        this.addToStack(value, undefined, index, current)
    }
    JsonStreamStringify.prototype.processPrimitive = function (current) {
        if (current.value !== undefined) {
            let type = typeof current.value
            let value
            switch (type) {
            case 'string':
                value = quoteString(current.value)
                break
            case 'number':
                value = Number.isFinite(current.value) ? String(current.value) : 'null'
                break
            case 'boolean':
                value = String(current.value)
                break
            case 'object':
                if (!current.value) {
                    value = 'null'
                }
                break
            default:
                // This should never happen, I can't imagine a situation where this executes.
                // If you find a way, please open a ticket or PR
                throw Object.assign(new Error('Unknown type "' + type + '". Please file an issue!'), {
                    value: current.value
                })
            }
            this._push(value)
        }
        else if (this.stack[1] && (this.stack[1].type === Types.Array || this.stack[1].type === Types.ReadableObject)) {
            this._push('null')
        }
        else {
            current.addSeparatorAfterEnd = false
        }
        this.removeFromStack(current)
    }
    JsonStreamStringify.prototype.processReadableString = function (current, size) {
        let _this = this
        if (current.end) {
            this.removeFromStack(current)
            return undefined
        }
        return readAsPromised(current.value, size)
            .then(function (value) {
                if (value) {
                    _this._push(escapeString(value.toString()))
                }
            })
    }
    JsonStreamStringify.prototype.processPromise = function (current) {
        let _this = this
        return recursiveResolve(current.value).then(function (value) {
            _this.removeFromStack(current)
            _this.addToStack(value, current.key, current.index, current.parent)
        })
    }
    JsonStreamStringify.prototype.processStackTopItem = function (size) {
        let _this = this
        let current = this.stack[0]
        if (!current || this.error) {
            return Promise.resolve()
        }
        let out
        try {
            out = this[processFunctionLookupTable[current.type]](current, size)
        }
        catch (err) {
            return Promise.reject(err)
        }
        return Promise.resolve(out)
            .then(function () {
                if (_this.stack.length === 0) {
                    _this.end = true
                    _this._push(null)
                }
            })
    }
    // tslint:disable-next-line:function-name
    JsonStreamStringify.prototype.__read = function (size) {
        let _this = this
        if (this.isReading || this.error) {
            this.readMore = true
            return undefined
        }
        this.isReading = true
        // we must continue to read while push has not been called
        this.readMore = false
        return this.processStackTopItem(size)
            .then(function () {
                let readAgain = !_this.end && !_this.error && (_this.readMore || !_this.pushCalled)
                if (readAgain) {
                    setImmediate(function () {
                        _this.isReading = false
                        _this.__read()
                    })
                }
                else {
                    _this.isReading = false
                }
            })['catch'](function (err) {
                _this.error = true
                _this.emit('error', err)
            })
    }
    // tslint:disable-next-line:function-name
    JsonStreamStringify.prototype._read = function (size) {
        this.pushCalled = false
        this.__read(size)
    }
    JsonStreamStringify.prototype.path = function () {
        return this.stack.map(function (_a) {
            let key = _a.key; let index = _a.index
            return key || index
        }).filter(function (v) {
            return v || v > -1
        }).reverse()
    }
    return JsonStreamStringify
}(Readable))

export default JsonStreamStringify
