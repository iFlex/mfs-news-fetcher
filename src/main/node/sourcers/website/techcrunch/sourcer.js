const ArticleSummary = require('../../../ArticleSummary')
const WebSourcer = require('../websourcer')


const expression = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
const regex = new RegExp(expression);

function filter($, page) {
    //console.log(page)
    let posts = $('article');
    console.log(`Found ${posts.length} posts`)
    console.log(posts[0])
    return posts;
}

function transformer($, node, sorucerDetail) {
    try{
        let headerNode = $(node).children("header").first();
        console.log('Header Node')
        console.log(headerNode);
        let titleNode = $(headerNode).children("h2").first().children("a");
        let articleUrl = $(titleNode).attr('href');
        let summary = $(node).children("div").first().text();
        let imgNode = $(node).children("figure").first().children("picture").first().children('img');
        let imageUrl = imgNode.attr('src');
        let title = titleNode.text();
        
        return new ArticleSummary(
            `${sorucerDetail.url}-${title.replaceAll(' ','')}`,         //ID
            sorucerDetail.url,                                          //Source (the reddit page)
            "tech",                                                     //CATEGORY. ToDo: infer this from content in the future
            title,                                                      //TITLE
            articleUrl,                                                 //URL
            summary,                                                    //Summary
            imageUrl,                                                   //Image
            "",     //Video
            ""      //iFrame
        )
    } catch (e) {
        console.error(e);
        return null;
    }
}

class TechCrunchSourcer {
	#url = "https://techcrunch.com/";
    #sourcer = null;

	constructor() {
		console.log(`Created ArsTechnica sourcer`)
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

module.exports = TechCrunchSourcer