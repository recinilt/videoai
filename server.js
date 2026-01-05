const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

// Gemini API Proxy
app.post('/api/gemini', async (req, res) => {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${req.body.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body.data)
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Replicate Create Prediction
app.post('/api/replicate', async (req, res) => {
    try {
        const response = await fetch('https://api.replicate.com/v1/predictions', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${req.body.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body.data)
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Replicate Check Status
app.get('/api/replicate/:id', async (req, res) => {
    try {
        const apiKey = req.headers.authorization?.replace('Token ', '');
        if (!apiKey) {
            return res.status(401).json({ error: 'API key required' });
        }
        
        const response = await fetch(`https://api.replicate.com/v1/predictions/${req.params.id}`, {
            headers: {
                'Authorization': `Token ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'AI Video Proxy Server',
        endpoints: [
            'POST /api/gemini',
            'POST /api/replicate', 
            'GET /api/replicate/:id'
        ]
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
