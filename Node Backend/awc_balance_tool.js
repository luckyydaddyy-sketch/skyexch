const express = require('express');
const { MongoClient } = require('mongodb');
const config = require('./config/config');

const app = express();
app.use(express.json());

const PORT = 4444; // Custom port for this tool

// Serve the HTML UI
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AWC Test Balance Manager</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #1e1e2d; color: #fff; padding: 40px; }
            .container { max-width: 500px; margin: 0 auto; background: #2a2a3e; padding: 30px; border-radius: 12px; box-shadow: 0 8px 16px rgba(0,0,0,0.5); }
            h2 { color: #00d2ff; text-align: center; margin-bottom: 20px; }
            .form-group { margin-bottom: 20px; }
            label { display: block; margin-bottom: 8px; font-weight: bold; color: #a1a1aa; }
            input[type="text"], input[type="number"] { width: 100%; padding: 12px; box-sizing: border-box; background: #151521; border: 1px solid #3f3f4e; color: #fff; border-radius: 6px; font-size: 16px; margin-bottom: 10px; }
            button { width: 100%; padding: 14px; border: none; border-radius: 6px; font-size: 16px; font-weight: bold; cursor: pointer; transition: 0.2s; margin-bottom: 10px; }
            .btn-zero { background: #f39c12; color: white; }
            .btn-zero:hover { background: #e67e22; }
            .btn-negative { background: #e74c3c; color: white; }
            .btn-negative:hover { background: #c0392b; }
            .btn-custom { background: #2ecc71; color: white; }
            .btn-custom:hover { background: #27ae60; }
            .btn-check { background: #3498db; color: white; }
            .btn-check:hover { background: #2980b9; }
            #status { margin-top: 20px; padding: 15px; border-radius: 6px; display: none; text-align: center; font-weight: bold; }
            .success { background: #2ecc7133; border: 1px solid #2ecc71; color: #2ecc71; }
            .error { background: #e74c3c33; border: 1px solid #e74c3c; color: #e74c3c; }
            .info { background: #3498db33; border: 1px solid #3498db; color: #3498db; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>AWC Test Balance Manager 🕹️</h2>
            
            <div class="form-group">
                <label>Player Username:</label>
                <input type="text" id="username" value="testpl9" placeholder="Enter username (e.g. testpl9)">
                <button class="btn-check" onclick="checkBalance()">🔍 Check Current Balance</button>
            </div>

            <hr style="border:0; height:1px; background:#3f3f4e; margin:20px 0;">

            <div class="form-group">
                <label>AWC Certification Quick Actions:</label>
                <button class="btn-zero" onclick="updateBalance(0)">⚙️ Set ZERO Balance (0)</button>
                <button class="btn-negative" onclick="updateBalance(-10)">🚨 Set NEGATIVE Balance (-10)</button>
            </div>
            
            <div class="form-group" style="background: #151521; padding: 15px; border-radius: 8px; border: 1px solid #3f3f4e;">
                <label>Set Custom Positive Balance:</label>
                <input type="number" id="customAmount" value="500000" placeholder="Amount">
                <button class="btn-custom" onclick="updateCustomBalance()">💰 Add Custom Balance</button>
            </div>

            <div id="status"></div>
        </div>

        <script>
            function showStatus(msg, type) {
                const statusEl = document.getElementById('status');
                statusEl.textContent = msg;
                statusEl.className = type;
                statusEl.style.display = 'block';
                setTimeout(() => { statusEl.style.display = 'none'; }, 4000);
            }

            async function checkBalance() {
                const username = document.getElementById('username').value.trim();
                if(!username) return showStatus('Please enter a username', 'error');

                try {
                    const res = await fetch('/api/balance/' + username);
                    const data = await res.json();
                    if(data.success) {
                        showStatus('Current Balance: ' + data.balance, 'info');
                    } else {
                        showStatus(data.message, 'error');
                    }
                } catch(e) { showStatus('Server error', 'error'); }
            }

            async function updateBalance(amount) {
                const username = document.getElementById('username').value.trim();
                if(!username) return showStatus('Please enter a username', 'error');

                try {
                    const res = await fetch('/api/balance', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, amount })
                    });
                    const data = await res.json();
                    if(data.success) {
                        showStatus('Success! Balance is now ' + amount, 'success');
                    } else {
                        showStatus(data.message, 'error');
                    }
                } catch(e) { showStatus('Server error', 'error'); }
            }

            function updateCustomBalance() {
                const amount = document.getElementById('customAmount').value;
                if(amount === '') return showStatus('Enter an amount', 'error');
                updateBalance(Number(amount));
            }
        </script>
    </body>
    </html>
  `);
});

// API Get Balance
app.get('/api/balance/:username', async (req, res) => {
    const client = new MongoClient(config.mongoose.url);
    try {
        await client.connect();
        const db = client.db(config.mongoose.master_db);
        const user = await db.collection('users').findOne({ user_name: req.params.username });
        if (user) {
            res.json({ success: true, balance: user.casinoUserBalance });
        } else {
            res.json({ success: false, message: 'User not found' });
        }
    } catch(err) {
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
});

// API Update Balance
app.post('/api/balance', async (req, res) => {
    const { username, amount } = req.body;
    if (typeof amount !== 'number') return res.status(400).json({success: false, message: 'Invalid amount'});

    const client = new MongoClient(config.mongoose.url);
    try {
        await client.connect();
        const db = client.db(config.mongoose.master_db);
        const result = await db.collection('users').updateOne(
            { user_name: username },
            { $set: { casinoUserBalance: amount, casinoWinLimit: amount, balance: amount } }
        );

        if (result.matchedCount > 0) {
             res.json({ success: true, message: 'Balance updated' });
        } else {
             res.json({ success: false, message: 'User not found' });
        }
    } catch(err) {
        res.status(500).json({ success: false, message: err.message });
    } finally {
        await client.close();
    }
});

app.listen(PORT, () => {
  console.log('======================================================');
  console.log('|                                                    |');
  console.log('|     🚀 AWC Balance Manager Tool is STARTING! 🚀    |');
  console.log('|                                                    |');
  console.log('|  Open this link in your browser to use the tool:   |');
  console.log('|  --> http://localhost:4444                         |');
  console.log('|                                                    |');
  console.log('======================================================');
});
