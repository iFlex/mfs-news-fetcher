const rp = require('request-promise');
const cheerio = require('cheerio');
const Executor = require('../../utils/RateLimitedWorker')
const LogFactory = require("../../logger");
const LOGGER = LogFactory.getLogger("WebSourcer");

class WebsiteSourcer {
	#url = null;
    #filter = null;
    #transformer = null;
    //10 Requests per second
    #executor = new Executor(100);
	
    constructor(url) {
		this.#url = url;
		LOGGER.info(`Created Webite Sourcer for ${this.#url}`)
	}
    
    setFilter(filter) {
        this.#filter = filter 
    }

    setArticleTransformer(transformer) {
        this.#transformer = transformer
    }

	getPosts() {
        LOGGER.info(`Fetching from web source: ${this.#url}`)
		return this.#executor.submit(
            function() { 
                return rp(this.#url);
            },
            this
        ).then(html => {
            const $ = cheerio.load(html)
            const posts = this.#filter.apply(this, [$, html])
            let list = []

            let index = 0
            while(posts[index]) {
                let post = posts[index]
                let article = this.#transformer.apply(this, [$, post, {url: this.#url}])
                if (article) {
                    list.push(article)
                }
                index++;
            }
            return list
        })
        .catch(function(err) {
            LOGGER.error(`Failed to parse webpage:(${this.#url}) - ${err}`, err)
        });
    }

    getUrl() {
        return this.#url;
    }
}

module.exports = WebsiteSourcer