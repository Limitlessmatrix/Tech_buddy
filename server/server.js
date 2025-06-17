const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors());

// In a production environment, you would build the React app and serve its static files.
// This tells Express to serve any file in the 'client/build' folder.
app.use(express.static(path.join(__dirname, '..', 'client', 'build')));

// API endpoint for chat. This route is specific and comes first.
app.post('/api/chat', async (req, res) => {
    // Dynamically import node-fetch
    const { default: fetch } = await import('node-fetch');

    const { prompt, useLocal, apiKey } = req.body;

    if (!prompt) {
        return res.status(400).json({ message: 'Prompt is required.' });
    }

    try {
        let llmResponseText;

        if (useLocal) {
            // --- Local LLM Integration (Ollama) ---
            console.log("Connecting to local Ollama server...");
            const ollamaUrl = 'http://localhost:11434/api/generate';

            // NOTE: Change the model to whatever you have downloaded and are running in Ollama.
            // Common models: 'llama3', 'gemma3:12b', 'mistral'
            const ollamaPayload = {
                model: 'gemma3:12b-it-qat', // Changed from 'gemma3' to match your actual model
                prompt: prompt,
                stream: false
            };

            try {
                const ollamaRes = await fetch(ollamaUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(ollamaPayload)
                });

                if (!ollamaRes.ok) {
                    throw new Error(`Ollama server returned an error: ${ollamaRes.statusText}`);
                }

                const ollamaData = await ollamaRes.json();
                llmResponseText = ollamaData.response;

            } catch (e) {
                // Catch connection errors, e.g., if Ollama server is not running
                if (e.code === 'ECONNREFUSED') {
                    console.error('Connection to Ollama server failed. Is it running?');
                    throw new Error('Could not connect to the local Ollama server. Please ensure it is running on http://localhost:11434.');
                }
                // Re-throw other errors
                throw e;
            }

        } else {
            // --- Cloud LLM Integration (Google Gemini API) ---
            console.log("Connecting to Google Gemini API...");
            if (!apiKey) {
                return res.status(400).json({ message: 'API Key is required for Cloud model.' });
            }

            const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
            const geminiPayload = { contents: chatHistory };
            const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const geminiResponse = await fetch(geminiApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(geminiPayload)
            });

            if (!geminiResponse.ok) {
                const errorData = await geminiResponse.json();
                console.error('Gemini API Error:', errorData);
                throw new Error(errorData.error?.message || 'Gemini API request failed');
            }

            const geminiResult = await geminiResponse.json();
            if (geminiResult.candidates?.[0]?.content?.parts?.[0]?.text) {
                llmResponseText = geminiResult.candidates[0].content.parts[0].text;
            } else {
                throw new Error('No content found in Gemini API response.');
            }
        }

        res.json({ response: llmResponseText });

    } catch (error) {
        console.error('Backend API Error:', error);
        res.status(500).json({ message: `Internal server error: ${error.message}` });
    }
});

// *** ERROR FIX ***
// This is the catch-all route. It must be the LAST route defined.
// It sends the main HTML file for any GET request that doesn't match a previous route.
// This allows the React application to handle its own routing (client-side routing).
// Changed '*' to '/*' which is a more common and less ambiguous pattern.
// Handle React routing, return all requests to React app
app.get('(.*)', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Tech Buddy Backend server running on http://localhost:${PORT}`);
    console.log('Serving requests for the frontend and the /api/chat endpoint.');
});
