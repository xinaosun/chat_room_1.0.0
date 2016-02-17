var knex = require('knex')({
  client: 'sqlite3',
  connection: {
    host     : '127.0.0.1',
    user     : 'root',
    password : '',
    database : 'infor_chatroom',
    //charset  : 'utf8'
  }
});
 
var bookshelf = require('bookshelf')(knex);
 
var User = bookshelf.Model.extend({
  tableName: 'users'
});
