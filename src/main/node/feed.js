const UserBase = require("./users/UserBase")
const Sourcers = require("./sourcers/sourcers")
const Notifier = require("./pushers/NodeShowPusher")
const LogFactory = require("./logger");
const LOGGER = LogFactory.getLogger("feed");

const sourcers = new Sourcers(UserBase.getAllSources())
const userIdToPrezzoId = {}
let categoryPerPrezzo = {}

Notifier.setFeedbackCallback(handleUserInteractionFeedback, this);

function handleUserInteractionFeedback(data) {
    if (!data || !data.detail || data.detail.event !== 'user.click') {
        //event not applicable
        return;
    }

    if (!data.detail.id) {
        LOGGER.error(`Could not act on server feedback, missing ID of the clicked article`);
    }

    let prezzoId = data.presentationId;
    let userId = prezzoIdToUserId(prezzoId);
    let user = UserBase.getUser(userId);
    if (user) {
        user.markOpened(data.detail.id);
    }
    LOGGER.info(`feedback from server ${JSON.stringify(data)}`)
}

function prezzoIdToUserId(pid) {
    for (const [userId, prezId] of Object.entries(userIdToPrezzoId)) {
        if (prezId === pid) {
            return userId;
        }
    }
    return null;
}

function makeDailyPrezzos(onReady) {
    const users = UserBase.getUsers()
    const numUsers = users.length
    categoryPerPrezzo = {}

    let createdPrezzos = 0;
    for (const user of users) {
        LOGGER.info(`Making new prezzo for ${user.id}`)
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
    let interestedUsers = UserBase.getUsers().filter((user) => {
        return user.isInterested(article) && user.notSeen(article)
    }) 

    for (const user of interestedUsers) {
        let pid = user.getNodeShowId()
        if ((pid in categoryPerPrezzo) && !(article.category in categoryPerPrezzo[pid])) {
            LOGGER.info(`Making category ${article.category} in prezzo ${pid}`)
            Notifier.makeCathegory(pid, article.category)
            categoryPerPrezzo[pid][article.category] = true
        }
        
        LOGGER.info(`Sending article ${article.category} to ${pid}`)
        Notifier.sendArticle(pid, article.category, article.title, article.id, article.source, article.html()).then((result) =>{
            user.markSeen(article.id);
        })
    }
}

function handleArticles(articles) {
    if(!articles || articles.length == 0) {
        LOGGER.error(`Received null article list...`)
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
            LOGGER.info(`Fetching all articles articles`)
            sourcers.fetch(handleArticles)
        })
    } else {
        LOGGER.info(`Refreshing all articles articles`)
        sourcers.fetch(handleArticles)
    }
    LOGGER.info("Snoozing for another hour")
}

processStep();
setInterval(processStep, hourDelta)