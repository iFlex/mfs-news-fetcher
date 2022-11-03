const LogFactory = require("../logger");
const LOGGER = LogFactory.getLogger("User");

class User {
    nodeShowId = null;
    id = null;
    interests = {
        "categories":[]
    };

    constructor(id, storage) {
        this.id = id
        this.storage = storage;
        this.state = this.storage.get(this.id)
        this.state['articleStatus'] = {}

        for (const source of this.state.sources) {
            //this.sources[source.url] = source
            if (source.categories) {
                this.interests["categories"] = this.interests["categories"].concat(source.categories);
            }
        }
    }
    
    setNodeShowId(id) {
        this.state.nodeShowId = id;
        this.storage.put(this.id, this.state);
    }

    getNodeShowId() {
        return this.state.nodeShowId
    }

    getSources() {
        return Object.values(this.state.sources)
    }

    //currently very crude matching of interests, no sorting
    isInterested(article) {
        if (article.source in this.state.sources) {
            return true;
        }
        if (this.interests["categories"].includes(article.category)) {
            return true;
        }
        return false;
    }

    notSeen(artId) {
        //ToDo implement persisted storage
        return !this.state.articleStatus[artId];
    }

    markSeen(artId) {
        //ToDo implement persisted storage
        LOGGER.debug(`${this.id} has seen ${artId}`)
        this.state.articleStatus[artId] = {id: artId, opened:false, rating:0}
        this.storage.put(this.id, this.state);
    }

    markOpened(artId) {
        //ToDo implement persisted storage
        LOGGER.debug(`${this.id} has open ${artId}`)
        let articleStatus = this.state.articleStatus[artId];
        if (!articleStatus) {
            articleStatus = {id: artId, opened:false, rating:0}
            this.state.articleStatus[artId] = articleStatus

            LOGGER.error(`Article ${artId} status absent for ${this.id} when trying to mark as open. Populating...`)
        }
        articleStatus.opened = true;
        this.storage.put(this.id, this.state);
    }

    static fromJson(userInfo) {
        let userData = JSON.parse(userInfo)
        return new User(userData.id, userData.sources)
    }
}

module.exports = User