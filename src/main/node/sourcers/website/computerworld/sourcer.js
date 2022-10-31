const ArticleSummary = require('../../../ArticleSummary')
const WebSourcer = require('../websourcer')


function filter($, page) {
    let posts = $('div').filter('.content-item');
    console.log(`Found ${posts.length} posts`)
    return posts;
}

function transformer($, node, sorucerDetail) {
    try{
        let headerNode = $(node).find('div .post-cont').first();
        let titleNode = $(headerNode).find('h3').first().find('a');
        let summaryNode = $(headerNode).find('h4').first();
        let figureNode = $(node).find('figure').first();
        let title = $(titleNode).text();
        let articleUrl = `${sorucerDetail.url}${$(titleNode).attr('href')}`;
        let summary = $(summaryNode).text();
        let imgNode = $(figureNode).find('img').first();
        let imageUrl = $(imgNode).attr('data-original');
        
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

class ComputerWorldSorucer {
	#url = "https://www.computerworld.com/";
    #sourcer = null;

	constructor() {
		console.log(`Created ComputerWorldSorucer sourcer`)
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