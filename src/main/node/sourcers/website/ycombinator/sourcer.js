const ArticleSummary = require('../../../ArticleSummary')
const WebSourcer = require('../websourcer')
const LogFactory = require("../../../logger");
const LOGGER = LogFactory.getLogger("YCombinatorSourcer");


function filter($, page) {
    let posts = $('tr').filter('.athing');
    LOGGER.info(`Found ${posts.length} posts`)
    return posts;
}

function transformer($, node, sorucerDetail) {
    try{
        let titleNode = $(node).find('span').filter('.titleline').first();
        let linkNode = $(titleNode).find('a').first();
        let articleUrl = $(linkNode).attr('href');
        let title = $(linkNode).text();
        
        return new ArticleSummary(
            `${sorucerDetail.url}-${title.replaceAll(' ','')}`,         //ID
            sorucerDetail.url,                                          //Source (the reddit page)
            "tech",                                                     //CATEGORY. ToDo: infer this from content in the future
            title,                                                      //TITLE
            articleUrl,                                                 //URL
            "",                                                         //Summary
            "",                                                         //Image
            "",                                                         //Video
            ""                                                          //iFrame
        )
    } catch (e) {
        LOGGER.error("Failed to process candidate article node",e);
        return null;
    }
}

class YCombinatorSourcer {
	#url = "https://news.ycombinator.com";
    #sourcer = null;

	constructor() {
		LOGGER.info(`Created sourcer`)
        this.#sourcer = new WebSourcer(this.#url)
        this.#sourcer.setFilter(filter);
        this.#sourcer.setArticleTransformer(transformer);
    }

    makeId(title) {
        return `${this.#url}-${title.replaceAll(' ','')}`
    }

	getPosts() {
		return this.#sourcer.getPosts();
    }
}

module.exports = YCombinatorSourcer