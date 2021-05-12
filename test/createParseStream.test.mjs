import fs from 'fs'
import assert from 'assert'
import genPm from 'wsemi/src/genPm.mjs'
import json from '../src/WJson.mjs'


describe(`createParseStream`, function() {

    async function test() {
        let pm = genPm()

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
            pm.resolve(res)
        })

        //onError
        parseStream.on('error', function(err) {
            console.log('parseStream error', err)
            fs.unlinkSync(fp)
        })

        //pipe
        readerStream.pipe(parseStream)

        return pm
    }

    let res = [
        { 'value': { 'a': 123, 'b': 145.67, 'c': 'test中文1', 'd': true }, 'key': 0 },
        { 'value': { 'f': [11, 'xyz', false, [null]], 'g': { 'ga': 223, 'gb': 245.67, 'gc': 'test中文2', 'gd': [null] } }, 'key': 1 }
    ]
    it(`should return ${res} when run test`, async function() {
        let r = await test()
        assert.strict.deepStrictEqual(r, res)
    })

})
