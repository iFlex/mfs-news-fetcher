const ArticleSummary = require('../../../ArticleSummary')
const WebSourcer = require('../websourcer')
const LogFactory = require("../../../logger");
const LOGGER = LogFactory.getLogger("YCombinatorSourcer");


function filter($, page) {
    let posts = $('[role=article]');
    LOGGER.info(`Found ${posts.length} posts`)
    return posts;
}

function transformer($, node, sorucerDetail) {
    try{
        let titleNode = $(node).find('h3').first();
        let summary = $(node).find('p').first().text();
        
        let title = $(titleNode).children('a').first().text();
        let imageUrl = $(node).children('div').first().find('img').first().attr('src');
        let articleUrl = $(node).attr('about');
        
        return new ArticleSummary(
            `${sorucerDetail.url}-${title.replaceAll(' ','')}`,         //ID
            sorucerDetail.url,                                          //Source (the reddit page)
            "tech-blog",                                                //CATEGORY. ToDo: infer this from content in the future
            title,                                                      //TITLE
            sorucerDetail.url + articleUrl,                             //URL
            summary,                                                    //Summary
            imageUrl,                                                   //Image
            "",                                                         //Video
            ""                                                          //iFrame
        )
    } catch (e) {
        LOGGER.error("Failed to process candidate article node",e);
        return null;
    }
}

class RedhatBlogSourcer {
	#url = "https://developers.redhat.com/blog/posts";
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

module.exports = RedhatBlogSourcer