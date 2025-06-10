const http = require("http");
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

const PORT = 3000;

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "todolist",
};

async function retrieveListItems() {
  const connection = await mysql.createConnection(dbConfig);
  const [rows] = await connection.execute("SELECT id, text FROM items");
  await connection.end();
  return rows;
}

async function getHtmlRows() {
  const todoItems = await retrieveListItems();
  return todoItems
    .map(
      (item) => `
        <tr>
            <td>${item.id}</td>
            <td>${item.text}</td>
            <td>
                <button onclick="deleteItem(${item.id})">Delete</button>
                <button onclick="editItem(${item.id})">Edit</button>
            </td>
        </tr>
    `
    )
    .join("");
}

async function handleRequest(req, res) {
  if (req.url === "/" && req.method === "GET") {
    const html = await fs.promises.readFile(
      path.join(__dirname, "index.html"),
      "utf8"
    );
    const processedHtml = html.replace("{{rows}}", await getHtmlRows());
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(processedHtml);
  } else if (req.url === "/addItem" && req.method === "POST") {
    require("./addItem")(req, res, dbConfig);
  } else if (req.url === "/deleteItem" && req.method === "POST") {
    require("./deleteItem")(req, res, dbConfig);
  } else if (req.url === "/editItem" && req.method === "POST") {
    require("./editItem")(req, res, dbConfig);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Route not found");
  }
}

const server = http.createServer(handleRequest);
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
