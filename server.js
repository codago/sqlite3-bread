
const sqlite3 = require("sqlite3").verbose();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');;
const path = require ('path')

//koneksi
let db = new sqlite3.Database('./database/bread.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to  database.');
});
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.urlencoded({extended: true}));

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-control', 'no-cache');
  next();
});

//router
app.get('/', function(req, res) {
  let url = (req.url == "/") ? "/?page=1" : req.url;
  //filter
  let filter = []
  let isFilter = false;
  let sql = 'SELECT count(*) AS total FROM bread'
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
  // console.log(sql,'satu');
// count record on table
db.all(sql, (err, data) => {
  if (err) {
    console.error(err)
    return res.send(err);
  }
  //pagination
  let page = Number(req.query.page) || 1
  let limit = 3
  let offset = (page-1) * 3
  if(isFilter){
    offset = 0
  }
  let total = data[0].total;
  let pages = (total == 0) ? 1 : Math.ceil(total/limit);
  sql = "SELECT * FROM bread";
  if(isFilter){
    sql += ' WHERE ' + filter.join(' AND ')
  }
  sql += ` LIMIT ${limit} OFFSET ${offset}`;

  // select with pagination
  // console.log(sql,'dua');
  db.all(sql, (err, data) => {
    if (err) {
      console.error(err)
      return res.send(err);
    }
    res.render('list', {title: "BREAD",header: "BREAD", data: data, pagination:{page: page, limit: limit, offset: offset, pages: pages, total: total, url: url}, query: req.query});
  });
});
});

//
app.get('/add', function(req,res) {
  res.render('add');
});
app.post('/add', function(req, res) {

  var id = req.body.id;
  var string = req.body.string;
  var integer = parseInt(req.body.integer);
  var float = parseFloat(req.body.float);
  var date = req.body.date;
  var boolean = req.body.boolean;
  db.run(`INSERT INTO bread(string, integer, float, date, boolean)VALUES(?,?,?,?,?)`, [string, integer, float, date, boolean], (err) => {
    if(err) {
      console.error(err)
      return res.send(err);
    }
    res.redirect('/')
  })
})

app.get('/edit/:id', function(req,res) {
  let id = req.params.id
  db.all("SELECT * FROM bread WHERE id = ?", [id], (err, data)=>{
    if(err) {
      console.error(err)
      return res.send(err);
    }
    if(data.length > 0){
      res.render('edit', {item: data[0]});
    }else{
      res.send('Data Not Found');
    }
  })
})

app.post('/edit/:id', function(req, res){
  let id = req.params.id
  var string = req.body.string;
  var integer = parseInt(req.body.integer);
  var float = parseFloat(req.body.float);
  var date = req.body.date;
  var boolean = req.body.boolean;
  db.run("UPDATE bread SET string=?, integer=?, float=?, date=?, boolean=? WHERE id=?" ,[string,integer,float,date,boolean,id],(err) => {
    if (err) {
      console.error(err)
      return res.send(err);
    }
    res.redirect('/')
  })
})

app.get('/delete/:id', function (req, res){
  // let id = Number(req.params.id)
  db.all("DELETE FROM bread WHERE id = ?" ,[req.params.id],(err) => {
    if (err) {
      console.error(err)
      return res.send(err);
    }
    res.redirect('/')
  })
})

app.listen(3000, function(){
  console.log("server is Functioning")
})
