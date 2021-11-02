const rp = require('request-promise');
rp("https://www.reddit.com/r/Romania/").then(html => {
    console.log(html)
})