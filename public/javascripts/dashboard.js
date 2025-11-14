import {
    User,
    getUser,
} from "./lib.js";

"use strict";

async function init ()
{
    const display_name = document.getElementById("display_name");
    const display_balance = document.getElementById("display_balance");

    // Get the user data
    const user = await getUser();
    console.log(user.name)
    display_name.textContent = user.name;
    display_balance.textContent = user.balance;

}

window.addEventListener("load", init );