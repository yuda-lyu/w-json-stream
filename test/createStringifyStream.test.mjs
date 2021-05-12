import fs from 'fs'
import assert from 'assert'
import genPm from 'wsemi/src/genPm.mjs'
import json from '../src/WJson.mjs'


describe(`createStringifyStream`, function() {

    async function test() {
        let pm = genPm()

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
            // console.log(res.length, res.substr(0, 200) + '...')
            res = res.substr(0, 200) + '...'
            pm.resolve(res)
        })

        //writerStream onError
        writerStream.on('error', function(err) {
            console.log('writerStream error', err)
            fs.unlinkSync(fp)
        })

        return pm
    }

    let res = '[{"key":"k1","value":{"a":123,"b":145.67,"c":"test中文1","d":true,"f":[11,"xyz",false,[166,197,215]],"g":{"ga":223,"gb":245.67,"gc":"test中文2","gd":[66,97,115]}}},{"key":"k2","value":{"a":123,"b":145.67,...'
    it(`should return ${res} when run test`, async function() {
        let r = await test()
        assert.strict.deepStrictEqual(r, res)
    })

})
