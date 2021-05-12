import assert from 'assert'
import json from '../src/WJson.mjs'


describe(`stringify`, function() {

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
    let cobj = JSON.stringify(obj)

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
    let carr = JSON.stringify(arr)

    it(`should return '${cobj}' when json.stringify(${cobj})`, async function() {
        let r = await json.stringify(obj)
        assert.strict.deepStrictEqual(r, cobj)
    })

    it(`should return '${carr}' when json.stringify(${carr})`, async function() {
        let r = await json.stringify(arr)
        assert.strict.deepStrictEqual(r, carr)
    })

    it(`should return '[1,"3","abc"]' when input [1, '3', 'abc']`, async function() {
        let r = await json.stringify([1, '3', 'abc'])
        let rr = '[1,"3","abc"]'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '[1,"",null,null,[],{},"3","abc"]' when input [1, '', null, undefined, [], {}, '3', 'abc']`, async function() {
        let r = await json.stringify([1, '', null, undefined, [], {}, '3', 'abc'])
        let rr = '[1,"",null,null,[],{},"3","abc"]'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '{"a":12.34,"b":"abc"}' when input { a: 12.34, b: 'abc' }`, async function() {
        let r = await json.stringify({ a: 12.34, b: 'abc' })
        let rr = '{"a":12.34,"b":"abc"}'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '{"a":12.34,"b":"abc","c":"","d":null,"f":[],"g":{}}' when input { a: 12.34, b: 'abc', c: '', d: null, e: undefined, f: [], g: {} }`, async function() {
        let r = await json.stringify({ a: 12.34, b: 'abc', c: '', d: null, e: undefined, f: [], g: {} })
        let rr = '{"a":12.34,"b":"abc","c":"","d":null,"f":[],"g":{}}'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '123' when input 123`, async function() {
        let r = await json.stringify(123)
        let rr = '123'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '123.456' when input 123.456`, async function() {
        let r = await json.stringify(123.456)
        let rr = '123.456'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '"123"' when input '123'`, async function() {
        let r = await json.stringify('123')
        let rr = '"123"'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '"123.456"' when input '123.456'`, async function() {
        let r = await json.stringify('123.456')
        let rr = '"123.456"'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return 'true' when input true`, async function() {
        let r = await json.stringify(true)
        let rr = 'true'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '""' when input ''`, async function() {
        let r = await json.stringify('')
        let rr = '""'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '[]' when input []`, async function() {
        let r = await json.stringify([])
        let rr = '[]'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '{}' when input {}`, async function() {
        let r = await json.stringify({})
        let rr = '{}'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'null' when input null`, async function() {
        let r = await json.stringify(null)
        let rr = 'null'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input undefined`, async function() {
        let r = await json.stringify(undefined)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

})
