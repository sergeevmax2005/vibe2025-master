const mysql = require("mysql2/promise");

module.exports = async (req, res, dbConfig) => {
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", async () => {
    const { id } = JSON.parse(body);
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute("DELETE FROM items WHERE id = ?", [id]);
    await connection.end();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true }));
  });
};
