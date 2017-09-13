"use strict"

const sqlite3 = require("sqlite3").verbose();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require ('path');

//connection
let db = new sqlite3.Database(path.join(__dirname, 'db/bread.db'), sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the bread database.');
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
  //filter
  let filter = []
  let isFilter = false;
  let sql = 'SELECT count(*) AS total FROM bread'
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
    filter.push(`boolean = '${JSON.parse(req.query.boolean) ? 1 : 0}'`);
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
    //pagination
    let page = Number(req.query.page) || 1
    let limit = 3
    let offset = (page-1) * 3
    let total = data[0].total;
    let pages = (total == 0) ? 1 : Math.ceil(total/limit);
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
      res.render('list', {title: "BREAD",header: "BREAD", rows: rows, pagination:{page: page, limit: limit, offset: offset, pages: pages, total: total}, query: req.query});
    });
  });
});


app.get('/add', function(req,res) {
  res.render('add');
});
app.post('/add', function(req,res) {
  var string = req.body.string;
  var integer = parseInt(req.body.integer);
  var float = parseFloat(req.body.float);
  var date = req.body.date;
  var boolean = JSON.parse(req.body.boolean);
  db.run("INSERT INTO bread(string,integer,float,date,boolean) VALUES(?,?,?,?,?)",[string,integer,float,date,boolean],(err) => {
    if (err) {
      console.error(err)
      return res.send(err);
    }
    res.redirect('/')
  })
});

app.get('/edit/:id', function(req,res) {
  let id = req.params.id
  db.all("SELECT * FROM bread WHERE id = ?", [id], (err, rows)=>{
    if(err) {
      console.error(err)
      return res.send(err);
    }
    if(rows.length > 0){
      res.render('edit', {item: rows[0]});
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
  var boolean = JSON.parse(req.body.boolean);
  db.run("UPDATE bread SET string=?, integer=?, float=?, date=?, boolean=? WHERE id=?" ,[string,integer,float,date,boolean,id],(err) => {
    if (err) {
      console.error(err)
      return res.send(err);
    }
    res.redirect('/')
  })
})

app.get('/delete/:id', function (req, res){
  let id = Number(req.params.id)
  db.run("DELETE FROM bread WHERE id =?" ,[id],(err) => {
    if (err) {
      console.error(err)
      return res.send(err);
    }
    res.redirect('/')
  })
})

app.listen(3000, function() {
  console.log("Server is Online")
});
