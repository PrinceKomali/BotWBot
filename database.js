const Database = require("@replit/database")
let db = new Database()
let setValue = (n, v) => {
  db.set(n, v).then(()=>{})
}
let getValue = db.get

exports.setValue = setValue
exports.getValue = getValue
exports.db = db
