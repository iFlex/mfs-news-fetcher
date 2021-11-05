const UserBase = require("./users/UserBase")
const Sourcers = require("./sourcers/sourcers")
const Notifier = require("./notifier")
const HttpServer = require("./HttpServer")

const sourcers = new Sourcers(UserBase.getAllSources())
const httpServer = new HttpServer(userToPrezzoId)
const userIdToPrezzoId = {}
let categoryPerPrezzo = {}

function makeDailyPrezzos(onReady) {
    const users = UserBase.getUsers()
    const numUsers = users.length
    categoryPerPrezzo = {}

    let createdPrezzos = 0;
    for (const user of users) {
        console.log(`Making new prezzo for ${user.id}`)
        Notifier.makePresentation((id) => {
            if(id) {
                user.setNodeShowId(id)
                userIdToPrezzoId[user.id] = id
                categoryPerPrezzo[id] = {}
            }

            createdPrezzos++;
            if(createdPrezzos == numUsers) {
                onReady.apply()
            }
        })
    }
}


function handleArticle(article){
    let pids = {}
    for( const user of UserBase.getUsers()) {
        if (user.isInterested(article)) {
            pids[user.getNodeShowId()] = true
        }
    }

    for (const pid of Object.keys(pids)) {
        if (!(article.category in categoryPerPrezzo[pid])) {
            console.log(`Makling category ${article.category} in prezzo ${pid}`)
            Notifier.makeCathegory(pid, article.category)
            categoryPerPrezzo[pid][article.category] = true
        }
        
        console.log(`Sending article to ${pid}`)
        Notifier.sendArticle(pid, article.category, article.title, article.id, article.source, article.html())
    }
}

function handleArticles(articles) {
    if(!articles || articles.length == 0) {
        console.error(`Received null article list...`)
        return;
    }

    for (const article of articles){
        handleArticle(article)
    }
}

function userToPrezzoId(userId){
    return userIdToPrezzoId[userId]
}

makeDailyPrezzos((e) => {
    console.log("Fetching articles")
    sourcers.fetch(handleArticles)
})

setInterval(makeDailyPrezzos, 86400000)