const TC = require('./sourcers/website/techcrunch/sourcer')
const CW = require('./sourcers/website/computerworld/sourcer')
const YC = require('./sourcers/website/ycombinator/sourcer')
const HD = require('./sourcers/website/hackaday/sourcer')
const SP = require('./sourcers/website/spotifyblog/sourcer')

let sourcer = new SP();

sourcer.getPosts().then((result) => {
    if (typeof result === "array") {
        console.log("array")
    }
    console.log(result);
})