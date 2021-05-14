import fs from 'fs'
import json from './src/WJsonStream.mjs'
// import json from './dist/w-json-stream.umd.js'


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
                console.log('res', res.substr(0, 200) + '...')
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


//node --experimental-modules --es-module-specifier-resolution=node g-stream.mjs
