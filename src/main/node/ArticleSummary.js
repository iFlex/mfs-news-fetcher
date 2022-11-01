class ArticleSummary {
    static SummaryMaxCharCount = 300;

    constructor (id, source, category, title, url, summary, image, video, iframe) { 
        this.id = id
        this.source = source
        this.title = title
        this.category = category
        this.url = url
        this.summary = summary
        this.img = image
        this.video = video
        this.iframe = iframe
    }

    html() {
        var html = [];
        
        if (this.url) {
            html.push(`<a href=${this.url}><h3>${this.title}</h3></a>`)
        } else {
            html.push(`<h3>${this.title}</h3>`)
        }

        if (this.summary) {
            html.push(`<p>${this.summary.slice(0, Math.min(ArticleSummary.SummaryMaxCharCount, this.summary.length))}...</p>`)
        }
        
        if (this.img) {
            html.push(`<img src="`)
            html.push(this.img)
            html.push(`"></img>`)
        }

        if (this.video) {
            html.push(this.video)
        }
        
        if (this.iframe) {
            html.push(this.iframe)
        }

        return html.join("")
    }

    toString() {
        return `[${this.category}]${this.title}\n\n${this.summary}`
    }
}

module.exports = ArticleSummary