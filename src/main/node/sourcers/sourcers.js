const RedditSourcer = require('./reddit/main')
const ArsTechnica = require('./website/arstechnica/sourcer')
const ComputerWorld = require('./website/computerworld/sourcer')
const YCombinator = require('./website/ycombinator/sourcer')
const Hackaday = require('./website/hackaday/sourcer')
const Spotify = require('./website/spotifyblog/sourcer')
const RedHat = require('./website/redhat/sourcer')
const TechCrunch = require('./website/techcrunch/sourcer')

const LogFactory = require("../logger");
const LOGGER = LogFactory.getLogger("Sourcers");

class Sourcer {

  constructor(sources) {
    this.sources = sources
    this.sourcers = []
    
    LOGGER.info(`Creating sourcers for sources:`)
    LOGGER.info(JSON.stringify(sources))
    for (const item of Object.values(sources)) {
      if (item.type == 'reddit') {
        this.sourcers.push(new RedditSourcer(item.url))
      }
      if (item.type == 'arstechnica') {
        this.sourcers.push(new ArsTechnica())
      }
      if (item.type == 'computerworld') {
        this.sourcers.push(new ComputerWorld())
      }
      if (item.type == 'ycombinator') {
        this.sourcers.push(new YCombinator())
      }
      if (item.type == 'hackaday') {
        this.sourcers.push(new Hackaday())
      }
      if (item.type == 'spotify') {
        this.sourcers.push(new Spotify());
      }
      if (item.type == 'redhat') {
        this.sourcers.push(new RedHat());
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