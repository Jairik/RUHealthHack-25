/* For simplicity, just all of the endpoints here */
// Base URL for Vite project
const API_BASE_URL = (import.meta.env.VITE_API_URL + '/api') || "http://localhost:8000/api";

/* Fetches the next question, given the current question + response 
* Parameters:
*   question: string - the current question being asked
*   response: string - the user's response to the current question
* Returns:
*   JSON object with the next question and any additional data or NULL if there are no more questions
*/
async function getNextQuestion(question, response){
    const url = `${API_BASE_URL}/next_question`;
    // Define the body of the POST request: question and response string
    const body = {
        question: question,
        response: response
    };
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
    return res.json();  // Return as a JSON object
}

/* Fetches the last name and date of birth given the first name
* Parameters:
*   firstname: string - the user's first name
* Returns:
*   JSON object with potential last names, or NULL if not found
*/
async function getLastNameAndDoB(firstname) {
    const url = `${API_BASE_URL}/lastname_dob`;
    const body = { firstname };
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
    return res.json();
}

/* Fetches the date of birth given the first name and last name
* Parameters:
*   firstname: string - the user's first name
*   lastname: string - the user's last name
* Returns:
*   JSON object with date of birth and provider, or NULL if not found
*/
async function getDoB(firstname, lastname) {
    const url = `${API_BASE_URL}/dob`;
    const body = { firstname, lastname };
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
    return res.json();
}

/* Fetches the provider, given the first name, last name, and date of birth
* Parameters:
*   firstname: string - the user's first name
*   lastname: string - the user's last name
*   dob: string - the user's date of birth
* Returns:
*   JSON object with the provider name, or NULL if not found
*/
async function getProvider(firstname, lastname, dob) {
    const url = `${API_BASE_URL}/`;
    const body = { firstname, lastname };
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
    return res.json();
}

/* Submits the entire conversation to the backend for processing and storing
* Parameters:
*   conversation: string transcript of the conversation
* Returns:
*   JSON object with success status and any additional info
*/
async function submitConversation(conversation) {
    const url = `${API_BASE_URL}/submit_conversation`;
    const body = { conversation };
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
    return res.json();
}

// Export everything
export {
    getNextQuestion,
    getLastNameAndDoB,
    getDoB,
    getProvider,
    submitConversation
};