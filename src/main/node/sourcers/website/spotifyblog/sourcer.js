const ArticleSummary = require('../../../ArticleSummary')
const WebSourcer = require('../websourcer')
const LogFactory = require("../../../logger");
const LOGGER = LogFactory.getLogger("SpotifySourcer");


function filter($, page) {
    let posts = $('article');
    LOGGER.info(`Found ${posts.length} posts`)
    return posts;
}

function transformer($, node, sorucerDetail) {
    try{
        let headerNode = $(node).find('div').filter('.info').first();
        let titleNode = $(headerNode).find('h2').first().find('a').first();
        let imgNode = $(node).find('div').filter('.img-holder').find('img').first();
        let summaryNode = $(headerNode).find('p').first();
        
        let title = $(titleNode).text();
        let articleUrl = $(titleNode).attr('href');
        let summary = $(summaryNode).text();
        let imageUrl = $(imgNode).attr('src');
        
        return new ArticleSummary(
            `${sorucerDetail.url}-${title.replaceAll(' ','')}`,         //ID
            sorucerDetail.url,                                          //Source (the reddit page)
            "spotify",                                                     //CATEGORY. ToDo: infer this from content in the future
            title,                                                      //TITLE
            articleUrl,                                                 //URL
            summary,                                                    //Summary
            imageUrl,                                                   //Image
            "",     //Video
            ""      //iFrame
        )
    } catch (e) {
        LOGGER.error("Failed to process candidate article node",e);
        return null;
    }
}

class SpotifySourcer {
	#url = "https://engineering.atspotify.com/category/";
    #categories = ["data","security","web"] //"data-science","developer-tools","infrastructure","machine-learning","open-source","platform", "product", 
    #sourcers = {};

	constructor() {
		LOGGER.info(`Created sourcer`)
        for (const cat of this.#categories) {
            let sourcer = new WebSourcer(`${this.#url}${cat}`);
            this.#sourcers[cat] = sourcer
            sourcer.setFilter(filter);
            sourcer.setArticleTransformer(transformer);
        }
    }

    makeId(title) {
        return `${this.#url}-${title.replaceAll(' ','')}`
    }

	getPosts() {
        let promises = []
        for (const sourcer of Object.values(this.#sourcers)) {
            promises.push(sourcer.getPosts())
        }
        return Promise.all(promises).then((results) => { 
            var final = []
            for (const result of results) {
                final = final.concat(result)
            }
            return final;
        });
    }
}

module.exports = SpotifySourcer