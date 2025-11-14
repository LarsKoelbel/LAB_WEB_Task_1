"use strict";

import {
    initNavigationBar,
    updateNavigationBar,
    DYNAMIC_UI_UPDATE_INTERVAL_IN_MS, getUser, getAllUsers
} from "./lib.js";

// Update the player ranking
async function updatePlayerRanking()
{
    // Get all players
    const users = await getAllUsers();

    users.sort((a, b) => b.balance - a.balance);

    // Get the list environment
    const env = document.getElementById("tr-environment-dynamic-ranking-list");

    // Grep the template
    const template = document.getElementById("tr-environment-dynamic-ranking-list__element-row-template");

    env.innerHTML = ``;
    // Create one new element per user
    let i = 1;
    users.forEach(user => {
        // Instance a new row template
        const clone = template.content.cloneNode(true);

        clone.querySelector(".tr-environment-dynamic-ranking-list__element-row-template__id").textContent = i;
        clone.querySelector(".tr-environment-dynamic-ranking-list__element-row-template__username").textContent = user.name;
        clone.querySelector(".tr-environment-dynamic-ranking-list__element-row-template__value").textContent = user.balance.toFixed(2) + " €";

        env.appendChild(clone);
        i++;
    })
}

async function init ()
{
    initNavigationBar();
    startContentLoop();

}

async function contentLoop()
{
    updateNavigationBar();
    updatePlayerRanking();
}

async function startContentLoop()
{
    setInterval(contentLoop, DYNAMIC_UI_UPDATE_INTERVAL_IN_MS);
}

window.addEventListener("load", init );