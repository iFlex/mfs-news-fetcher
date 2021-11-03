const RedditSourcer = require('./sourcers/reddit/main')
const Notifier = require('./notifier')

const sourcers = []
const sources = require('../../resources/sources.json')
for (const item of Object.values(sources)) {
    if (item.type == 'reddit') {
        sourcers.push(new RedditSourcer(item.url))
    }
}

function sendUpdatesToNodeShow(sourcers, pid) {
    const categories = {}

    for (const sourcer of sourcers) {
        sourcer.getPosts().then(function(posts) {
        for(const post of posts) {
            let category = post.category;
            //make category if it doesn't exist
            if (!(category in categories)) {
                Notifier.makeCathegory(pid, category)
                categories[category] = true
            }

            Notifier.sendArticle(pid, category, post.title, post.id, post.url, post.html())
        }
        }).catch(function(err){
            console.error(`Failed to parse sourcer ${err}`)
        });
    }
}

const http = require('http')
const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/new',
  method: 'GET'
}

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`)
  let body = ''
  res.on('data', d => {
    body += d
  })

  res.on('end', function() {
    console.log(`News presentation: ${body}`)
    sendUpdatesToNodeShow(sourcers, body)
  })
})

req.on('error', error => {
  console.error(error)
})

req.end()

