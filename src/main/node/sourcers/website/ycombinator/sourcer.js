const ArticleSummary = require('../../../ArticleSummary')
const WebSourcer = require('../websourcer')


function filter($, page) {
    let posts = $('tr').filter('.athing');
    console.log(`Found ${posts.length} posts`)
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
        console.error(e);
        return null;
    }
}

class ComputerWorldSorucer {
	#url = "https://news.ycombinator.com";
    #sourcer = null;

	constructor() {
		console.log(`Created Hackernews sourcer`)
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