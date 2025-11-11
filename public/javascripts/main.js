// GLOBAL

const SERVER_BASE_URL = "http://localhost:3333";        // Without trailing slash!
const LOGGING = {
    verbose: true,
    warn: true,
    error: true
}
const DYNAMIC_UI_UPDATE_INTERVAL_IN_MS = 5000;

// Util

// @Jenkins start-block-remove-on-publish
// Log something to the console
const Log = Object.freeze({
    log(message)
    {
        if (LOGGING.verbose) console.log(message);
    },
    warning(message)
    {
        if (LOGGING.warn) console.log(message);
    },
    error(message)
    {
        if (LOGGING.error) console.log(message);
    }
})
// @Jenkins end-block-remove-on-publish

// Send a get request to the server
async function getRequestToServe(endpoint)
{
    Log.log(`Requesting GET ${endpoint}`);                                  // @Jenkins line-remove-on-publish
    try
    {
        const response = await fetch(SERVER_BASE_URL + endpoint)
        Log.log(`Response is ${response.ok}`);                            // @Jenkins line-remove-on-publish
        if (!response.ok)
        {
            return new ServerPacket(false, `${response.statusText} (${response.status})`, response);
        }
        return new ServerPacket(true, "", response);        // Empty message on success, might change later...
    }catch (exception)
    {
        return new ServerPacket(false, exception.message, null);
    }
}

// Classes

class User
{
    constructor(name, balance)
    {
        this.name = name;
        this.balance = balance;
    }
    get htmlRepresentation()
    {
        const element = document.createElement("p");
        element.classList.add("user");
        element.innerHTML = `${this.name} | ${this.balance}`;
        return element;
    }
}

// Container for a response form the server
class ServerPacket
{
    constructor(status, message, payload)
    {
        this.status = status;
        this.message = message;
        this.payload = payload;
    }
    get ok() {
        return this.status;
    }
}

// Error during server communication
class ServerException extends Error
{
    constructor(message, userMessage)
    {
        super(message);
        this.userMessage = userMessage;
        this.name = "ServerError";
    }
}

// Get methods

// Get the current user as a object of type user
async function getUser()
{
    // Get the user data from the server
    const packet = await getRequestToServe("/api/user");
    if(packet.ok)
    {
        const json = await packet.payload.json();
        Log.log(`User data is ${json}`);                  // @Jenkins line-remove-on-publish
        return new User(json.name, json.balance);
    }
    throw new ServerException("Unable to get user", packet.message);
}

// Get all users as a list of user objects
async function getAllUsers()
{
    // Get the user data from the server
    const packet = await getRequestToServe("/api/user/everybody");
    if(packet.ok)
    {
        const json = await packet.payload.json();
        Log.log(`User data is ${json}`);                  // @Jenkins line-remove-on-publish
        // Build list of user data
        const users = []
        json.forEach(user => users.push(new User(user.name, user.sum)));
        return users;
    }
    throw new ServerException("Unable to get user", packet.message);
}


// ########### MAIN UI ###############

// Create the current leaderboard
async function buildLeaderboard()
{
    try
    {
        const users = await getAllUsers();
        users.sort((a, b) => a.balance - b.balance);
        Log.log(`Leaderboard is ${users.length}`);              // @Jenkins line-remove-on-publish

        // Get the leaderboard div
        const env = document.getElementById("div-area-leaderboard-environment");
        // Remove all existing children
        env.innerHTML = "";                                     // TODO: Find a better way to update the list | low
        users.forEach((user) => env.appendChild(user.htmlRepresentation));

    }catch (exception)
    {
        if (exception instanceof ServerException)
        {
            alert("Failed to load leaderboard form server: " + exception.userMessage);
        }
    }
}

// Update the static fields in the main ui
// static == fields that are not expected to change at a regular interval
async function uiUpdateStatic()
{
    // Update the username
    try
    {
        const user = await getUser();

        document.getElementById("test-plain-user-name").innerText = user.name;

    }catch (exception)
    {
        if (exception instanceof ServerException)
        {
            alert("Failed to load username form server: " + exception.userMessage);
        }
    }

}

// Update the dynamic fields in the main ui
// dynamic == fields that are expected to change at a regular interval
async function uiUpdateDynamic()
{
    // Update the balance
    try
    {
        const user = await getUser();

        document.getElementById("test-plain-balance").innerText = user.balance;

    }catch (exception)
    {
        if (exception instanceof ServerException)
        {
            alert("Failed to load balance form server: " + exception.userMessage);
        }
    }

    // Update the leaderboard
    buildLeaderboard();

}

async function init()
{
    // Update all static fields on login
    uiUpdateStatic();

    // Start regular update of dynamic ui elements
    // Update rate can ba changed via global definitions
    const intervalUpdater = () =>
    {
        Log.log("### Running main ui interval update")                  // @Jenkins line-remove-on-publish
        uiUpdateDynamic();
        setTimeout(intervalUpdater, DYNAMIC_UI_UPDATE_INTERVAL_IN_MS);
    }
    intervalUpdater();
}

window.addEventListener("load", init);