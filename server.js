const express = require('express')
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const DATA_PATH = path.join(__dirname, './db/test.db');
var db = new sqlite3.Database(DATA_PATH, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the deepweb database.');
}); //list 7 - 11 connection

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.set('portMarkus', 3000)
// console.log(__dirname+'/views')
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(function (req, res, next){
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache');
  next()
});

//router
app.get('/', function(req, res) {
  console.log(req.url);
  var url = (req.url == "/") ? "/?page=1" : req.url;
  //filter
  var filter = []
  var isFilter = false;
  var sql = 'SELECT count(*) AS total FROM user'
  if(req.query.cid && req.query.id){
    filter.push(`id = '${req.query.id}'`);
    isFilter = true;
  }
  if(req.query.cstring && req.query.string){
    filter.push(`string = '${req.query.string}'`);
    isFilter = true;
  }
  if(req.query.cinteger && req.query.integer){
    filter.push(`integer = '${Number(req.query.integer)}'`);
    isFilter = true;
  }
  if(req.query.cfloat && req.query.float){
    filter.push(`float = '${parseFloat(req.query.float)}'`);
    isFilter = true;
  }
  if(req.query.cdate && req.query.startdate && req.query.enddate){
    filter.push(`date BETWEEN '${req.query.startdate}' AND '${req.query.enddate}'`);
    isFilter = true;
  }
  if(req.query.cboolean && req.query.boolean){
    filter.push(`boolean = '${JSON.parse(req.query.boolean) ? 'true' : 'false'}'`);
    isFilter = true;
  }
  if(isFilter){
    sql += ' WHERE ' + filter.join(' AND ')
  }
  console.log(sql);
  // count record on table
  db.all(sql, (err, data) => {
    if (err) {
      console.error(err)
      return res.send(err);
    }
    // pagination
    var page = Number(req.query.page) || 1
    var limit = 3
    var offset = (page-1) * 3
    var total = data[0].total;
    var pages = (total == 0) ? 1 : Math.ceil(total/limit);
    sql = "SELECT * FROM user";
    if(isFilter){
      sql += ' WHERE ' + filter.join(' AND ')
    }
    sql += ` LIMIT ${limit} OFFSET ${offset}`;
    // select with pagination
    db.all(sql, (err, rows) => {
      if (err) {
        console.error(err)
        return res.send(err);
      }
      res.render('list', {title: "BREAD",header: "BREAD", rows: rows, pagination:{page: page, limit: limit, offset: offset, pages: pages, total: total, url: url}, query: req.query});
    });
  });
});

app.get('/add', function(req,res) {
  res.render('add', {title: "Test | add"});
});


app.post('/add', function(req,res) {
  // console.log(typeof req.body.boolean);
  var string = req.body.string;
  var integer = parseInt(req.body.integer);
  var float = parseFloat(req.body.float);
  var date = req.body.date;
  var boolean = req.body.boolean;

  db.run("INSERT INTO user (string,integer,float,date,boolean) VALUES (? ,? ,? ,? ,?)", string, integer, float, date, boolean, function(err){
    if (err) {
      console.error(err);
      return res.send(err);
    }
    res.redirect('/');
  }) ;
});

app.get('/edit/:id', function(req,res) {
  var id = req.params.id;
  // console.log(id);
  db.all("SELECT * FROM user WHERE id = ?", [id], function(err, rows){
    if (err) {
      console.error(err);
      return res.send(err);
    }
    console.log(rows);
    if (rows.length > 0) {
      // console.log(rows[0]);
      res.render('edit', {title: "Test | edit", item: rows[0] });
    } else{
      res.send('Undefined!')
    }
  })
});

app.post('/edit/:id', function(req,res) {
  var id = req.params.id
  var string = req.body.string;
  var integer = parseInt(req.body.integer);
  var float = parseFloat(req.body.float);
  var date = req.body.date;
  var boolean = req.body.boolean;

  db.run("UPDATE user SET string=?, integer=?, float=?, date=?, boolean=? WHERE id = ?", [string, integer, float, date, boolean, id], function(err){
    res.redirect('/');
  }) ;
});

app.get('/delete/:id', function(req, res){
  var id = req.params.id;
  db.all("DELETE FROM user WHERE id = ?", [id], function(err, rows){
    if (err) {
      console.error(err);
      return res.send(err);
    }
    res.redirect('/');
  })
});

app.listen(3000, function(){
  console.log("server jalan di port 3000");
})
