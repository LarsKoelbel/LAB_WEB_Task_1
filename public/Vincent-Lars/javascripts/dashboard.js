"use strict";

import {
    initNavigationBar,
    updateNavigationBar,
    getUser,
    DYNAMIC_UI_UPDATE_INTERVAL_IN_MS,
    alertCustom
} from "./lib.js";

async function setGreetingMessage(user)
{
    user = await getUser();
    document.getElementById("greeting-message").textContent = `Willkommen zurück ${user.name}!`;
}

async function init ()
{
    initNavigationBar();
    setGreetingMessage()
    startContentLoop();

    // For testing only
    document.getElementById("restart").addEventListener("click", () => {
        window.open("./supervisor/publicapi/restart-lab-web-a-1");
    });

}

async function contentLoop()
{
    updateNavigationBar();
}

async function startContentLoop()
{
    setInterval(contentLoop, DYNAMIC_UI_UPDATE_INTERVAL_IN_MS);
}

window.addEventListener("load", init );