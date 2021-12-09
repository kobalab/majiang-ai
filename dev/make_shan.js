/*
 *  デュプリケート麻雀用の牌山を作る
 */
"use strict";

const fs   = require('fs');
const zlib = require('zlib');

const Majiang = require('@kobalab/majiang-core');

function rule(hongpai) {
    let n = (''+hongpai).match(/(\d)/g);
    if (! n.length) n[0] = 1;
    if (n.length < 3) n[1] = n[2] = n[0];
    return Majiang.rule({ '赤牌': { m: n[0], p: n[1], s: n[2] } });
}

function make_shan(rule, jushu) {
    let qijia = Math.floor(Math.random() * 4);
    let shan  = [];
    for (let i = 0; i < jushu; i++) {
        shan.push(new Majiang.Shan(rule)._pai);
    }
    return { qijia: qijia, shan: shan };
}

const yargs = require('yargs');
const argv = yargs
    .usage('Usage: $0 [output]')
    .option('times',   { alias: 't', default: 1000, description: 'ゲーム数' } )
    .option('hongpai', { alias: 'h', default: 1,    description: '赤牌数' } )
    .option('jushu',   { alias: 'j', default: 40,   description: '局数' } )
    .argv;

let output = argv._[0];
if (output && ! output.match(/\.json\.gz$/i)) output += '.json.gz';

let res = [];
for (let i = 0; i < argv.times; i++) {
    res.push(make_shan(rule(argv.hongpai), argv.jushu));
}

if (output)
        fs.writeFileSync(output, zlib.gzipSync(JSON.stringify(res)), 'utf-8');
else    console.log(JSON.stringify(res));
