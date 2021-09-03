const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const socketio = require('socket.io');
const Emitter=require('events');
require('./config')
require('dotenv').config();
const baseRouter = require('./router/baseRouter');
const authRouter = require('./router/authRouter')
const app = express();
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

const eventEmitter=new Emitter();
app.set('event',eventEmitter);
app.use('/',baseRouter);

const server = app.listen(8000,()=>{
  console.log("Fired at 8000")
})

const io=socketio(server,{
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }});

io.on('connect',(socket) => {

  console.log("SOCKET CONNECTED WITH CLIENT");
  socket.on('join',({room},callback) => {
    console.log("ROOM",room)
    socket.join(room);
    
  });
  socket.on('disconnect',()=>{
    console.log('disconnected with Client');
  })
})
io.emit("HELLO");

eventEmitter.on('StatusUpdated',({dphoneno,apdate})=>{
  console.log(`${dphoneno}${apdate}`)
  io.to(`${dphoneno}${apdate}`).emit('Next',{data:"UPDATED"});
})


// io.on('connect', (socket) => {
//   socket.on('join', ({ name, room }, callback) => {
//     const { error, user } = addUser({ id: socket.id, name, room });

//     if(error) return callback(error);

//     socket.join(user.room);

//     socket.emit('message', { user: 'admin', text: `${user.name}, welcome to room ${user.room}.`});
//     socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` });

//     io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

//     callback();
//   });

//   socket.on('sendMessage', (message, callback) => {
//     const user = getUser(socket.id);

//     io.to(user.room).emit('message', { user: user.name, text: message });

//     callback();
//   });

//   socket.on('disconnect', () => {
//     const user = removeUser(socket.id);

//     if(user) {
//       io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has left.` });
//       io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
//     }
//   })
// });
// eventEmitter.on('orderUpdated',(data)=>{
//   io.to(`order_${data.id}`).emit('orderUpdated',data);
// });
// eventEmitter.on('NewOrder',data=>{
//   io.to('adminRoom').emit('NewOrder',data)
// });
