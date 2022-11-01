class User {
    nodeShowId = null;
    id = null;
    sources = {};
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

    static fromJson(userInfo) {
        let userData = JSON.parse(userInfo)
        return new User(userData.id, userData.sources)
    }
}

module.exports = User