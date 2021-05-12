import json from './src/WJson.mjs'
// import json from './dist/w-json.umd.js'


async function testLarge() {

    let n = 700 //7000, 9000
    let lgRows = []
    for (let i = 1; i <= 1000; i++) {
        lgRows.push([i, 23.4, '567', 'abc', true, false, [], {}, [8, 9.01], { a: 12.34, b: 'xyz', i }])
    }
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

    if (true) {

        try {
            let res = JSON.stringify(arr)
            console.log('JSON.stringify(arr)', res.length, res.substr(0, 200) + '...')
        }
        catch (err) {
            console.log('JSON.stringify(arr) catch', err)
            // n=7000 => catch RangeError: Invalid string length => Out Of Memory
            // n=9000 => FATAL ERROR: MarkCompactCollector: young object promotion failed Allocation failed - JavaScript heap out of memory
        }

    }

    if (true) {

        await json.stringify(arr)
            .then((res) => {
                console.log('json.stringify(arr) then', res.length, res.substr(0, 200) + '...')
            })
            .catch((err) => {
                console.log('json.stringify(arr) catch', err)
                // n=7000 => FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory
            })

    }

}
testLarge()
    .catch((err) => {
        console.log(err)
    })


//node --experimental-modules --es-module-specifier-resolution=node g.large.mjs
