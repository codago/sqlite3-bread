
const express = require('express')
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const DATA_PATH = path.resolve(__dirname, "./database/data.db");
const db = new sqlite3.Database(DATA_PATH);
app.use(bodyParser.urlencoded({ extended: true }))

//console.log(DATA_PATH);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname,'public')))

app.use(function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-cache");
  next();
});


app.get('/', function (req, res) {
  let id, string, integer, float, date, boolean, filter = false;
  let bagianWhere     = [];
  let halaman         = Number(req.query.page) || 1;
  let url             =  "/?page=1" ;
  if (url.indexOf('&cari=') != -1){
    halaman = 1;
  }
  url = url.replace('&cari=','')


  if(typeof req.query.cek_id !== 'undefined'){
    bagianWhere.push ( `id='${req.query.id}'` );
    filter = true;
  }
  if(typeof req.query.cek_string !== 'undefined'){
    bagianWhere.push ( `string='${req.query.string}'` );
    filter = true;
  }
  if(typeof req.query.cek_integer !== 'undefined'){
    bagianWhere.push ( `integer='${req.query.integer}'` );
    filter = true;
  }
  if(typeof req.query.cek_float !== 'undefined'){
    bagianWhere.push ( `float='${req.query.float}'` );
    filter = true;
  }
  if(typeof req.query.cek_date !== 'undefined'){
    bagianWhere.push ( `date='${req.query.date}'`);
    filter = true;
  }
  if(typeof req.query.cek_boolean !== 'undefined'){
    bagianWhere.push ( `boolean='${req.query.boolean}'` );
    filter = true;
  }
  let get_links = req.originalUrl;
  var the_arr = get_links.split('&page');
  if(get_links.includes("?page"))
  the_arr = get_links.split('?page');
  let get_link = the_arr[0];

  if(get_link.length > 1){
    get_link = get_link + "&";
  }else {
    get_link = get_link + "?";
  }
  let sql = 'SELECT count(id) AS totalRecord FROM data';
  if(filter){
    sql += ' WHERE ' + bagianWhere.join(' AND ');
  }
  db.all(sql, (err, data) => {
    let totalRecord   = data[0].totalRecord;
    let limit         = 3;
    let offset        = (halaman-1)*limit;
    let jumlahHalaman  = (totalRecord == 0) ? 1 : Math.ceil(totalRecord/limit);
    sql =  `SELECT * FROM data`
    if(filter){
      sql += ' WHERE ' + bagianWhere.join(' AND ');
    }
    sql+= ` LIMIT ${limit} OFFSET ${offset}`
    db.all(sql, (err, data) => {
      res.render('list', {title: "SQLITE 3", data:data, halaman:halaman,get_link:get_link, jumlahHalaman: jumlahHalaman, query: req.query, url:url });
    });
  });
});



app.get('/add', function (req, res) {
  res.render('add')
})

app.post('/add', function (req, res) {
  let { string, integer, float, date, boolean} =req.body
  db.run("INSERT INTO data (string, integer, float, date, boolean) VALUES ('"+ string +"', "+ integer +", '"+ float +"', '"+ date +"', '"+ boolean +"')",function(err, row) {

    if (err){
      console.err(err);
      res.send(err);
    }else{
      res.redirect('/')
    }
  });
})

app.get('/edit/:id', function (req, res) {

  db.get("SELECT * FROM data WHERE id = " + req.params.id ,function(err, row) {

    if (err){
      console.log(err);
      res.send(err);
    }else{

      res.render('edit',{data:row})
    }
  })
})

app.post('/edit/:id', function (req, res) {
  let { string, integer, float, date, boolean} =req.body
  db.run("UPDATE data SET string='"+ string +"', integer="+ Number(integer) +", float='"+ float +"', date='"+ date +"', boolean='"+ boolean +"' WHERE id=" + req.params.id ,function(err, row) {
    if (err){
      console.log(err);
      res.send(err);
    }else{
      res.redirect('/')
    }
  })
})

app.get('/delete/:id', function (req, res) {
  let { string, integer, float, date, boolean} =req.body
  db.run("DELETE FROM data  WHERE id=" + req.params.id ,function(err, row) {
    if (err){
      console.log(err);
      res.send(err);
    }else{
      res.redirect('/')
    }
  })
})


app.listen(3000, function () {
  console.log('server jalan di port 3000')
})
