import React, { useState, useEffect, useRef } from 'react';

// Main App component
const App = () => {
    // State to store chat messages
    const [messages, setMessages] = useState([]);
    // State for the current text input by the user
    const [inputText, setInputText] = useState('');
    // State for the Gemini API key
    const [apiKey, setApiKey] = useState('');
    // State to indicate if an API call is in progress
    const [isLoading, setIsLoading] = useState(false);
    // State to store any error messages
    const [error, setError] = useState('');
    // State to control visibility of settings
    const [showSettings, setShowSettings] = useState(false);
    // State to choose between local (Ollama) and cloud (Gemini) model
    const [useLocal, setUseLocal] = useState(true); // Default to local
    // Ref for scrolling to the bottom of the chat window
    const messagesEndRef = useRef(null);

    // Effect to scroll to the bottom of the chat whenever messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Function to handle sending a message
    const handleSendMessage = async () => {
        if (inputText.trim() === '') return;
        
        // Only require API key for cloud model
        if (!useLocal && !apiKey) {
            setError('Please enter your Gemini API Key for cloud model.');
            return;
        }

        const userMessage = { type: 'user', text: inputText };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        
        const currentInput = inputText;
        setInputText(''); // Clear input field immediately
        setIsLoading(true);
        setError('');

        try {
            // Call your backend API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: currentInput,
                    useLocal: useLocal,
                    apiKey: useLocal ? undefined : apiKey // Only send API key for cloud requests
                })
            });

            if (!response.ok) {
                // If the server response is not ok, get the error message from the backend
                const errorData = await response.json();
                throw new Error(errorData.message || 'An error occurred on the server.');
            }

            const data = await response.json();
            // Add bot response to chat history
            setMessages((prevMessages) => [...prevMessages, { type: 'bot', text: data.response }]);

        } catch (err) {
            console.error('Error calling backend API:', err);
            setError(`Failed to get response: ${err.message}`);
            // Add a generic error message to the chat so the user knows something went wrong.
            setMessages((prevMessages) => [...prevMessages, { type: 'bot', text: 'Sorry, I encountered an error. Please check the settings and try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Function to handle Enter key press in the input field
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !isLoading && inputText.trim()) {
            handleSendMessage();
        }
    };

    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            backgroundColor: '#f3f4f6',
            fontFamily: 'Arial, sans-serif',
            color: '#374151'
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            background: 'linear-gradient(to right, #2563eb, #4f46e5)',
            color: 'white',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        },
        title: {
            fontSize: '24px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center'
        },
        settingsButton: {
            padding: '8px',
            borderRadius: '50%',
            backgroundColor: '#1d4ed8',
            border: 'none',
            color: 'white',
            cursor: 'pointer'
        },
        settingsPanel: {
            padding: '16px',
            backgroundColor: '#dbeafe',
            borderBottom: '1px solid #93c5fd',
            boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
        },
        settingsRow: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px'
        },
        label: {
            color: '#1e40af',
            fontWeight: '600',
            minWidth: '120px'
        },
        input: {
            flex: 1,
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #93c5fd',
            fontSize: '14px'
        },
        toggle: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        checkbox: {
            width: '18px',
            height: '18px'
        },
        chatWindow: {
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
        },
        emptyState: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            color: '#6b7280',
            fontSize: '18px'
        },
        messageContainer: {
            display: 'flex'
        },
        userMessage: {
            justifyContent: 'flex-end'
        },
        botMessage: {
            justifyContent: 'flex-start'
        },
        messageBubble: {
            maxWidth: '70%',
            padding: '12px 16px',
            borderRadius: '16px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        },
        userBubble: {
            backgroundColor: '#3b82f6',
            color: 'white',
            borderBottomRightRadius: '4px'
        },
        botBubble: {
            backgroundColor: '#e5e7eb',
            color: '#374151',
            borderBottomLeftRadius: '4px'
        },
        inputArea: {
            padding: '16px',
            backgroundColor: 'white',
            borderTop: '1px solid #e5e7eb',
            boxShadow: '0 -2px 4px rgba(0, 0, 0, 0.05)'
        },
        inputContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
        },
        textInput: {
            flex: 1,
            padding: '12px 16px',
            borderRadius: '24px',
            border: '1px solid #d1d5db',
            fontSize: '16px',
            outline: 'none'
        },
        sendButton: {
            padding: '12px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        sendButtonDisabled: {
            opacity: 0.5,
            cursor: 'not-allowed'
        },
        error: {
            color: '#dc2626',
            marginTop: '8px',
            fontSize: '14px',
            textAlign: 'center',
            fontWeight: '500'
        },
        loadingMessage: {
            display: 'flex',
            justifyContent: 'flex-start'
        },
        loadingBubble: {
            maxWidth: '70%',
            padding: '12px 16px',
            borderRadius: '16px',
            backgroundColor: '#e5e7eb',
            color: '#374151',
            borderBottomLeftRadius: '4px',
            animation: 'pulse 2s infinite'
        }
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <header style={styles.header}>
                <h1 style={styles.title}>
                    🤖 Tech Buddy
                </h1>
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    style={styles.settingsButton}
                    aria-label="Settings"
                >
                    ⚙️
                </button>
            </header>

            {/* Settings Panel */}
            {showSettings && (
                <div style={styles.settingsPanel}>
                    <div style={styles.settingsRow}>
                        <label style={styles.label}>Model Type:</label>
                        <div style={styles.toggle}>
                            <input
                                type="checkbox"
                                id="use-local"
                                checked={useLocal}
                                onChange={(e) => setUseLocal(e.target.checked)}
                                style={styles.checkbox}
                            />
                            <label htmlFor="use-local">Use Local Model (Ollama)</label>
                        </div>
                    </div>
                    
                    {!useLocal && (
                        <div style={styles.settingsRow}>
                            <label htmlFor="api-key" style={styles.label}>
                                Gemini API Key:
                            </label>
                            <input
                                type="password"
                                id="api-key"
                                value={apiKey}
                                onChange={(e) => {
                                    setApiKey(e.target.value);
                                    setError(''); // Clear error when user changes key
                                }}
                                placeholder="Enter your Gemini API Key"
                                style={styles.input}
                            />
                        </div>
                    )}
                    
                    {error && (
                        <p style={styles.error}>
                            {error}
                        </p>
                    )}
                </div>
            )}

            {/* Chat Window */}
            <div style={styles.chatWindow}>
                {messages.length === 0 && (
                    <div style={styles.emptyState}>
                        Start a conversation with Tech Buddy!
                    </div>
                )}
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        style={{
                            ...styles.messageContainer,
                            ...(msg.type === 'user' ? styles.userMessage : styles.botMessage)
                        }}
                    >
                        <div
                            style={{
                                ...styles.messageBubble,
                                ...(msg.type === 'user' ? styles.userBubble : styles.botBubble)
                            }}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div style={styles.loadingMessage}>
                        <div style={styles.loadingBubble}>
                            Tech Buddy is thinking...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} /> {/* Scroll target */}
            </div>

            {/* Input Area */}
            <div style={styles.inputArea}>
                <div style={styles.inputContainer}>
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your troubleshooting query..."
                        style={styles.textInput}
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSendMessage}
                        style={{
                            ...styles.sendButton,
                            ...(isLoading || !inputText.trim() ? styles.sendButtonDisabled : {})
                        }}
                        disabled={isLoading || !inputText.trim()}
                        aria-label="Send message"
                    >
                        ➤
                    </button>
                </div>
            </div>
        </div>
    );
};

export default App;