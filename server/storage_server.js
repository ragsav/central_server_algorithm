const app = require("express")();
const http = require("http").Server(app);

const io = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
});

var clients = [];
var storageState = {
  a: { write: 0, read: [] },
  b: { write: 0, read: [] },
  c: { write: 0, read: [] },
  d: { write: 0, read: [] },
};


app.get("/", (req, res) => {
  
});

const requestQueue=[];

io.on("connection", (socket) => {
  console.log(`User ${socket.handshake.auth.id} / ${socket.id} connected`);
  
  socket.emit("storage_state",storageState);
  socket.on("write",({storage})=>{

    if (storageState[storage].write===0 
      && storageState[storage].read.length === 0) {
      socket.emit("notification", {
        status: "success",
        msg: `${storage} allocated`,
      });
      setInterval(()=>{
        storageState[storage].write = 0;
        io.emit("storage_state", storageState);
      },15000)
      storageState[storage].write = socket.id;
      io.emit("storage_state", storageState);
    } else if (storageState[storage].read.length === 0) {
      socket.emit("notification", {
        status: "error",
        msg: `${storageState[storage].write} currently writting ${storage}`,
      });
    } else{
      socket.emit("notification", {
        status: "error",
        msg: `Users currently reading ${storage}`,
      });
    }
  })

  socket.on("read", ({ storage }) => {
    if (storageState[storage].write === 0) {
      if(storageState[storage].read.indexOf(socket.id)===-1){
        socket.emit("notification", {
          status: "success",
          msg: `Read access to ${storage} granted`,
        });
        setInterval(() => {
          var index = storageState[storage].read.indexOf(socket.id);
          if (index != -1) {
            storageState[storage].read.splice(index, 1);
          }
          io.emit("storage_state", storageState);
        }, 15000);
        storageState[storage].read.push(socket.id);
        io.emit("storage_state", storageState);
      }else{
        socket.emit("notification", {
          status: "error",
          msg: `You already have read access to ${storage}`,
        });
      }
      
    }
    else {
      socket.emit("notification", {
        status: "error",
        msg: `${storageState[storage].write} currently writting ${storage}`,
      });
    }
  });

  socket.on("release", ({ storage }) => {
    if (
      storageState[storage].write === socket.id ||
      storageState[storage].read.indexOf(socket.id)!=-1
    ) {
      socket.emit("notification", {
        status: "success",
        msg: `${storage} is released`,
      });
      var index = storageState[storage].read.indexOf(socket.id);
      if(index!=-1){
        storageState[storage].read.splice(index, 1);
      }
      storageState[storage].write = 0;
      io.emit("storage_state", storageState);
    } else {
      socket.emit("notification", {
        status: "error",
        msg: `You are not reading/writting ${storage} currently`,
      });
    }
  });
});




http.listen(5000, () => {
  console.log("listening on *:5000");
});
