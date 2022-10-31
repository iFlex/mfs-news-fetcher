const RedditSourcer = require('./reddit/main')
const ArsSourcer = require('./website/arstechnica/sourcer')

class Sourcer {

  constructor(sources) {
    this.sources = sources
    this.sourcers = []
    
    console.log(`Creating sourcers for sources:`)
    console.log(sources)
    for (const item of Object.values(sources)) {
      if (item.type == 'reddit') {
        this.sourcers.push(new RedditSourcer(item.url))
      }
      if (item.type == 'arstechnica') {
        this.sourcers.push(new ArsSourcer())
      }
    }
  }

  fetch(callback) {
    for (const sourcer of this.sourcers) {
      console.log(sourcer)
      sourcer.getPosts().then(callback)
    }
  }
}

module.exports = Sourcer