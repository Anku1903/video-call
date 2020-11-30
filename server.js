require('dotenv').config();
const express = require("express");
const http = require("http");
const app = express();
const PORT = process.env.PORT || 8000;
const mongoose = require('mongoose');
const server = http.createServer(app);
const socket = require("socket.io");
const Vuser = require('./model');
const io = socket(server);
app.use(express.json());
app.use(express.urlencoded());
mongoose.connect('mongodb+srv://mydb01:Mydb01@firstdb.yskyo.mongodb.net/firstdb?retryWrites=true&w=majority',{
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useNewUrlParser: true
});
mongoose.connection.on('connected',()=>{
console.log('system connceted to cloud database');
});
const users = {};

const socketToRoom = {};

io.on('connection', socket => {
    console.log('connected')
    socket.on("join room", roomID => {
        if (users[roomID]) {
            // const length = users[roomID].length;
            // if (length === 4) {
            //     socket.emit("room full");
            //     return;
            // }
            users[roomID].push(socket.id);
        } else {
            users[roomID] = [socket.id];
        }
        socketToRoom[socket.id] = roomID;
        const usersInThisRoom = users[roomID].filter(id => id !== socket.id);

        socket.emit("all users", usersInThisRoom);
    });

    socket.on("sending signal", payload => {
        io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID });
    });

    socket.on("returning signal", payload => {
        io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
    });

    socket.on('disconnect', () => {
        const roomID = socketToRoom[socket.id];
        let room = users[roomID];
        if (room) {
            delete room[socket.id];
            room = room.filter(id => id !== socket.id);
            
            users[roomID] = room;
        }
    });

});
app.post('/register',(req,res) => {
    console.log(req.body)
    const newUser = new Vuser({
        name: req.body.name,
        uuid: req.body.uuid,
        password: req.body.password
    });
    
    newUser.save().then(() => res.send({result: '1'})).catch(() => res.send({result: '0'}))
    
    });
app.post('/login',(req,res) => {
        const newUser = mongoose.model('Vuser');
        newUser.findOne({name: req.body.name,password: req.body.password},(err,data) => {
            if(err || data === null) {
    
                res.send({user: '0'})
            }
            else{
            res.send({user: {name: data.name,uuid: data.uuid}})
            }
        })
});   
app.get('/user',(req,res) => {
    const newUser = mongoose.model('Vuser');
    newUser.find({},null,{sort: {createdAt: '-1'}},(err,data) => {
        if(err || data === null) {

            res.send({users: '0'})
        }
        else{
        res.send({users: data})
        }
    })
});   

server.listen(PORT, () => console.log('server is running on port 8000'));


