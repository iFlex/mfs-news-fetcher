const process = require('process')
const User = require('./User')
const LogFactory = require("../logger");
const LOGGER = LogFactory.getLogger("UserBase");

class UserBase {
    constructor(storage) { 
        this.storage = storage
        this.users = {}
        this.allSources = {}

        this.update()
    }

    update() {
        let userPaths = this.storage.list()
        this.users = {}
        this.allSources = {}
        for (const path of userPaths) {
            try {
                let user = new User(path, this.storage)
                this.users[user.id] = user;
                this.addSourcesToSet(user.getSources())
            } catch (e) {
                LOGGER.error(`Failed to load in user ${path}`, e)
            }
        }
    }

    addSourcesToSet(sources) {
        for(const source of sources) {
            this.allSources[source.url] = source
        }
    }

    getAllSources() {
        return Object.values(this.allSources)
    }

    getUsers() {
        return Object.values(this.users)
    }

    getUser(userId) {
        if (!userId){
            return null;
        }

        return this.users[userId];
    }
 }

 module.exports = UserBase;