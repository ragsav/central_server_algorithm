const app = require("express")();
const http = require("http").Server(app);

const io = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
});

var requestQueue = [];
const maxResources = { a: 4, b: 5, c: 8, d: 2, e: 5 };
const allocatedResources = { a: 0, b: 0, c: 0, d: 0, e: 0 };
const availableResources = { a: 4, b: 5, c: 8, d: 2, e: 5 };
const resourceState = {a:{},b:{},c:{},d:{},e:{}};
app.get("/", (req, res) => {});


function isRequestLessThanMax(data){
  var ret = true;
  Object.keys(data).forEach((key) => {
    if (maxResources[key]===undefined || maxResources[key] < data[key]) {
      ret = false;
    };
    
  });
  return ret;
}

function isAllocationPossible(data){
  var ret = true;
  Object.keys(data).forEach((key)=>{
    if (availableResources[key]===undefined || availableResources[key] < data[key]){
      ret = false;
    }
  })
  return ret;
}
function isReleasePossible(data,id){
  var ret = true;
  Object.keys(data).forEach((key)=>{
    if (allocatedResources[key]===undefined || resourceState[key]===undefined) {ret = false;console.log(key)}
    if(data[key]>0){
      if (resourceState[key][id]===undefined){
        ret = false;
      }
      if (resourceState[key][id] < data[key]) {
        ret = false;
      }
        
    }
  })
  return ret;
}
function reduceResources(data,id){
  Object.keys(data).forEach((key) => {
    allocatedResources[key] = allocatedResources[key] + data[key];
    availableResources[key] = availableResources[key] - data[key];
    if(data[key]>0){
      if (resourceState[key]!=undefined && resourceState[key][id]!=undefined) {
        resourceState[key][id] += data[key];
      } else {
        resourceState[key][id] = data[key];
      }
    }
    
  });
}
function increaseResources(data,id) {
  Object.keys(data).forEach((key) => {
    allocatedResources[key] = allocatedResources[key] - data[key];
    availableResources[key] = availableResources[key] + data[key];
    if(data[key]>0){
      resourceState[key][id] -= data[key];
      if(resourceState[key][id]===0){
        resourceState[key][id]=undefined;
      }
    }
  });
}

function convertReqQueue(){
  const queue = [];
  requestQueue.forEach(({data,socket})=>{
    queue.push(socket.id);
  })
  return queue;
}

function checkQueue(){
  requestQueue.forEach(({data,socket})=>{
    if (isRequestLessThanMax(data)) {
      if (isAllocationPossible(data)) {
        reduceResources(data, socket.id);
        requestQueue.shift();
        socket.emit("success", "Resource allocated!");
        io.emit("resource_state", resourceState);
      }
    } else {
      requestQueue.shift();
      socket.emit("error", "Request not possible!");
    }
  })
  io.emit("request_queue",convertReqQueue());
}

io.on("connection", (socket) => {
  console.log(`User ${socket.handshake.auth.id} / ${socket.id} connected`);

  socket.emit("resource_state", resourceState);
  io.emit("request_queue", convertReqQueue());
  socket.on("allocate", (data) => {
    if(isRequestLessThanMax(data)){
      if (isAllocationPossible(data)) {
        reduceResources(data, socket.id);
        socket.emit("success", "Resource allocated!");
        io.emit("resource_state", resourceState);
      } else {
        requestQueue.push({ socket, data });
        io.emit("request_queue", convertReqQueue());
        socket.emit("warning", "Request in queue!");
      }
    }else{
      socket.emit("error", "Request not possible!");
    }
    // console.log(requestQueue);
    // console.log(allocatedResources)
    // console.log(resourceState);
    // console.log(availableResources);
  });

  

  socket.on("release", (data) => {
    if (
      isRequestLessThanMax(data) === true &&
      isReleasePossible(data, socket.id) === true
    ) {
      increaseResources(data, socket.id);
      socket.emit("success", "Resource released!");
      io.emit("resource_state", resourceState);
      checkQueue();
    } else {
      socket.emit("error", "Request not possible!");
    }
    // console.log(requestQueue);
    // console.log(allocatedResources);
    // console.log(resourceState);
    // console.log(availableResources);
  });
});

http.listen(5000, () => {
  console.log("listening on *:5000");
});
