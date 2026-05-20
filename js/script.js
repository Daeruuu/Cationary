"use strict";

const form = document.getElementById("searchForm");
const input = document.getElementById("wordInput");
const status = document.getElementById("status");
const footer = document.querySelector('footer');
let definitionCardObserver = null;
let relationCardObserver = null;
let catRainTimer = null;
let catRainTimeout = null;

function getFormWord(formElement) {
    return new FormData(formElement).get("word")?.toString().trim();
}
// Helper: read "word" from a form, normalize it

function searchWord() {
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const word = getFormWord(form);
        // reads the word
        if (!word) return;
        // Stop if input is empty
        location.href = `detail.html?word=${encodeURIComponent(word)}`;
        // Redirect to detail page with word in query parameter
    });
}

function setupCatRain() {
    const catGifs = document.querySelectorAll('.CatGif');
    if (!catGifs.length) return;

    catGifs.forEach((catGif) => {
        catGif.addEventListener('click', () => {
            startCatRain();
        });
    });
}

function startCatRain() {
    const spawnCats = () => {
        const catCount = 16;

        for (let i = 0; i < catCount; i += 1) {
            const cat = document.createElement('img');
            const catNumber = Math.floor(Math.random() * 45) + 1;
            cat.src = `img/cat${catNumber}.png`;
            cat.alt = `Falling cat ${catNumber}`;
            cat.className = 'rain-cat';
            cat.style.left = `${Math.random() * 100}vw`;
            cat.style.animationDuration = `${2.8 + Math.random() * 1.8}s`;
            cat.style.animationDelay = `${Math.random() * 0.4}s`;

            document.body.appendChild(cat);

            cat.addEventListener('animationend', () => {
                cat.remove();
            });
        }
    };
    // Little easter egg: when you click the cat gif, it starts a "cat rain" animation where multiple cat images fall from the top of the screen.

    spawnCats();

    clearInterval(catRainTimer);
    clearTimeout(catRainTimeout);
    catRainTimer = setInterval(spawnCats, 450);

    catRainTimeout = window.setTimeout(() => {
        clearInterval(catRainTimer);
        catRainTimer = null;
        catRainTimeout = null;
    }, 2200);
    // Keep the rain going for a short burst after the click.
}


function setupDetailPage() {
    form?.addEventListener("submit", (e) => {
        e.preventDefault();
        const word = getFormWord(form);
        if (!word) return;
        loadWord(word);
        // loads dictionary data for typed word, typed word = inputWord
    });

    const urlWord = new URLSearchParams(location.search).get("word");
    if (urlWord) {
        if (input) input.value = urlWord;
        loadWord(urlWord);
    } else if (status) {
        status.textContent = "Please enter a word in the search field.";
    }
    // loads the word from the URL query parameter when the detail page is accessed directly.
    // If a word is provided, it sets the input field and loads the word data.
    // If no word is provided, it prompts the user to enter a word.
}



async function loadWord(inputWord) {
    const word = inputWord.trim().toLowerCase();
    // Normalize the word: trim whitespace and convert to lowercase for consistent API requests

    hide(wordCard, meaningsSection, relationsSection, footer);
    // Hide the result sections while loading new data

    if (status) status.textContent = `Loading data for "${word}"...`;
    // Show a loading message to the user

    history.replaceState({}, "", `detail.html?word=${encodeURIComponent(word)}`);
    // update URL without reload

    try {
        const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
        const data = await res.json().catch(() => null);

        if (!res.ok || !Array.isArray(data) || !data.length) {
            const message = data?.message || "Word not found.";
   
            if (res.status === 404) {
                if (status) {
                    status.innerHTML = `
                        <div class="no-word-error">
                            <img src="img/not_a_cat.png" alt="No entry found" />
                            <div class="error-texts">
                                <p class="error-message">That's not a word, buddy</p>
                                <p class="error-sub"><a href="index.html">Back to home page</a></p>
                            </div>
                        </div>
                    `;
                }
                hide(wordCard, meaningsSection, relationsSection, footer);
                return;
            }
            throw new Error(message);
        }
   // this checks whether the API result is valid: it must be a successful response, an array, and contain at least one entry. If not it shows the message "Word not found".

        renderEntry(data[0]);
        if (status) status.textContent = "";
    } catch (error) {
        console.error(error);
        if (status) {
            status.innerHTML = `
                <div class="no-word-error">
                    <img src="img/not_a_cat.png" alt="No entry found" />
                    <div class="error-texts">
                        <p class="error-message">That's not a word, buddy.</p>
                        <p class="error-sub"><a href="index.html">Back to home page</a></p>
                    </div>
                </div>
            `;
            hide(footer);
        }
    }
        // If the data is valid, it renders the first entry and clears the status message
        // 1. API returns data
        // 2. data[0] is rendered
        // 3. loading text is removed from the status box
}


const wordTitle = document.getElementById("wordTitle");
const phoneticText = document.getElementById("phoneticText");
const audioContainer = document.getElementById("audioContainer");
const meaningsContainer = document.getElementById("meaningsContainer");
const synonymsText = document.getElementById("synonymsText");
const antonymsText = document.getElementById("antonymsText");
const wordCard = document.getElementById("wordCard");
const meaningsSection = document.getElementById("meaningsSection");
const relationsSection = document.getElementById("relationsSection");

function setRandomCat() {
    const imgs = document.querySelectorAll('.silly_cat');
    if (!imgs.length) return;
    const count = 45;
    const n = Math.floor(Math.random() * count) + 1;
    const src = `img/cat${n}.png`;
    imgs.forEach(img => {
        img.src = src;
        img.alt = `Silly Cat ${n}`;
    });
}
// pick a random cat image (expects img/cat1.png ... img/cat45.png)
// Each time we render a new word entry, we call setRandomCat() to change the cat image.

function renderEntry(entry) {
    setRandomCat();

    const phonetic = entry.phonetic || entry.phonetics?.find((p) => p.text)?.text || "No phonetic spelling available";
    const audio = entry.phonetics?.find((p) => p.audio)?.audio || "";
    // This function extracts the phonetic spelling and audio URL from the entry data.
    // It checks for the presence of these properties and provides fallback values if they are not available.

    if (wordTitle) {
        const w = entry.word || "this word";
        wordTitle.textContent = `How is "${w}" pronounced?`;
    }

    if (phoneticText) {
        const p = phonetic || "No phonetic available";
        phoneticText.textContent = `Phonetic spelling: ${p}`;
    }

    if (audioContainer) {
        audioContainer.innerHTML = "";
        // clears previous audio if any

        if (audio) {
            const audioElement = document.createElement("audio");
            audioElement.controls = true;
            audioElement.src = audio;
            audioContainer.appendChild(audioElement);
        } else {
            audioContainer.textContent = "No audio available :(";
        }
    }

    if (meaningsContainer) {
        meaningsContainer.innerHTML = "";
        const meanings = Array.isArray(entry.meanings) ? entry.meanings : [];
        // ensure meanings is an array

        meanings.forEach((meaning) => {
            const part = meaning.partOfSpeech;
            // read part of speech, if it's a noun, verb, etc.
            const definitions = Array.isArray(meaning.definitions) ? meaning.definitions : [];
            // ensure definitions is an array.

            if (!part || definitions.length === 0) return;
            // skip empty / invalid meaning groups

            const partBlock = document.createElement("div");
            partBlock.className = "part-block";

            const partOfSpeechTitle = document.createElement("h4");
            partOfSpeechTitle.textContent = part;
            partBlock.appendChild(partOfSpeechTitle);

            const definitionsWrapper = document.createElement("div");
            definitionsWrapper.className = "definition-grid";
            // holds definition cards so I can style them together

        

            definitions.forEach((definition) => {
                const definitionCard = document.createElement("article");
                definitionCard.className = "definition-card";

                const definitionLabel = document.createElement("p");
                definitionLabel.className = "definition-label";
                definitionLabel.textContent = "Definition:";

                const definitionText = document.createElement("p");
                definitionText.className = "definition-text";
                definitionText.textContent = definition.definition || "-";

                const exampleLabel = document.createElement("p");
                exampleLabel.className = "example-label";
                exampleLabel.textContent = "Example:";

                const exampleText = document.createElement("p");
                exampleText.className = definition.example ? "example-text" : "example-fallback";
                exampleText.textContent = definition.example || "-";

                definitionCard.append(definitionLabel, definitionText, exampleLabel, exampleText);
                definitionsWrapper.appendChild(definitionCard);
            });

            partBlock.appendChild(definitionsWrapper);
            meaningsContainer.appendChild(partBlock);
        });
    }

    const synSet = new Set();
    // Create set for unique synonyms
    const antSet = new Set();
    // Create set for unique antonyms

    (entry.meanings || []).forEach((meaning) => {
        (meaning.synonyms || []).forEach((s) => synSet.add(s));
        (meaning.antonyms || []).forEach((a) => antSet.add(a));

        (meaning.definitions || []).forEach((d) => {
            (d.synonyms || []).forEach((s) => synSet.add(s));
            (d.antonyms || []).forEach((a) => antSet.add(a));
        });
    });

    if (synonymsText) synonymsText.textContent = synSet.size ? [...synSet].join(", ") : "None";
    if (antonymsText) antonymsText.textContent = antSet.size ? [...antSet].join(", ") : "None";

    show(wordCard, meaningsSection, relationsSection, footer);
    // Show all sections and then activate scroll-reveal animation for definition cards.
    setupDefinitionCardAnimation();
    setupRelationCardAnimation();
    // Show result sections after render
}

function setupDefinitionCardAnimation() {
    const cards = document.querySelectorAll('.definition-card');
    if (!cards.length) return;

    if (definitionCardObserver) {
        definitionCardObserver.disconnect();
    }

    definitionCardObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.18,
        rootMargin: "0px 0px -6% 0px"
    });

    cards.forEach((card) => {
        card.classList.remove('in-view');
        definitionCardObserver.observe(card);
    });
}
// trigger slide in animation for definition cards when they enter the viewport using IntersectionObserver.
// It observes each card and adds the "in-view" class when it becomes visible, which triggers the CSS animation.

function setupRelationCardAnimation() {
    const cards = document.querySelectorAll('.Synonym, .Antonym');
    if (!cards.length) return;

    if (relationCardObserver) {
        relationCardObserver.disconnect();
    }

    relationCardObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.18,
        rootMargin: "0px 0px -6% 0px"
    });

    cards.forEach((card) => {
        card.classList.remove('in-view');
        relationCardObserver.observe(card);
    });
}
// same for synonym and antonym cards

function hide(...els) {
    els.forEach((el) => el?.classList.add("hidden"));
}

function show(...els) {
    els.forEach((el) => el?.classList.remove("hidden"));
}
// Helper functions to hide/show elements by toggling the "hidden" class.
// Hides it when loading new data, shows it after rendering.

document.addEventListener("DOMContentLoaded", () => {
    const page = location.pathname.split("/").pop();
    if (page === "index.html" || page === "") {
        searchWord();
        setupCatRain();
        // attach home-page submit handler
    }
    if (page === "detail.html") {
        setupDetailPage();
        // attach detail-page handler and load ?word=...
    }
});