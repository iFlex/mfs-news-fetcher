const FolderKeyFileStorage = require('./storage/FolderKeyValueStorage')
const UserBase = require("./users/UserBase")
const Sourcers = require("./sourcers/sourcers")
const Notifier = require("./pushers/NodeShowPusher")
const LogFactory = require("./logger");
const LOGGER = LogFactory.getLogger("feed");

const userBase = new UserBase(new FolderKeyFileStorage(process.env.USER_BASE || "../../resources/users/"));
const sourcers = new Sourcers(userBase.getAllSources())

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
    let user = userBase.getUser(userId);
    if (user) {
        user.markOpened(data.detail.id);
    }
    LOGGER.info(`feedback from server ${JSON.stringify(data)}`)
}

function prezzoIdToUserId(pid) {
    const users = userBase.getUsers()
    for (const user of users) {
        if (user.getNodeShowId() === pid) {
            return user.id;
        }
    }
    return null;
}

function makeDailyPrezzos() {
    const users = userBase.getUsers()
    
    let promises = []
    for (const user of users) {
        //ToDo make presentationExists a promise as well and chain with create conditionally
        let exists = Notifier.presentationExists(user.getNodeShowId())
        if (exists) {
            LOGGER.info(`${user.id} has existing prezzo ${user.getNodeShowId()}`)
            continue;
        }

        LOGGER.info(`Making new prezzo for ${user.id}`)
        promises.push(
            Notifier.makePresentation(user).then((result) => {
                result.user.setNodeShowId(result.pid);
            })
        );
    }

    return Promise.all(promises).catch((ignore) => null);
}


function handleArticle(article) {
    if (!article) {
        LOGGER.info('Received null article to send over...');
        return;
    }

    let interestedUsers = userBase.getUsers().filter((user) => {
        return user.isInterested(article) && user.notSeen(article.id)
    }) 

    for (const user of interestedUsers) {
        let pid = user.getNodeShowId()
        //ToDo: make category if nodeshow fails to accept article because of lack of parent category
        Notifier.makeCathegory(pid, article.category)
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

    console.log(`Handling ${articles.length} articles`)
    for (const article of articles) {
        handleArticle(article)
    }
}

function processStep() {
    LOGGER.info("Refreshing news feed...");
    
    makeDailyPrezzos().then((e) => {
        LOGGER.info(`dailyPrezzoResult: ${JSON.stringify(e)}`)
        LOGGER.info(`Fetching all articles articles`)
        sourcers.fetch(handleArticles)
    });

    LOGGER.info("Snoozing for another hour")
}

let hourDelta = 1000*60*60
setInterval(processStep, hourDelta)
processStep();