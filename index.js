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
    sender: String,
    message: String,
    timestamp: Date
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
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
