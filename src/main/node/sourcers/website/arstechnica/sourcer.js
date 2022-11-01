const ArticleSummary = require('../../../ArticleSummary')
const WebSourcer = require('../websourcer')
const LogFactory = require("../../../logger");
const LOGGER = LogFactory.getLogger("ArsTechnica");

const expression = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
const regex = new RegExp(expression);

function filter($, page) {
    let posts = $('li').filter('.article');
    LOGGER.info(`Found ${posts.length} posts`)
    return posts
}

function transformer($, node, sorucerDetail) {
    try{
        let headerNode = $(node).children("header").first();
        let titleNode = $(headerNode).children("h2").first().children("a");
        let articleUrl = $(titleNode).attr('href');
        let summary = $(headerNode).children("p").first().text();
        let textWithImgUrl = $(node).children("figure").first().children("div").first().attr('style');
        let imageUrl = textWithImgUrl.match(regex);
        let title = titleNode.text();
        
        return new ArticleSummary(
            `${sorucerDetail.url}-${title.replaceAll(' ','')}`,         //ID
            sorucerDetail.url,                                          //Source (the reddit page)
            "tech",                                                     //CATEGORY. ToDo: infer this from content in the future
            title,                                                      //TITLE
            articleUrl,                                                 //URL
            summary,                                                    //Summary
            (imageUrl.length > 0) ? imageUrl[0].replace("');", "") : "",//Image
            "",     //Video
            ""      //iFrame
        )
    } catch (e) {
        LOGGER.error("Failed to process candidate article node",e);
        return null;
    }
}

class ArsTechnicaWebsiteSourcer {
	#url = "https://arstechnica.com/";
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

module.exports = ArsTechnicaWebsiteSourcer