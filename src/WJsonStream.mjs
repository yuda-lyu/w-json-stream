// import intoStream from 'into-stream'
import intoStream from './intoStream.mjs' //into-stream的index.js內實際是es6的module, mocha識別js為用require讀故會報錯, 另外fork出來改寫
// import JSONStream from 'JSONStream'
import JSONStream from './JSONStream.mjs' //through內無法轉換stream, 故只好fork出來改寫, 且只改寫parse函數
// import JsonStreamStringify from 'json-stream-stringify'
// import JsonStreamStringify from 'json-stream-stringify/lib/umd.js'
// import JsonStreamStringify from 'json-stream-stringify/lib/umd.polyfill.js'
import JsonStreamStringify from './JsonStreamStringify.mjs' //json-stream-stringify需使用umd.polyfill否則會出現setImmediate is not defined, 也無法通過node polyfill修改, 另外fork出來改寫
import get from 'lodash/get'
import isNumber from 'lodash/isNumber'
import isestr from 'wsemi/src/isestr.mjs'
import isarr from 'wsemi/src/isarr.mjs'
import isobj from 'wsemi/src/isobj.mjs'
import isstr from 'wsemi/src/isstr.mjs'
import isstr0 from 'wsemi/src/isstr0.mjs'
import isundefined from 'wsemi/src/isundefined.mjs'
import genPm from 'wsemi/src/genPm.mjs'


/**
 * Promise化的JSON.parse
 *
 * @param {String} str 輸入字串
 * @return {Promise} 回傳Promise，resolve代表parse成功，回傳物件或陣列，reject代表失敗，回傳錯誤訊息
 */
async function parse(str) {

    //check
    if (!isestr(str)) {
        return {}
    }

    let r = {}
    try {
        r = JSON.parse(str)
    }
    catch (err) {
        r = {}
    }

    return r
}


/**
 * 以stream為基底的JSON.parse
 *
 * @param {String} str 輸入字串
 * @return {Promise} 回傳Promise，resolve代表parse成功，回傳物件或陣列，reject代表失敗，回傳錯誤訊息
 */
function parseByStream(str) {
    let accumulator = {}

    //check
    if (str === 'null') {
        return null
    }
    if (str === '') {
        return {}
    }

    //wrap, 因createParseStream內accumulator使用物件接收, 故外層一定為物件, 得自己包一層使parse能支援陣列
    let keyWrap = '__system__'
    let strWrap = `{"${keyWrap}":${str}}`

    //pm
    let pm = genPm()

    //sourceStream
    let sourceStream = intoStream(strWrap)

    //parseStream
    let parseStream = JSONStream.parse('$*')

    //onData
    parseStream.on('data', function(chunk) {
        // console.log('parseStream data chunk=', chunk)
        accumulator[chunk.key] = chunk.value
    })

    //onEnd
    parseStream.on('end', function() {
        // console.log('parseStream end accumulator=', accumulator)
        let res = get(accumulator, keyWrap)
        pm.resolve(res)
    })

    //onError
    parseStream.on('error', function(err) {
        pm.reject(err)
    })

    //pipe
    sourceStream.pipe(parseStream)

    return pm
}


function createParseStream() {
    //無法運行於web worker內, 因會被編譯成async function
    return JSONStream.parse('$*')
}


/**
 * Promise化的JSON.stringify
 *
 * @param {Object|Array} data 輸入物件或陣列
 * @return {Promise} 回傳Promise，resolve代表parse成功，回傳序列化字串，reject代表失敗，回傳錯誤訊息
 */
async function stringify(data) {

    //check
    if (isundefined(data)) {
        return ''
    }

    let r = ''
    try {
        r = JSON.stringify(data)
    }
    catch (err) {
        r = ''
    }

    return r
}


/**
 * 以stream為基底的JSON.stringify
 *
 * @param {Object|Array} data 輸入物件或陣列
 * @return {Promise} 回傳Promise，resolve代表parse成功，回傳序列化字串，reject代表失敗，回傳錯誤訊息
 */
function stringifyByStream(data) {
    let stringified = ''

    //check
    if (isundefined(data)) {
        return ''
    }
    if (data === null) {
        return 'null'
    }
    if (isstr0(data)) {
        return '""'
    }
    if (isNumber(data)) {
        return `${data}`
    }
    if (isstr(data)) {
        return `"${data}"`
    }

    //pm
    let pm = genPm()

    //stringifyStream
    let stringifyStream = new JsonStreamStringify(data, null, null, false)

    //onData
    stringifyStream.on('data', function(chunk) {
        stringified += chunk
    })

    //onEnd
    stringifyStream.on('end', function() {
        pm.resolve(stringified)
    })

    //onError
    stringifyStream.on('error', function(err) {
        pm.reject(err)
    })

    return pm
}


function createStringifyStream(data) {
    //無法運行於web worker內, 因會被編譯成async function

    //check
    if (!isobj(data) && !isarr(data)) {
        throw new Error('data is not object or array')
    }

    return new JsonStreamStringify(data, null, null, false)
}


/**
 * 以串流stream的JSON.stringify與JSON.parse
 *
 * See: {@link https://github.com/DonutEspresso/big-json big-json}
 *
 * @returns {Object} 回傳JONS物件，提供stringify與parse函數，兩個皆為ansyc函數
 */
let WJsonStream = {
    parse,
    parseByStream,
    createParseStream,
    stringify,
    stringifyByStream,
    createStringifyStream,
}

export default WJsonStream
