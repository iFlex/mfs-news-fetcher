const fs = require('fs')
const process = require('process')
const User = require('./User')
const LogFactory = require("../logger");
const LOGGER = LogFactory.getLogger("UserBase");

class UserBase {
    constructor(usersPath) { 
        this.usersPath = usersPath
        this.users = {}
        this.allSources = {}

        this.init()
    }

    init() {
        let files = []
        try {
            files = fs.readdirSync(this.usersPath);
        } catch(e) {
            LOGGER.error("Error parsing UserBase", e)
        }

        for(let file of files) {
            let path = this.usersPath+"/"+file
            try {
                let data = fs.readFileSync(path)
                let user = User.fromJson(data)
                this.users[user.id] = user
                this.addSourcesToSet(user.getSources())
            } catch (e) {
                LOGGER.error(`Failed to process user file: ${path} - ${e}`, e)
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

 module.exports = new UserBase(process.env.USER_BASE || "../../resources/users/");