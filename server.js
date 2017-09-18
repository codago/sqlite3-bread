const express = require('express');
const app = express();
const path = require('path')

const bodyParser = require('body-parser');

var sqlite3 = require('sqlite3').verbose();
const DATA_PATH = path.join(__dirname, './db/bread.db');
var db = new sqlite3.Database(DATA_PATH, (err) => {
  if (err) {
    console.log(err.message);
  }
  console.log('Connected to my deepweeb Database.');
});

console.log(DATA_PATH);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname,'public')))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-control', 'no-cache');
  next();
});


app.get('/', function(req, res) {
  var url = (req.url == "/") ? "/?page=1" : req.url;
  var page = Number(req.query.page) || 1
  if(url.indexOf('&submit=') != -1){
    page = 1;
  }
  url = url.replace('&submit=', '')
  //filter
  var filter = []
  var isFilter = false;
  var sql = 'SELECT count(*) AS total FROM bread'
  if(req.query.check_id && req.query.id){
    filter.push(`id = '${req.query.id}'`);
    isFilter = true;
  }
  if(req.query.check_string && req.query.string){
    filter.push(`string = '${req.query.string}'`);
    isFilter = true;
  }
  if(req.query.check_integer && req.query.integer){
    filter.push(`integer = '${Number(req.query.integer)}'`);
    isFilter = true;
  }
  if(req.query.check_float && req.query.float){
    filter.push(`float = '${parseFloat(req.query.float)}'`);
    isFilter = true;
  }
  if(req.query.check_date && req.query.startdate && req.query.enddate){
    filter.push(`date BETWEEN '${req.query.startdate}' AND '${req.query.enddate}'`);
    isFilter = true;
  }
  if(req.query.check_boolean && req.query.boolean){
    filter.push(`boolean = '${JSON.parse(req.query.boolean) ? 'true' : 'false'}'`);
    isFilter = true;
  }
  if(isFilter){
    sql += ' WHERE ' + filter.join(' AND ')
  }

  // count record on table
  db.all(sql, (err, data) => {
    if (err) {
      console.error(err)
      return res.send(err);
    }
    // pagination
    var limit = 3
    var offset = (page-1) * 3 //
    var total = data[0].total;
    var pages = (total == 0) ? 1 : Math.ceil(total/limit);
    sql = "SELECT * FROM bread";
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
  res.render('add', {title: "Add"});
});

app.post('/add', function(req,res) {
  var id = Date.now()
  string = req.body.string,
  integer = req.body.integer,
  float = req.body.float,
  date = req.body.date,
  boolean = req.body.boolean

  db.run("INSERT INTO bread (string, integer, float, date, boolean) VALUES (?, ?, ?, ?, ?)", [string, integer, float, date, boolean], function(err){
    res.redirect('/');
  });
});

app.get ('/edit/:id', function (req, res){
  let id = req.params.id
  db.all("SELECT * FROM bread WHERE id = ?", [id], (err, rows)=>{
    if(err) {
      console.error(err)
      return res.send(err);
    }
    if(rows.length > 0){
      res.render('edit', {title: 'edit', item: rows[0]});
    }else{
      res.send('Data Not Found');
    }
  })
})

app.post('/edit/:id', function(req,res) {
  var id = Number(req.params.id)
  var string = req.body.string;
  var integer = req.body.integer;
  var float = req.body.float;
  var date = req.body.date;
  var boolean = req.body.boolean;

  db.run("UPDATE bread SET string = ?, integer = ?, float = ? , date = ?, boolean = ? WHERE id=?", [string, integer, float, date, boolean, id], function(err){
    res.redirect('/');
  });
});

app.get ('/delete/:id', function(req,res) {
  var id = req.params.id
  db.all ("DELETE FROM bread Where id=?", [id], (err,rows) =>{
    if(err) {
      console.error(err)
      return res.send(err);
    }
    if(rows.length > 0){
      res.render('delete', {item: rows[0]});
    }else{
      res.redirect('/');
    }
  })
})


app.listen(3000, function() {
  console.log("server is online")
});
