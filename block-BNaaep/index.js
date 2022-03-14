// Requiring all the core node modules
const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");
const qs = require("querystring");
const { parse } = require("path");

// Creating a server
let server = http.createServer(handleRequest);
function handleRequest(req, res) {
  let store = "";
  let parsedUrl = url.parse(req.url, true);

  req.on("data", (chunk) => {
    store += chunk;
  });

  req.on("end", () => {
    let contactPath = path.join(__dirname + "/contacts/");
    if (req.method === "GET" && req.url === "/") {
      res.setHeader("Content-Type", "text/html");
      fs.createReadStream("./home.html").pipe(res);
    }
    if (req.method === "GET" && req.url === "/about") {
      res.setHeader("Content-Type", "text/html");
      fs.createReadStream("./about.html").pipe(res);
    }
    if (req.method === "GET" && req.url === "/contact") {
      res.setHeader("Content-Type", "text/html");
      fs.createReadStream("./contact.html").pipe(res);
    }
    if (req.method === "POST" && req.url === "/contact") {
      let rawData = qs.parse(store);
      let stringifiedData = JSON.stringify(rawData);
      let parsedData = JSON.parse(stringifiedData);
      fs.open(contactPath + parsedData.username + ".json", "wx", (err, fd) => {
        if (err) {
          res.setHeader("Content-Type", "text/html");
          res.end("<h1>username already Exists</h1>");
          throw new Error("username already Exits");
        }
        fs.write(fd, stringifiedData, (err) => {
          if (err) return console.log(err);
          fs.close(fd, (err) => {
            if (err) return console.log(err);
            res.setHeader("Content-Type", "text/html");
            res.write(`<h1>${parsedData.username} contact saved </h1>`);
            res.end();
          });
        });
      });
    }
    // handle GET request on `/users?username=ANY_USERNAME_FROM_CONTACTS` which should
    if (req.method === "GET" && parsedUrl.pathname === "/users") {
      let userFileName = path.join(
        contactPath + parsedUrl.query.username + ".json"
      );
      fs.readFile(userFileName, "utf8", (err, content) => {
        if (err) return console.log(err);
        res.setHeader("Content-Type", "application/json");
        res.end(content);
      });
    }
    if (req.method === "GET" && req.url === "/users") {
      fs.readdir(__dirname + "/contacts", (err, file) => {
        if (err) return console.log(err);
        file.forEach((eachFile) => {
          fs.readFile(
            __dirname + "/contacts/" + eachFile,
            "utf8",
            (err, content) => {
              if (err) return console.log(error);
              console.log(content);
            }
          );
        });
      });
    }
    //Handling with the  css request
    if (req.method === "GET" && req.url.split(".").pop() === "css") {
      console.log("We have requested for css file right now");
      const cssFile = req.url;
      res.setHeader("Content-Type", "text/css");
      fs.readFile(__dirname + cssFile, "utf8", (err, content) => {
        if (err) return console.log(err);
        res.end(content);
      });
    }
    // Handling with the images requests
    if (req.method === "GET" && req.url.split(".").pop() === "jpg") {
      console.log("We have requested for a image right now ");
      console.log(req.url);
      console.log(req.url.split(".").pop());
      const imageUrl = req.url;
      res.setHeader("Content-Type", "image/jpg");
      fs.createReadStream(__dirname + req.url).pipe(res);
    }
  });
}

//listening  the request on 5000 port or making  the server at the 5000 port
server.listen(5000, "localhost", () => {
  console.log("server is running at  the 5K port");
});
