const form = document.getElementById("searchForm");
    const input = document.getElementById("wordInput");
    const Status = document.getElementById("status");

    function getFormWord(form) { 
    return new FormData(form).get("word")?.toString().trim();
    }

// helper: read "word" from a form, normalize it, Copilot said this is not needed but I think it makes the code cleaner

function searchWord(){
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const word = getFormWord(form); 
        // reads the word
        if (!word) return; 
        // Stop if input is empty
        location.href = `detail.html?word=${encodeURIComponent(word)}`; 

        // Redirect to detail page with word in query parameter
    })
}


function setupDetailPage() {
form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const word = getFormWord(form);
    if (!word) return;
    loadWord(word);

    //loads dictionary data for typed word, typed word = inputWord
});

const urlWord = new URLSearchParams(location.search).get("word"); 
    if (urlWord) { 
        if (input) input.value = urlWord; 
        loadWord(urlWord); 
    } else if (Status) { 
        tatus.textContent = "Please enter a word in the search field."; 
    } 
    //loads the word from the URL query parameter when the detail page is accessed directly. If a word is provided, it sets the input field and loads the word data. If no word is provided, it prompts the user to enter a word.

}



async function loadWord(inputWord) {
    const word = inputWord.trim().toLowerCase();

    // Normalize the word: trim whitespace and convert to lowercase for consistent API requests

    hide(wordCard, meaningsSection, relationsSection);

    // Hide the result sections while loading new data

    if (Status) Status.textContent = `Loading data for "${word}"...`; 

    // Show a loading message to the user

    history.replaceState({}, "", `detail.html?word=${encodeURIComponent(word)}`); 
    // update URL without reload
    
    try{
        const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
        const data = await res.json();

        console.log("API response:", data);
        console.log("Meanings:", data[0]?.meanings);

        
        if (!res.ok || !Array.isArray(data) || !data.length) {
            throw new Error(data?.message || "Word not found.");

            // this checks whether the API result is valid: it must be a successful response, an array, and contain at least one entry. If not it shows the message "Word not found".
        }

        renderEntry(data[0]);
       if (Status) Status.textContent = "";

        // If the data is valid, it     renders the first entry and clears the status message 
        // 1. API returns data
        // 2. data[0] is rendered
        // 3. loading text is removed from the status box
    }
    catch (NoEntryError){
        console.error(NoEntryError);
        if (Status){
            Status.innerHTML = `No entry found. <a href="index.html">Back to home page</a>`;
        }
    }

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

function renderEntry(entry) {

    const phonetic = entry.phonetic || entry.phonetics?.find((p) => p.text)?.text || "No phonetic spelling available";
    const audio = entry.phonetics?.find((p) => p.audio)?.audio || "";

    // This function extracts the phonetic spelling and audio URL from the entry data. It checks for the presence of these properties and provides fallback values if they are not available.

    if (wordTitle) wordTitle.textContent = entry.word || "-";

    if (phoneticText) phoneticText.textContent = phonetic || "No phonetic available";

    if (audioContainer) {
        audioContainer.innerHTML = "";

        //clears previous audio if any

       if (audio){
        const audioElement = document.createElement("audio");
        audioElement.controls = true;
        audioElement.src = audio;
        audioContainer.appendChild (audioElement);
       }

       else{
        audioContainer.textContent = "No audio available";
       }
    }

    if (meaningsContainer) {
        meaningsContainer.innerHTML = "";
        const meanings = Array.isArray(entry.meanings) ? entry.meanings : [];

        // ensure meaings is an array

    meanings.forEach((meaning) =>{
        const part = meaning.partOfSpeech;

        // read part of speech, if it's a noun, verb, etc.

        const definitions = Array.isArray(meaning.definitions) ? meaning.definitions : [];
        
        // ensure definitions is an array.

        if (!part || definitions.length === 0) return;
        // skip empty / invalid meaing groups

        const partBlock = document.createElement("div");
        partBlock.className = "part-block";

        const PartOfSpeechTitle = document.createElement("h4");
        PartOfSpeechTitle.textContent = part
        partBlock.appendChild (PartOfSpeechTitle);

        const definitionsWrapper = document.createElement("div");
        definitionsWrapper.className = "definitionsWrapper";

        // holds definition cards so I can style them together

        definitionsWrapper.className = "definition-grid";

        definitions.forEach((definition, index) => {
            const definitionCard = document.createElement("article");
            definitionCard.className = "definition-card";

            const definitionText = document.createElement("p");
            definitionText.className = "definition-text";
            definitionText.textContent = `${index + 1}. ${definition.definition || "-"}`;

            const example = document.createElement("p");
            example.className = "example";
            example.textContent = definition.example ? `Example: ${definition.example}` : "";

            definitionCard.append(definitionText, example); 
            
            // changed from appendChild(defText, exampleText)

            definitionsWrapper.appendChild(definitionCard);
        });

        partBlock.appendChild(definitionsWrapper);
        meaningsContainer.appendChild(partBlock);
        });
    }

    const synSet = new Set(); // Create set for unique synonyms
    const antSet = new Set(); // Create set for unique antonyms

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

    show(wordCard, meaningsSection, relationsSection); 
    
    // Show result sections after render

}

function hide(...els) {
    els.forEach((el) => el?.classList.add("hidden")); 
}
function show(...els) { 
    els.forEach((el) => el?.classList.remove("hidden")); 
} 

// Helper functions to hide/show elements by toggling the "hidden" class. Hides it when loading new data, shows it after rendering.

document.addEventListener("DOMContentLoaded", () => {
    const page = location.pathname.split("/").pop();
    if (page === "index.html" || page === "") {
        searchWord(); 
        
        // attach home-page submit handler
    }
    if (page === "detail.html") {
        setupDetailPage(); 
        
        // attach detail-page handler and load ?word=...
    }
});

