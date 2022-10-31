const rp = require('request-promise');
const cheerio = require('cheerio');
const Executor = require('../../utils/RateLimitedWorker')


class WebsiteSourcer {
	#url = null;
    #filter = null;
    #transformer = null;
    //10 Requests per second
    #executor = new Executor(100);
	
    constructor(url) {
		this.#url = url;
		console.log(`Created Webite Sourcer for ${this.#url}`)
	}
    
    setFilter(filter) {
        this.#filter = filter 
    }

    setArticleTransformer(transformer) {
        this.#transformer = transformer
    }

	getPosts() {
        console.log(`Fetching from web source: ${this.#url}`)
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
            console.trace(err);
            console.error(`Failed to parse webpage:(${this.#url}) - ${err}`)
        });
    }

    getUrl() {
        return this.#url;
    }
}

module.exports = WebsiteSourcer