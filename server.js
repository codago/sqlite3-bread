const sqlite3 = require("sqlite3").verbose();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');;
const path = require('path');

//koneksi
let db = new sqlite3.Database(path.join(__dirname, 'database/bread.db'), sqlite3.OPEN_READWRITE, (err) => {
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

app.get('/', function(req, res) {
  let filter = []
  let isFilter = false;
  if(req.query.cid && req.query.id){
    filter.push(`id = '${req.query.id}'`)
    isFilter = true;
  }
  if(req.query.cstring && req.query.string){
    filter.push(`string = '${req.query.string}'`)
    isFilter = true;
  }
  if(req.query.cinteger && req.query.integer){
    filter.push(`integer = '${req.query.integer}'`)
    isFilter = true;
  }
  if(req.query.cfloat && req.query.float){
    filter.push(`float = '${req.query.float}'`)
    isFilter = true;
  }
  if(req.query.cdate && req.query.startdate && req.query.enddate){
    filter.push(`date BETWEEN '${req.query.startdate}' AND '${req.query.enddate}'`)
    isFilter = true;
  }
  if(req.query.cboolean && req.query.boolean){
    filter.push(`boolean = '${req.query.boolean}'`)
    isFilter = true;
  }
  let sql = 'SELECT count(*) AS total FROM bread'
  if(isFilter){
    sql += ` WHERE ${filter.join(' AND ')}`
  }
  db.all(sql, (err, data) => {
    if (err) {
      console.error(err);
      return res.send(err);
    }
    let total = data[0].total
    let page = Number(req.query.page) || 1
    let offset = (page - 1) * 3
    let limit = 3
    let pages = (total == 0) ? 1 : Math.ceil(total/limit)
    let url = (req.url == "/") ? "/?page=1" : req.url
    sql = 'SELECT * FROM bread'
    if(isFilter){
      sql += ` WHERE ${filter.join(' AND ')}`
    }
    sql += ` LIMIT ${limit} OFFSET ${offset}`
    db.all(sql, (err, rows) => {
      if (err) {
        console.error(err);
        return res.send(err);
      }
      res.render('list', {title: "BREAD", header: "BREAD", rows : rows, pagination :{page : page, pages : pages, offset : offset, limit : limit, url : url, total : total}, query: req.query});
    });
  });
});

app.get('/add', function(req,res) {
  res.render('add');
});

app.post('/add', function(req, res) {
  var string = req.body.string;
  var integer = parseInt(req.body.integer);
  var float = parseFloat(req.body.float);
  var date = req.body.date;
  var boolean = req.body.boolean;
  db.run(`INSERT INTO bread(string, integer, float, date, boolean) VALUES(?,?,?,?,?)`, [string, integer, float, date, boolean], (err) => {
    if(err) {
      console.error(err);
      return res.send(err);
    }
    res.redirect('/')
  })
})

app.get('/edit/:id', function(req, res){
  db.all('SELECT * FROM bread WHERE id = ?', [req.params.id], (err, rows)=>{
    if(err){
      console.error(err);
      return res.send(err);
    }
    if(rows.length > 0){
      res.render('edit',{item : rows[0]});
    }else{
      res.send('data tidak ditemukan')
    }
  })
})

app.post('/edit/:id', (req,res)=>{
  let id = req.params.id
  var string = req.body.string;
  var integer = parseInt(req.body.integer);
  var float = parseFloat(req.body.float);
  var date = req.body.date;
  var boolean = req.body.boolean;
  db.run(`UPDATE bread SET string = ?, integer = ?, float = ?, date = ?, boolean = ? WHERE id = ?`, [string, integer, float, date, boolean, id], (err) => {
    if(err) {
      console.error(err);
      return res.send(err);
    }
    res.redirect('/')
  })
})

app.get('/delete/:id', (req, res)=>{
  db.all('DELETE FROM bread WHERE id = ?', [req.params.id], (err)=>{
    if(err){
      console.error(err);
      return res.send(err);
    }
    res.redirect('/')
  })
})

// app.get('/edit/:id', function(req, res){
//   fs.readFile(DATA_PATH, function (err, data){
//     if(err){
//       console.error(err)
//       res.send(err);
//     }else{
//       data = JSON.parse(data);
//       var id = Number(req.params.id);
//       var index = data.map(function(x){
//         return x.id;
//       }).indexOf(id);
//       console.log(data[index]);
//       res.render('edit',{item: data[index]});
//     }
//   })
// })
//
// app.post('/edit/:id', function(req, res){
//   fs.readFile(DATA_PATH, function (err, data){
//     if(err){
//       console.error(err)
//       res.send(err);
//     }else{
//       data = JSON.parse(data);
//       var id = Number(req.params.id);
//       var index = data.map(function(x){
//         return x.id;
//       }).indexOf(id);
//       data[index].string= req.body.string;
//       data[index].integer= req.body.integer;
//       data[index].float= req.body.float;
//       data[index].date= req.body.date;
//       data[index].boolean= req.body.boolean;
//       fs.writeFile(DATA_PATH, JSON.stringify(data, null, 3), function(err){
//         if(err){
//           console.error(err)
//           res.send(err);
//         }else{
//           res.redirect('/')
//         }
//       });
//     }
//   });
// })
//
// app.get('/delete/:id', function(req, res){
//   fs.readFile(DATA_PATH, function(err, data){
//     if(err){
//       console.error(err);;
//       res.send(err);
//     }else{
//       data = JSON.parse(data);
//       var id = Number(req.params.id);
//       data = data.filter(function(x){return x.id != id})
//       fs.writeFile(DATA_PATH, JSON.stringify(data, null, 3), function(err){
//         if(err){
//           console.error(err)
//           res.send(err);
//         }else{
//           res.redirect('/')
//         }
//       });
//     }
//   })
// })

app.listen(3000, function() {
  console.log("server is online")
});
