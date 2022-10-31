const { find } = require('domutils');
const ArticleSummary = require('../../../ArticleSummary')
const WebSourcer = require('../websourcer')

const expression = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
const regex = new RegExp(expression);

function filter($, page) {
    let posts = $('article');
    console.log(`Found ${posts.length} posts`)
    return posts;
}

function transformer($, node, sorucerDetail) {
    try{
        let titleNode = $(node).find('.entry-title').first().find('a').first();
        let title = $(titleNode).text();
        let articleUrl = $(titleNode).attr('href');
        let imgNode = $(node).find('div').filter('.entry-featured-image').first().children('a').first();
        let imageUrl = ($(imgNode).attr('style') || "").match(regex);;
        
        return new ArticleSummary(
            `${sorucerDetail.url}-${title.replaceAll(' ','')}`,         //ID
            sorucerDetail.url,                                          //Source (the reddit page)
            "tinkering",                                                //CATEGORY. ToDo: infer this from content in the future
            title,                                                      //TITLE
            articleUrl,                                                 //URL
            "",                                                         //Summary
            (imageUrl.length > 0) ? imageUrl[0].replace(")", "") : "",  //Image
            "",     //Video
            ""      //iFrame
        )
    } catch (e) {
        console.error(e);
        return null;
    }
}

class ComputerWorldSorucer {
	#url = "https://hackaday.com/blog/";
    #sourcer = null;

	constructor() {
		console.log(`Created Hackaday sourcer`)
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

module.exports = ComputerWorldSorucer