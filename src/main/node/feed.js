const UserBase = require("./users/UserBase")
const Sourcers = require("./sourcers/sourcers")
const Notifier = require("./pushers/NodeShowPusher")

const sourcers = new Sourcers(UserBase.getAllSources())
const userIdToPrezzoId = {}
let categoryPerPrezzo = {}

function makeDailyPrezzos(onReady) {
    const users = UserBase.getUsers()
    const numUsers = users.length
    categoryPerPrezzo = {}

    let createdPrezzos = 0;
    for (const user of users) {
        console.log(`Making new prezzo for ${user.id}`)
        Notifier.makePresentation(user.id, (id) => {
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
        if ((pid in categoryPerPrezzo) && !(article.category in categoryPerPrezzo[pid])) {
            console.log(`Making category ${article.category} in prezzo ${pid}`)
            Notifier.makeCathegory(pid, article.category)
            categoryPerPrezzo[pid][article.category] = true
        }
        
        console.log(`Sending article ${article.category} to ${pid}`)
        Notifier.sendArticle(pid, article.category, article.title, article.id, article.source, article.html())
    }
}

function handleArticles(articles) {
    if(!articles || articles.length == 0) {
        console.error(`Received null article list...`)
        return;
    }

    for (const article of articles) {
        handleArticle(article)
    }
}

function userToPrezzoId(userId){
    return userIdToPrezzoId[userId]
}

let hourDelta = 1000*60*60
let lastTime = null

function processStep() {
    let nw = new Date(Date.now())
    nw.setHours(0,0,0,0)

    if (!lastTime || nw > lastTime) {
        lastTime = nw;
        makeDailyPrezzos((e) => {
            console.log(`Fetching all articles articles`)
            sourcers.fetch(handleArticles)
        })
    } else {
        console.log(`Refreshing all articles articles`)
        sourcers.fetch(handleArticles)
    }
    console.log("Snoozing for another hour")
}

processStep();
setInterval(processStep, hourDelta)