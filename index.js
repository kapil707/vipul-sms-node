const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/sms')
.then(()=>console.log("MongoDb Connected"))
.catch((err) =>console.log("MongoDb Error",err));

const smsSchema = new mongoose.Schema({
    sender: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, required: true },
    messageId: { type: String, unique: true } // Add messageId
});

const Sms = mongoose.model('Sms', smsSchema);

io.on('connection', (socket) => {
    console.log('A user connected');
    
    socket.on('send_sms', (data) => {
        const newSms = new Sms(data);
        newSms.save()
            .then(() => console.log('SMS saved to DB'))
            .catch(err => console.error(err));
    });

    socket.on('send_sms_new', (data) => {
        const {messageId } = data;
        console.log('New SMS saved to DB' + messageId);
        const newSms = new Sms(data);
        newSms.save()
            .then(() => console.log('SMS saved to DB'))
            .catch(err => console.error(err));
    });
});

// API endpoint to fetch all SMS
app.get('/api/sms', async (req, res) => {
    try {
        const smsList = await Sms.find(); // Fetch all SMS from the database
        res.json(smsList); // Return as JSON
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch SMS' });
    }
});

server.listen(3001, () => {
    console.log('Server is running on port 3001');
});
