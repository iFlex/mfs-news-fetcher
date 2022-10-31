const SRC = require('./sourcers/website/techcrunch/sourcer')
let sourcer = new SRC();

sourcer.getPosts().then((result) => {
    console.log(result);
})