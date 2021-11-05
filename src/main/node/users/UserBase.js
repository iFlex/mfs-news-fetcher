const fs = require('fs')
const process = require('process')
const User = require('./User')

class UserBase {
    constructor(usersPath) { 
        this.usersPath = usersPath || process.env.USERS_PATH
        this.users = {}
        this.allSources = {}

        this.init()
    }

    init() {
        let files = []
        try {
            files = fs.readdirSync(this.usersPath);
        } catch(e) {
            console.log("Couldn't parse userbase")
        }

        for(let file of files) {
            let path = this.usersPath+"/"+file
            try {
                let data = fs.readFileSync(path)
                let user = User.fromJson(data)
                this.users[user.id] = user
                this.addSourcesToSet(user.getSources())
            } catch (e) {
                console.log(`Failed to process user file: ${path} - ${e}`)
                console.trace(e)
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
 }

 module.exports = new UserBase(process.env.USER_BASE);