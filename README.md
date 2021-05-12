# w-json-stream
A tool for JSON parse and stringify by stream and web worker.

![language](https://img.shields.io/badge/language-JavaScript-orange.svg) 
[![npm version](http://img.shields.io/npm/v/w-json-stream.svg?style=flat)](https://npmjs.org/package/w-json-stream) 
[![Build Status](https://travis-ci.org/yuda-lyu/w-json-stream.svg?branch=master)](https://travis-ci.org/yuda-lyu/w-json-stream) 
[![license](https://img.shields.io/npm/l/w-json-stream.svg?style=flat)](https://npmjs.org/package/w-json-stream) 
[![gzip file size](http://img.badgesize.io/yuda-lyu/w-json-stream/master/dist/w-json-stream.umd.js.svg?compression=gzip)](https://github.com/yuda-lyu/w-json-stream)
[![npm download](https://img.shields.io/npm/dt/w-json-stream.svg)](https://npmjs.org/package/w-json-stream) 
[![jsdelivr download](https://img.shields.io/jsdelivr/npm/hm/w-json-stream.svg)](https://www.jsdelivr.com/package/npm/w-json-stream)

## Documentation
To view documentation or get support, visit [docs](https://yuda-lyu.github.io/w-json-stream/global.html).

## Installation
### Using npm(ES6 module):
> **Note:** w-json-stream is mainly dependent on `from2` and `jsonparse`.
```alias
npm i w-json-stream
```

#### Example for samll data:
> **Link:** [[dev source code](https://github.com/yuda-lyu/w-json-stream/blob/master/g-small.mjs)]
```alias

async function testSmall() {

    let obj = {
        a: 123,
        b: 145.67,
        c: 'test中文1',
        d: true,
        f: [11, 'xyz', false, [166, 197, 215]],
        g: {
            ga: 223,
            gb: 245.67,
            gc: 'test中文2',
            gd: [66, 97, 115],
        },
    }
    let arr = [
        {
            a: 123,
            b: 145.67,
            c: 'test中文1',
            d: true,
        },
        {
            f: [11, 'xyz', false, [166, 197, 215]],
            g: {
                ga: 223,
                gb: 245.67,
                gc: 'test中文2',
                gd: [66, 97, 115],
            },
        },
    ]

    let jobj = await json.stringify(obj)
    console.log(jobj)
    // => {"a":123,"b":145.67,"c":"test中文1","d":true,"f":[11,"xyz",false,[166,197,215]],"g":{"ga":223,"gb":245.67,"gc":"test中文2","gd":[66,97,115]}}

    let jarr = await json.stringify(arr)
    console.log(jarr)
    // => [{"a":123,"b":145.67,"c":"test中文1","d":true},{"f":[11,"xyz",false,[166,197,215]],"g":{"ga":223,"gb":245.67,"gc":"test中文2","gd":[66,97,115]}}]

    let robj = await json.parse(jobj)
    console.log(robj)
    // => {
    //     a: 123,
    //     b: 145.67,
    //     c: 'test中文1',
    //     d: true,
    //     f: [ 11, 'xyz', false, [ 166, 197, 215 ] ],
    //     g: { ga: 223, gb: 245.67, gc: 'test中文2', gd: [ 66, 97, 115 ] }
    // }

    let rarr = await json.parse(jarr)
    console.log(rarr)
    // => [
    //     { a: 123, b: 145.67, c: 'test中文1', d: true },
    //     {
    //       f: [ 11, 'xyz', false, [Array] ],
    //       g: { ga: 223, gb: 245.67, gc: 'test中文2', gd: [Array] }
    //     }
    // ]

}
testSmall()
    .catch((err) => {
        console.log(err)
    })

```

#### Example for large data:
> **Link:** [[dev source code](https://github.com/yuda-lyu/w-json-stream/blob/master/g-large.mjs)]
```alias

async function testLarge() {

    let n = 700 //7000, 9000
    let lgRows = []
    for (let i = 1; i <= 1000; i++) {
        lgRows.push([i, 23.4, '567', 'abc', true, false, [], {}, [8, 9.01], { a: 12.34, b: 'xyz', i }])
    }
    let lgArr = []
    for (let i = 1; i <= n; i++) {
        lgArr.push({
            key: 'k' + i,
            value: {
                a: 123,
                b: 145.67,
                c: 'test中文1',
                d: true,
                f: [11, 'xyz', false, [166, 197, 215]],
                g: {
                    ga: 223,
                    gb: 245.67,
                    gc: 'test中文2',
                    gd: [66, 97, 115],
                    ge: JSON.parse(JSON.stringify(lgRows)),
                },
            }
        })
    }

    if (true) {

        try {
            let res = JSON.stringify(lgArr)
            console.log('JSON.stringify(lgArr)', res.length, res.substr(0, 200) + '...')
        }
        catch (err) {
            console.log('JSON.stringify(lgArr) catch', err)
            // n=7000 => catch RangeError: Invalid string length => Out Of Memory
            // n=9000 => FATAL ERROR: MarkCompactCollector: young object promotion failed Allocation failed - JavaScript heap out of memory
        }

    }

    if (true) {

        await json.stringify(lgArr)
            .then((res) => {
                console.log('json.stringify(lgArr) then', res.length, res.substr(0, 200) + '...')
            })
            .catch((err) => {
                console.log('json.stringify(lgArr) catch', err)
                // n=7000 => FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory
            })

    }

}
testLarge()
    .catch((err) => {
        console.log(err)
    })

```

#### Example for stream:
> **Link:** [[dev source code](https://github.com/yuda-lyu/w-json-stream/blob/master/g-stream.mjs)]
```alias

async function testStream() {

    if (true) {

        //fp
        let fp = './temp-stringify.json'

        //arr
        let n = 4000 //4000000
        let arr = []
        for (let i = 1; i <= n; i++) {
            arr.push({
                key: 'k' + i,
                value: {
                    a: 123,
                    b: 145.67,
                    c: 'test中文1',
                    d: true,
                    f: [11, 'xyz', false, [166, 197, 215]],
                    g: {
                        ga: 223,
                        gb: 245.67,
                        gc: 'test中文2',
                        gd: [66, 97, 115],
                    },
                }
            })
        }

        //createStringifyStream
        let stringifyStream = json.createStringifyStream(arr)

        //createWriteStream
        let writerStream = fs.createWriteStream(fp)

        // //pipe
        // stringifyStream.pipe(writerStream)

        //stringifyStream onData
        stringifyStream.on('data', function(chunk) {
            writerStream.write(chunk, 'UTF8')
        })

        //stringifyStream onEnd
        stringifyStream.on('end', function() {
            writerStream.end()
        })

        //writerStream onFinish
        writerStream.on('finish', function() {
            console.log('writerStream finish')
            let res = fs.readFileSync(fp, 'utf8')
            fs.unlinkSync(fp)
            console.log(res.length, res.substr(0, 200) + '...')
        })

        //writerStream onError
        writerStream.on('error', function(err) {
            console.log('writerStream error', err)
        })

    }

    if (true) {

        //fp
        let fp = './temp-write.json'

        //jarr
        let jarr = `
        [
            {
              "a": 123,
              "b": 145.67,
              "c": "test中文1",
              "d": true
            },
            {
              "f": [
                11,
                "xyz",
                false,
                [
                  null
                ]
              ],
              "g": {
                "ga": 223,
                "gb": 245.67,
                "gc": "test中文2",
                "gd": [
                  null
                ]
              }
            }
          ]
        `
        fs.writeFileSync(fp, jarr, 'utf8')

        //createReadStream
        let readerStream = fs.createReadStream(fp)

        //createParseStream
        let parseStream = json.createParseStream()

        //onData
        let res = []
        parseStream.on('data', function(chunk) {
            console.log('parseStream data chunk=', chunk)
            res.push(chunk)
        })

        //onEnd
        parseStream.on('end', function() {
            console.log('parseStream end res', res)
            fs.unlinkSync(fp)
        })

        //onError
        parseStream.on('error', function(err) {
            console.log('parseStream error', err)
        })

        //pipe
        readerStream.pipe(parseStream)

    }

}
testStream()
    .catch((err) => {
        console.log(err)
    })

```

### In a browser(UMD module):
> **Note:** w-json-stream is not dependent on any package.

[Necessary] Add script for w-json-stream.
```alias
<script src="https://cdn.jsdelivr.net/npm/w-json-stream@1.0.5/dist/w-json-stream.umd.js"></script>
```

> **stringify and parse for small data:** [ex-small.html](https://yuda-lyu.github.io/w-json-stream/examples/ex-small.html) [[source code](https://github.com/yuda-lyu/w-json-stream/blob/master/docs/examples/ex-small.html)]

> **stringifyByStream and parseByStream for small data:** [ex-small-stream.html](https://yuda-lyu.github.io/w-json-stream/examples/ex-small-stream.html) [[source code](https://github.com/yuda-lyu/w-json-stream/blob/master/docs/examples/ex-small-stream.html)]

> **stringify and parse for large data:** [ex-large.html](https://yuda-lyu.github.io/w-json-stream/examples/ex-large.html) [[source code](https://github.com/yuda-lyu/w-json-stream/blob/master/docs/examples/ex-large.html)]

> **createParseStream [Not support IE11]:** [ex-stream-createParseStream.html](https://yuda-lyu.github.io/w-json-stream/examples/ex-stream-createParseStream.html) [[source code](https://github.com/yuda-lyu/w-json-stream/blob/master/docs/examples/ex-stream-createParseStream.html)]

> **createStringifyStream [Not support IE11 and Firefox]:** [ex-stream-createStringifyStream.html](https://yuda-lyu.github.io/w-json-stream/examples/ex-stream-createStringifyStream.html) [[source code](https://github.com/yuda-lyu/w-json-stream/blob/master/docs/examples/ex-stream-createStringifyStream.html)]

> **stringify and parse for large data in web worker [Not support IE11]:** [ex-large-webworker.html](https://yuda-lyu.github.io/w-json-stream/examples/ex-large-webworker.html) [[source code](https://github.com/yuda-lyu/w-json-stream/blob/master/docs/examples/ex-large-webworker.html)]
```alias

console.log('web worker is not support IE11')

let json = window['w-json-stream']
console.log(json)

console.log('build data...')

let n = 700 //7000, 9000
let lgRows = []
for (let i = 1; i <= 1000; i++) {
    lgRows.push([i, 23.4, '567', 'abc', true, false, [], {}, [8, 9.01], { a: 12.34, b: 'xyz', i }])
}
let carr = ''
let arr = []
for (let i = 1; i <= n; i++) {
    arr.push({
        key: 'k' + i,
        value: {
            a: 123,
            b: 145.67,
            c: 'test中文1',
            d: true,
            f: [11, 'xyz', false, [166, 197, 215]],
            g: {
                ga: 223,
                gb: 245.67,
                gc: 'test中文2',
                gd: [66, 97, 115],
                ge: JSON.parse(JSON.stringify(lgRows)),
            },
        }
    })
}

console.log('build data finish')

let t=0
let timer=setInterval(function(){
    console.log('t',t/10+'(s)')
    t++
    if(t>50){
        clearInterval(timer)
    }
},100)

let pmArr = json.stringify(arr) 
    .then(function(res){
        console.log('json.stringify(arr) then',res)
        carr = res
    })
    .catch(function(err){
        console.log('json.stringify(arr) catch',err)
    })

Promise.all([pmArr])
    .then(function(){

        json.parse(carr) 
            .then(function(r){
                console.log('json.parse(carr) then',r)
            })
            .catch(function(err){
                console.log('json.parse(carr) catch',err)
            })
        
    })
    .catch(function(err){
        console.log(err)
    })

```
