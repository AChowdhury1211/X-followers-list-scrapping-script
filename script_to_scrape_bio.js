(async () => {

    const sleep = ms => new Promise(r => setTimeout(r, ms));

    const users = new Map();
    const seen = new Set();

    let lastSize = 0;
    let stableRounds = 0;

    const SCROLL_DISTANCE = 600;
    const BASE_DELAY = 1600;

    while (stableRounds < 12) {

        const cells = document.querySelectorAll('[data-testid="UserCell"]');

        cells.forEach(cell => {

            const spans = Array.from(cell.querySelectorAll("span"));

            const handleSpan = spans.find(span =>
                span.innerText.trim().startsWith("@")
            );

            if (!handleSpan) return;

            const username = handleSpan.innerText
                .replace("@", "")
                .trim();

            if (!username || seen.has(username.toLowerCase())) return;

            // Name
            const nameSpan = spans.find(span => {
                const txt = span.innerText.trim();
                return (
                    txt &&
                    !txt.startsWith("@") &&
                    txt !== "Follows you" &&
                    txt !== "Following"
                );
            });

            const name = nameSpan ? nameSpan.innerText.trim() : "";

            // Bio
            let bio = "";

            const autoDivs = Array.from(
                cell.querySelectorAll('div[dir="auto"]')
            );

            const candidates = autoDivs
                .map(el => el.innerText.trim())
                .filter(text => {
                    if (!text) return false;
                    if (text === name) return false;
                    if (text === `@${username}`) return false;
                    if (text === "Follows you") return false;
                    if (text === "Following") return false;
                    if (text.length < 10) return false;
                    return true;
                });

            if (candidates.length) {
                bio = candidates.sort((a, b) => b.length - a.length)[0];
            }

            // Profile URL
            let profile_url = "";

            const profileLink = cell.querySelector(
                `a[href="/${username}"]`
            );

            if (profileLink) {
                profile_url = `https://x.com/${username}`;
            }

            // Verified
            const verified =
                cell.querySelector('[data-testid="icon-verified"]') !== null;

            seen.add(username.toLowerCase());

            users.set(username.toLowerCase(), {
                username,
                name,
                bio,
                profile_url,
                verified
            });

        });

        window.scrollBy({
            top: SCROLL_DISTANCE,
            behavior: "smooth"
        });

        await sleep(BASE_DELAY + Math.random() * 1200);

        if (users.size === lastSize) {
            stableRounds++;
        } else {
            stableRounds = 0;
        }

        lastSize = users.size;

        console.log(`Collected ${users.size} profiles...`);
    }

    const result = Array.from(users.values());

    console.log(`Finished. Total profiles: ${result.length}`);

    const json = JSON.stringify(result, null, 2);

    const blob = new Blob([json], {
        type: "application/json"
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    const now = new Date();

    a.href = url;
    a.download =
        `followers_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}.json`;

    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);

    return result;

})();