# w-json-stream
A tool for JSON parse and stringify by stream and web worker.

![language](https://img.shields.io/badge/language-JavaScript-orange.svg) 
[![npm version](http://img.shields.io/npm/v/w-json-stream.svg?style=flat)](https://npmjs.org/package/w-json-stream) 
[![license](https://img.shields.io/npm/l/w-json-stream.svg?style=flat)](https://npmjs.org/package/w-json-stream) 
[![npm download](https://img.shields.io/npm/dt/w-json-stream.svg)](https://npmjs.org/package/w-json-stream) 
[![npm download](https://img.shields.io/npm/dm/w-json-stream.svg)](https://npmjs.org/package/w-json-stream)
[![jsdelivr download](https://img.shields.io/jsdelivr/npm/hm/w-json-stream.svg)](https://www.jsdelivr.com/package/npm/w-json-stream)

## Statement

This project is based on modifications and integrations of the following open-source projects:

- Forked from [into-stream](https://github.com/sindresorhus/into-stream) by sindresorhus
- Forked from [from2](https://github.com/hughsk/from2) by hughsk
- Forked from [JSONStream](https://github.com/dominictarr/JSONStream) by dominictarr
- Forked from [through](https://github.com/dominictarr/through) by dominictarr
- Forked from [json-stream-stringify](https://github.com/Faleij/json-stream-stringify) by Faleij

The original projects are licensed under the MIT License, and this project is also distributed under the MIT License.

Special thanks to the original authors for their outstanding contributions — without their work, this project would not exist. 🙏

## Documentation
To view documentation or get support, visit [docs](https://yuda-lyu.github.io/w-json-stream/global.html).

## Installation
### Using npm(ES6 module):
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
            console.log('JSON.stringify(lgArr)', res.length, res.slice(0, 200) + '...')
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
                console.log('json.stringify(lgArr) then', res.length, res.slice(0, 200) + '...')
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

    async function testStringify() {
        return new Promise((resolve, reject) => {

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
                console.log('res.length', res.length)
                console.log('res', res.slice(0, 200) + '...')
                resolve()
            })

            //writerStream onError
            writerStream.on('error', function(err) {
                console.log('writerStream error', err)
            })

        })
    }

    async function testStringifys() {
        await testStringify()
        // writerStream finish
        // res.length 646894
        // res [{"key":"k1","value":{"a":123,"b":145.67,"c":"test中文1","d":true,"f":[11,"xyz",false,[166,197,215]],"g":{"ga":223,"gb":245.67,"gc":"test中文2","gd":[66,97,115]}}},{"key":"k2","value":{"a":123,"b":145.67,...
    }

    console.log('testStringify...')
    await testStringifys()
        .catch((err) => {
            console.log(err)
        })

    async function testParse(pre, filter) {
        return new Promise((resolve, reject) => {

            //fp
            let fp = './temp-write.json'

            //arr
            let arr = [
                {
                    key: 'k1',
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
                    },
                },
                {
                    child: [
                        { name: 'child:abc', labels: ['child:label-abc'] },
                        { name: 'child:def', labels: ['child:label-def'] },
                        true,
                        false,
                        2020,
                        {
                            name: 'child:xyz',
                            query: {
                                labels: ['child:query:label-xyz']
                            }
                        },
                    ],
                },
                { name: 'abc', labels: ['label-abc'] },
                { name: 'def', labels: ['label-def'] },
                true,
                false,
                -1,
                {
                    name: 'xyz',
                    query: {
                        labels: ['query:label-xyz']
                    }
                },
            ]

            //jarr
            let jarr = JSON.stringify(arr)

            //writeFileSync
            fs.writeFileSync(fp, jarr, 'utf8')

            //createReadStream
            let readerStream = fs.createReadStream(fp)

            //createParseStream
            let parseStream = json.createParseStream(filter)

            //onData
            let res = []
            parseStream.on('data', function(chunk) {
                console.log(pre, 'parseStream data chunk=', chunk)
                res.push(chunk)
            })

            //onEnd
            parseStream.on('end', function() {
                console.log(pre, 'parseStream end res', res)
                fs.unlinkSync(fp)
                resolve()
            })

            //onError
            parseStream.on('error', function(err) {
                console.log(pre, 'parseStream error', err)
            })

            //pipe
            readerStream.pipe(parseStream)

        })
    }

    async function testParses() {

        let filter

        filter = '' //default
        console.log('test0', filter)
        await testParse('test0', filter)
        // test0
        // test0 parseStream data chunk= {
        //   value: {
        //     key: 'k1',
        //     value: {
        //       a: 123,
        //       b: 145.67,
        //       c: 'test中文1',
        //       d: true,
        //       f: [Array],
        //       g: [Object]
        //     }
        //   },
        //   key: 0
        // }
        // test0 parseStream data chunk= {
        //   value: { child: [ [Object], [Object], true, false, 2020, [Object] ] },
        //   key: 1
        // }
        // test0 parseStream data chunk= { value: { name: 'abc', labels: [ 'label-abc' ] }, key: 2 }
        // test0 parseStream data chunk= { value: { name: 'def', labels: [ 'label-def' ] }, key: 3 }
        // test0 parseStream data chunk= { value: true, key: 4 }
        // test0 parseStream data chunk= { value: false, key: 5 }
        // test0 parseStream data chunk= { value: -1, key: 6 }
        // test0 parseStream data chunk= { value: { name: 'xyz', query: { labels: [Array] } }, key: 7 }
        // test0 parseStream end res [
        //   { value: { key: 'k1', value: [Object] }, key: 0 },
        //   { value: { child: [Array] }, key: 1 },
        //   { value: { name: 'abc', labels: [Array] }, key: 2 },
        //   { value: { name: 'def', labels: [Array] }, key: 3 },
        //   { value: true, key: 4 },
        //   { value: false, key: 5 },
        //   { value: -1, key: 6 },
        //   { value: { name: 'xyz', query: [Object] }, key: 7 }
        // ]

        filter = '*.labels' //無emit, 只能監聽onData個別處理
        console.log('test1', filter)
        await testParse('test1', filter)
        // test1 *.labels
        // test1 parseStream data chunk= [ 'label-abc' ]
        // test1 parseStream data chunk= [ 'label-def' ]
        // test1 parseStream end res [ [ 'label-abc' ], [ 'label-def' ] ]

        filter = [true, 'labels', { emitPath: true }]
        console.log('test2', filter, 'true=*, 開啟emitPath才能塞回物件取得過濾後結果')
        await testParse('test2', filter)
        // test2 [ true, 'labels', { emitPath: true } ] true=*, 開啟emitPath才能塞回物件取得過濾後結果
        // test2 parseStream data chunk= { value: 'label-abc', path: [ 2, 'labels', 0 ] }
        // test2 parseStream data chunk= { value: 'label-def', path: [ 3, 'labels', 0 ] }
        // test2 parseStream end res [
        //   { value: 'label-abc', path: [ 2, 'labels', 0 ] },
        //   { value: 'label-def', path: [ 3, 'labels', 0 ] }
        // ]

        filter = [{ recurse: true }, 'labels', { emitPath: true }]
        console.log('test3', filter, '開啟recurse代表為任意子節點, 開啟emitPath才能塞回物件取得過濾後結果')
        await testParse('test3', filter)
        // test3 [ { recurse: true }, 'labels', { emitPath: true } ] 開啟recurse代表為任意子節點, 開啟emitPath才能塞回物件取得過濾後結果
        // test3 parseStream data chunk= { value: 'child:label-abc', path: [ 1, 'child', 0, 'labels', 0 ] }
        // test3 parseStream data chunk= { value: 'child:label-def', path: [ 1, 'child', 1, 'labels', 0 ] }
        // test3 parseStream data chunk= {
        // value: 'child:query:label-xyz',
        // path: [ 1, 'child', 5, 'query', 'labels', 0 ]
        // }
        // test3 parseStream data chunk= { value: 'label-abc', path: [ 2, 'labels', 0 ] }
        // test3 parseStream data chunk= { value: 'label-def', path: [ 3, 'labels', 0 ] }
        // test3 parseStream data chunk= { value: 'query:label-xyz', path: [ 7, 'query', 'labels', 0 ] }
        // test3 parseStream end res [
        // { value: 'child:label-abc', path: [ 1, 'child', 0, 'labels', 0 ] },
        // { value: 'child:label-def', path: [ 1, 'child', 1, 'labels', 0 ] },
        // {
        //     value: 'child:query:label-xyz',
        //     path: [ 1, 'child', 5, 'query', 'labels', 0 ]
        // },
        // { value: 'label-abc', path: [ 2, 'labels', 0 ] },
        // { value: 'label-def', path: [ 3, 'labels', 0 ] },
        // { value: 'query:label-xyz', path: [ 7, 'query', 'labels', 0 ] }
        // ]

    }

    console.log('testParse...')
    await testParses()
        .catch((err) => {
            console.log(err)
        })

}
testStream()
    .catch((err) => {
        console.log(err)
    })

```

### In a browser(UMD module):
> **Note:** w-json-stream does not dependent on any package.

[Necessary] Add script for w-json-stream.
```alias

<!-- for basic -->
<script src="https://cdn.jsdelivr.net/npm/w-json-stream@1.0.21/dist/w-json-stream.umd.js"></script>

<!-- for web workers -->
<script src="https://cdn.jsdelivr.net/npm/w-json-stream@1.0.21/dist/w-json-stream.wk.umd.js"></script>

```

> **stringify and parse for small data:** [ex-small.html](https://yuda-lyu.github.io/w-json-stream/examples/ex-small.html) [[source code](https://github.com/yuda-lyu/w-json-stream/blob/master/docs/examples/ex-small.html)]

> **stringifyByStream and parseByStream for small data:** [ex-small-stream.html](https://yuda-lyu.github.io/w-json-stream/examples/ex-small-stream.html) [[source code](https://github.com/yuda-lyu/w-json-stream/blob/master/docs/examples/ex-small-stream.html)]

> **stringify and parse for large data:** [ex-large.html](https://yuda-lyu.github.io/w-json-stream/examples/ex-large.html) [[source code](https://github.com/yuda-lyu/w-json-stream/blob/master/docs/examples/ex-large.html)]

> **createParseStream:** [ex-stream-createParseStream.html](https://yuda-lyu.github.io/w-json-stream/examples/ex-stream-createParseStream.html) [[source code](https://github.com/yuda-lyu/w-json-stream/blob/master/docs/examples/ex-stream-createParseStream.html)] * ReadableStream does not support IE11.

> **createParseStream with filter:** [ex-stream-createParseStreamWithFilter.html](https://yuda-lyu.github.io/w-json-stream/examples/ex-stream-createParseStreamWithFilter.html) [[source code](https://github.com/yuda-lyu/w-json-stream/blob/master/docs/examples/ex-stream-createParseStreamWithFilter.html)]

> **createStringifyStream:** [ex-stream-createStringifyStream.html](https://yuda-lyu.github.io/w-json-stream/examples/ex-stream-createStringifyStream.html) [[source code](https://github.com/yuda-lyu/w-json-stream/blob/master/docs/examples/ex-stream-createStringifyStream.html)] * WritableStream does not support IE11 and Firefox.

> **stringify and parse for large data in web worker:** [ex-large-webworker.html](https://yuda-lyu.github.io/w-json-stream/examples/ex-large-webworker.html) [[source code](https://github.com/yuda-lyu/w-json-stream/blob/master/docs/examples/ex-large-webworker.html)] * WebWorkers(from blob) does not support IE11.
```alias

console.log('WebWorkers(from blob) does not support IE11')

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
