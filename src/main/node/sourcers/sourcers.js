const RedditSourcer = require('./reddit/main')

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
    }
  }

  fetch(callback) {
    for (const sourcer of this.sourcers) {
      sourcer.getPosts().then(callback)
    }
  }
}

module.exports = Sourcer