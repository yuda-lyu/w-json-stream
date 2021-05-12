import fs from 'fs'
import json from './src/WJsonStream.mjs'
// import json from './dist/w-json-stream.umd.js'


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


//node --experimental-modules --es-module-specifier-resolution=node g.stream.mjs
