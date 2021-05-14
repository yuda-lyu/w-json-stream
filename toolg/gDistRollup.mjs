import path from 'path'
// import _ from 'lodash'
// import rollupFile from 'w-package-tools/src/rollupFile.mjs'
import rollupFiles from 'w-package-tools/src/rollupFiles.mjs'
import rollupWebWorker from 'w-package-tools/src/rollupWebWorker.mjs'
// import WJsonStream from '../src/WJsonStream.mjs'


let fdSrc = './src'
let fdTar = './dist'


async function rp() {

    await rollupFiles({ //rollupFiles預設會clean folder
        fns: ['WJsonStream.mjs', 'intoStream.mjs', 'JsonStreamStringify.mjs', 'through.mjs'],
        fdSrc,
        fdTar,
        nameDistType: 'kebabCase',
        bNodePolyfill: true,
        // bMinify: false,
        globals: {
        },
        external: [
        ],
    })
        .catch((err) => {
            console.log(err)
        })

    // await rollupFile({
    //     fn: 'webReadableStreamToNode.mjs',
    //     fdSrc,
    //     fdTar,
    //     hookNameDist: () => 'web-readable-stream-to-node',
    //     // nameDistType: 'kebabCase',
    //     bNodePolyfill: true,
    //     // bMinify: false,
    //     globals: {
    //     },
    //     external: [
    //     ],
    // })
    //     .catch((err) => {
    //         console.log(err)
    //     })

    await rollupWebWorker({
        name: 'WJsonStream', //原模組名稱, 將來會掛於winodw下
        type: 'object', //原模組輸出為物件
        funNames: ['stringify', 'parse'], //只提供stringify、parse, stringifyByStream、parseByStream太慢不實用, createParseStream,createStringifyStream不能運行於web worker內因會被編譯成async function
        // target: 'old', //不支援IE11
        bNodePolyfill: true,
        // bMinify: false,
        // bSourcemap: true, //rollupWebWorker不提供sourcemap
        execObjectFunsByInstance: true, //各函式使用獨立實體執行
        fpSrc: path.resolve(fdSrc, 'WJsonStream.mjs'), //原始檔案路徑
        fpTar: path.resolve(fdTar, 'w-json-stream.ww.umd.js'), //檔案輸出路徑
        hookNameDist: () => 'w-json-stream',
        // nameDistType: 'kebabCase',
        formatOut: 'umd', //umd為瀏覽器端直接使用, es為供vue-cli或webpack使用
        globals: {
        },
        external: [
        ],
    })
        .catch((err) => {
            console.log(err)
        })

}
rp()
    .catch((err) => {
        console.log(err)
    })
