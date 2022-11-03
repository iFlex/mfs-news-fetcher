const rp = require('request-promise');
const cheerio = require('cheerio');
const Executor = require('../../utils/RateLimitedWorker')
const ArticleSummary = require('../../ArticleSummary')
const LogFactory = require("../../logger");
const LOGGER = LogFactory.getLogger("RedditSourcer");

//10 Requests per second
let executor = new Executor(100);

class RedditSourcer {
    static host = "https://www.reddit.com/r/"
    #reddit = null
    #url = null
    
    static getReddit(url) {
        let s = url.substring(RedditSourcer.host.length, url.length)
        s = s.substring(0, s.indexOf('/'))
        return s;
    }

    constructor (url) {
        this.#url = url;
        this.#reddit = RedditSourcer.getReddit(url)
        
        LOGGER.info(`Created reddit sourcer for ${this.#reddit}`)
    }
    
    makeId(title) {
        return `reddit-${this.#reddit}-${title.replaceAll(' ','')}`
    }

    matchNode(node, $, criteria) {
        for (const [tag, val] of Object.entries(criteria)) {
            if (tag in node) {
                if (node[tag] != val) {
                    return false;
                }
            } else {
                if ($(node).attr(tag) != val) {
                    return false;
                }
            }
        }
        return true;
    }

    findNode(root, $, toFind, nTh) {
        let queue = [root]
        let index = 0;

        while (index < queue.length) {
            let node = queue[index]
            if (this.matchNode(node, $, toFind)) {
                if (!nTh) {
                    return node
                } else {
                    nTh--;
                }
            }
            
            if (node.children) {
                for (const child of node.children) {
                    queue.push(child)
                }
            }
            index ++;
        }

        return undefined;
    }

    findTitle (post, $) {
        let node = this.findNode(post, $, {'tagName':'h3'})
        if (node) {
            return $(node).text()
        }        
        return undefined
    }

    findUrl (post, $) {
        let node = this.findNode(post, $, {'tagName':'a','data-click-id':'body'})
        if (node) {
            return 'https://www.reddit.com' + $(node).attr('href')
        }        
        return undefined
    }

    findImg (post, $) {
        let node = this.findNode(post, $, {'tagName':'img', 'alt':'Post image'})
        if (node) {
            return $(node).attr('src')
        }        
        return undefined
    }

    getSummary(post, $) {
        let node = this.findNode(post, $, {'data-click-id':'text'})
        if (node) {
            return $(node).text()
        }        
        return undefined
    }

    getVideo(post, $) {
        let node = this.findNode(post, $, {'tagName':'video'})
        if (node) {
            return $(node).html()
        }        
        return undefined
    }

    getIframe(post, $) {
        let node = this.findNode(post, $, {'tagName':'iframe'})
        if (node) {
            return $(node).html()
        }        
        return undefined
    }

    //ToDo: should be able to categorise via content
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
            LOGGER.error(`Failed to parse reddit ${err}`, err)
            return null
        });
    }    
}

module.exports = RedditSourcer