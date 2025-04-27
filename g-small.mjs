import json from './src/WJsonStream.mjs'
// import json from './dist/w-json-stream.umd.js'


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


//node g-small.mjs
