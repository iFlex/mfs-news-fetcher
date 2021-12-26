const rp = require('request-promise');
const cheerio = require('cheerio');
const Executor = require('../../utils/RateLimitedWorker')
const ArticleSummary = require('../../ArticleSummary')

//10 Requests per second
let executor = new Executor(100);

graph = {}

class WebsiteSourcer {
	#url = null;

	constructor(url) {
		this.#url = url;
		console.log(`Created Webite sourcer for ${this.#url}`)
	}

	getPosts() {
		return executor.submit(
            function() { 
                return rp(this.#url);
            },
            this
        ).then(html => {
            const $ = cheerio.load(html)
            const posts = $('div .Post')
            let list = []

            let index = 0
            while(posts[index]) {
                let post = posts[index]
                let title = this.findTitle(post, $);
                list.push(
                    new ArticleSummary(
                        this.makeId(title),           //ID
                        this.#url,                    //Source (the reddit page)
                        this.#reddit,                 //CATEGORY. ToDo: infer this from content in the future
                        title,                        //TITLE
                        this.findUrl(post, $),        //URL
                        this.getSummary(post, $),     //Summary
                        this.findImg(post, $),        //Image
                        this.getVideo(post, $),       //Video
                        this.getIframe(post, $)       //iFrame
                    )
                );
                index++;
            }
            return list
        })
        .catch(function(err){
            console.error(`Failed to parse reddit ${err}`)
            console.trace(err);
        });
    }
}

module.exports = WebsiteSourcer