//fork from: https://github.com/hughsk/from2/blob/master/index.js
// let Readable = require('readable-stream').Readable
// let inherits = require('inherits')
// module.exports = from2
// import rs from 'readable-stream'
import { Readable } from 'stream'
import inherits from 'inherits'


// let Readable = rs.Readable

let Proto = ctor()

function toFunction(list) {
    list = list.slice()
    return function (_, cb) {
        let err = null
        let item = list.length ? list.shift() : null
        if (item instanceof Error) {
            err = item
            item = null
        }

        cb(err, item)
    }
}

function from2(opts, read) {
    if (typeof opts !== 'object' || Array.isArray(opts)) {
        read = opts
        opts = {}
    }

    let rs = new Proto(opts)
    rs._from = Array.isArray(read) ? toFunction(read) : (read || noop)
    return rs
}

function ctor(opts, read) {
    if (typeof opts === 'function') {
        read = opts
        opts = {}
    }

    opts = defaults(opts)

    inherits(Class, Readable)
    function Class(override) {
        if (!(this instanceof Class)) return new Class(override)
        this._reading = false
        this._callback = check
        this.destroyed = false
        Readable.call(this, override || opts)

        let self = this
        let hwm = this._readableState.highWaterMark

        function check(err, data) {
            if (self.destroyed) return
            if (err) return self.destroy(err)
            if (data === null) return self.push(null)
            self._reading = false
            if (self.push(data)) self._read(hwm)
        }
    }

    Class.prototype._from = read || noop
    Class.prototype._read = function(size) {
        if (this._reading || this.destroyed) return
        this._reading = true
        this._from(size, this._callback)
    }

    Class.prototype.destroy = function(err) {
        if (this.destroyed) return
        this.destroyed = true

        let self = this
        process.nextTick(function() {
            if (err) self.emit('error', err)
            self.emit('close')
        })
    }

    return Class
}

function obj(opts, read) {
    if (typeof opts === 'function' || Array.isArray(opts)) {
        read = opts
        opts = {}
    }

    opts = defaults(opts)
    opts.objectMode = true
    opts.highWaterMark = 16

    return from2(opts, read)
}

function noop () {}

function defaults(opts) {
    opts = opts || {}
    return opts
}

//add ctor, obj
from2.ctor = ctor
from2.obj = obj


export default from2
