(async () => {

    const sleep = ms => new Promise(r => setTimeout(r, ms));

    /* CHANGE 1 — added Set to double-guard duplicates */
    const users = new Map();
    const seen = new Set();

    let lastSize = 0;
    let stableRounds = 0;

    /* CHANGE 2 — slower scrolling */
    const SCROLL_DISTANCE = 600;
    const BASE_DELAY = 1600;

    while (stableRounds < 12) {

        const cells = document.querySelectorAll('[data-testid="UserCell"]');

        cells.forEach(cell => {

            const spans = Array.from(cell.querySelectorAll("span"));

            const handleSpan = spans.find(s => s.innerText.trim().startsWith("@"));
            if (!handleSpan) return;

            const username = handleSpan.innerText.replace("@", "").trim().toLowerCase();

            /* CHANGE 3 — stronger duplicate filter */
            if (!username || seen.has(username)) return;

            const nameSpan = spans.find(s => {
                const txt = s.innerText.trim();
                return txt && !txt.startsWith("@");
            });

            const name = nameSpan ? nameSpan.innerText.trim() : "";

            seen.add(username);

            users.set(username, {
                index: users.size + 1,
                username: username,
                name: name
            });

        });

        /* CHANGE 4 — smoother scroll */
        window.scrollBy({
            top: SCROLL_DISTANCE,
            behavior: "smooth"
        });

        /* CHANGE 5 — random delay (human-like) */
        const randomDelay = BASE_DELAY + Math.random() * 1200;
        await sleep(randomDelay);

        if (users.size === lastSize) stableRounds++;
        else stableRounds = 0;

        lastSize = users.size;

    }

    const result = Array.from(users.values());

    console.log("Collected followers:", result.length);

    const json = JSON.stringify(result, null, 2);

    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = String(now.getFullYear());
    a.download = `followers_${day}-${month}-${year}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);

    return result;

})();