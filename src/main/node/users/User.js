const LogFactory = require("../logger");
const LOGGER = LogFactory.getLogger("User");

class User {
    nodeShowId = null;
    id = null;
    sources = {}
    articleStatus = {}
    interests = {
        "categories":[]
    };

    constructor(id, sources) {
        this.id = id
        for (const source of sources) {
            this.sources[source.url] = source
            if (source.categories) {
                this.interests["categories"] = this.interests["categories"].concat(source.categories);
            }
        }
    }

    setNodeShowId(id) {
        this.nodeShowId = id
    }

    getNodeShowId() {
        return this.nodeShowId
    }

    getSources() {
        return Object.values(this.sources)
    }

    //currently very crude matching of interests, no sorting
    isInterested(article) {
        if (article.source in this.sources) {
            return true;
        }
        if (this.interests["categories"].includes(article.category)) {
            return true;
        }
        return false;
    }

    notSeen(artId) {
        //ToDo implement persisted storage
        return !this.articleStatus[artId];
    }

    markSeen(artId) {
        //ToDo implement persisted storage
        LOGGER.debug(`${this.id} has seen ${artId}`)
        this.articleStatus[artId] = {id: artId, opened:false, rating:0}
    }

    markOpened(artId) {
        //ToDo implement persisted storage
        LOGGER.debug(`${this.id} has open ${artId}`)
        let articleStatus = this.articleStatus[artId];
        if (!articleStatus) {
            articleStatus = {id: artId, opened:false, rating:0}
            this.articleStatus[artId] = articleStatus

            LOGGER.error(`Article ${artId} status absent for ${this.id} when trying to mark as open. Populating...`)
        }
        articleStatus.opened = true;
    }

    static fromJson(userInfo) {
        let userData = JSON.parse(userInfo)
        return new User(userData.id, userData.sources)
    }
}

module.exports = User