//fork from: https://github.com/dominictarr/JSONStream/blob/master/index.js
import Parser from 'jsonparse'
import { Buffer } from 'buffer'
import through from './through.mjs' //統一使用stream, 並改寫為es6, 避免重複減少打包體積


// let bufferFrom = Buffer.from && Buffer.from !== Uint8Array.from

/*
  the value of this.stack that creationix's jsonparse has is weird.
  it makes this code ugly, but his problem is way harder that mine,
  so i'll forgive him.
*/

// exports.parse = function (path, map) {
function parse(path, map) {
    let header
    let footer

    function check(x, y) {
        if (typeof x === 'string') {
            return y === x
        }
        else if (x && typeof x.exec === 'function') {
            return x.exec(y)
        }
        else if (typeof x === 'boolean' || typeof x === 'object') {
            return x
        }
        else if (typeof x === 'function') {
            return x(y)
        }
        return false
    }

    //parser
    let parser = new Parser()

    //stream
    let stream = through(
        function (chunk) {
            if (typeof chunk === 'string') {
                // console.log(`typeof chunk === 'string'`)
                //chunk = bufferFrom ? Buffer.from(chunk) : new Buffer(chunk)
                chunk = Buffer.from(chunk)
            }
            parser.write(chunk)
        },
        function (data) {
            if (data) {
                stream.write(data)
            }
            if (header) {
                stream.emit('header', header)
            }
            if (footer) {
                stream.emit('footer', footer)
            }
            stream.queue(null)
        }
    )

    if (typeof path === 'string') {
        path = path.split('.').map(function (e) {
            if (e === '$*') {
                return { emitKey: true }
            }
            else if (e === '*') {
                return true
            }
            else if (e === '') { // '..'.split('.') returns an empty string
                return { recurse: true }
            }
            else {
                return e
            }
        })
    }

    // let count = 0
    // let _key
    if (!path || !path.length) {
        path = null
    }

    parser.onValue = function (value) {
        if (!this.root) {
            stream.root = value
        }

        if (!path) return

        let i = 0 // iterates on path
        let j = 0 // iterates on stack
        let emitKey = false
        let emitPath = false
        while (i < path.length) {
            let key = path[i]
            let c
            j++

            if (key && !key.recurse) {
                c = (j === this.stack.length) ? this : this.stack[j]
                if (!c) return
                if (!check(key, c.key)) {
                    setHeaderFooter(c.key, value)
                    return
                }
                emitKey = !!key.emitKey
                emitPath = !!key.emitPath
                i++
            }
            else {
                i++
                let nextKey = path[i]
                if (!nextKey) return
                while (true) {
                    c = (j === this.stack.length) ? this : this.stack[j]
                    if (!c) return
                    if (check(nextKey, c.key)) {
                        i++
                        if (!Object.isFrozen(this.stack[j])) {
                            this.stack[j].value = null
                        }
                        break
                    }
                    else {
                        setHeaderFooter(c.key, value)
                    }
                    j++
                }
            }

        }

        // emit header
        if (header) {
            stream.emit('header', header)
            header = false
        }
        if (j !== this.stack.length) return

        // count++
        let actualPath = this.stack.slice(1).map(function(element) {
            return element.key
        }).concat([this.key])
        let data = value
        if (data != null) {
            if ((data = map ? map(data, actualPath) : data) != null) {
                if (emitKey || emitPath) {
                    data = { value: data }
                    if (emitKey) {
                        data['key'] = this.key
                    }
                    if (emitPath) {
                        data['path'] = actualPath
                    }
                }

                stream.queue(data)
            }
        }
        if (this.value) delete this.value[this.key]
        for (let k in this.stack) {
            if (!Object.isFrozen(this.stack[k])) {
                this.stack[k].value = null
            }
        }
    }
    parser._onToken = parser.onToken

    parser.onToken = function (token, value) {
        parser._onToken(token, value)
        if (this.stack.length === 0) {
            if (stream.root) {
                if (!path) {
                    stream.queue(stream.root)
                }
                // count = 0
                stream.root = null
            }
        }
    }

    parser.onError = function (err) {
        if (err.message.indexOf('at position') > -1) {
            err.message = 'Invalid JSON (' + err.message + ')'
        }
        stream.emit('error', err)
    }

    function setHeaderFooter(key, value) {
        // header has not been emitted yet
        if (header !== false) {
            header = header || {}
            header[key] = value
        }

        // footer has not been emitted yet but header has
        if (footer !== false && header === false) {
            footer = footer || {}
            footer[key] = value
        }
    }

    return stream
}

// exports.stringify = function (op, sep, cl, indent) {
//     indent = indent || 0
//     if (op === false) {
//         op = ''
//         sep = '\n'
//         cl = ''
//     }
//     else if (op == null) {

//         op = '[\n'
//         sep = '\n,\n'
//         cl = '\n]\n'

//     }

//     //else, what ever you like

//     let stream
//     let first = true
//     let anyData = false
//     stream = through(function (data) {
//         anyData = true
//         try {
//             let json = JSON.stringify(data, null, indent)
//         }
//         catch (err) {
//             return stream.emit('error', err)
//         }
//         if (first) {
//             first = false; stream.queue(op + json)
//         }
//         else stream.queue(sep + json)
//     },
//     function (data) {
//         if (!anyData) {
//             stream.queue(op)
//         }
//         stream.queue(cl)
//         stream.queue(null)
//     })

//     return stream
// }

// exports.stringifyObject = function (op, sep, cl, indent) {
//     indent = indent || 0
//     if (op === false) {
//         op = ''
//         sep = '\n'
//         cl = ''
//     }
//     else if (op == null) {

//         op = '{\n'
//         sep = '\n,\n'
//         cl = '\n}\n'

//     }

//     //else, what ever you like

//     let first = true
//     let anyData = false
//     let stream = through(function (data) {
//         anyData = true
//         let json = JSON.stringify(data[0]) + ':' + JSON.stringify(data[1], null, indent)
//         if (first) {
//             first = false; this.queue(op + json)
//         }
//         else this.queue(sep + json)
//     },
//     function (data) {
//         if (!anyData) this.queue(op)
//         this.queue(cl)

//         this.queue(null)
//     })

//     return stream
// }

let JSONStream = {
    parse,
}

export default JSONStream
