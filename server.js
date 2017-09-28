"use strict"

const express = require ('express');
const app = express();
const path = require('path');
const bodyParser= require('body-parser')
const sqlite3 = require('sqlite3').verbose();
const DATA_PATH = path.resolve(__dirname, "./database/bread.db");
const db = new sqlite3.Database(DATA_PATH);
app.use(bodyParser.urlencoded({extended:true}))

app.set('views', path.join(__dirname,'views'));
app.set('view engine','ejs');
app.use(express.static(path.join(__dirname,'public')))

app.use(function(req, res, next){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Cache-Control','no-cache');
  next();
})


app.get('/',function(req, res){
  let id,string,integer,float,date,boolean,filter=false;
  let bagianWhere =[];
  let halaman = Number(req.query.page) || 1;
  // let url = (req.url =="/") ? "/?page=1":req.url;
  let url = "/?page=1";
  if(url.indexOf('&cari=') != -1){
    halaman =1;
  }
  url = url.replace('&cari=','');

  // if(typeof req.query.cek_id !== 'undefined'){
  //   bagianWhere.push(`id='${req.query.id}'`);
  //   filter = true;
  // }

  if(typeof req.query.cek_id !== 'undefined'){
    bagianWhere.push(`id='${req.query.id}'`);
    filter = true;
  }
  if(typeof req.query.cek_string !== 'undefined'){
    bagianWhere.push(`string='${req.query.string}'`);
    filter = true;
  }

  if(typeof req.query.cek_integer !== 'undefined'){
    bagianWhere.push(`integer='${req.query.integer}'`);
    filter = true;
  }
  if(typeof req.query.cek_float !== 'undefined'){
    bagianWhere.push(`float='${req.query.float}'`);
    filter = true;
  }
  if(typeof req.query.cek_date !== 'undefined'){
    bagianWhere.push(`date='${req.query.date}'`);
    filter = true;
  }
  if(typeof req.query.cek_boolean !== 'undefined'){
    bagianWhere.push(`boolean='${req.query.boolean}'`);
    filter = true;
  }


  let sql = 'SELECT count(id) AS totalRecord FROM Datahasil ';
  if (filter){
    sql += ' WHERE ' + bagianWhere.join('AND');
  }
  db.all(sql,( err,data) => {
    let totalRecord = data[0].totalRecord;
    let limit =3;
    let offset = (halaman-1)*limit;
    let jumlahHalaman = (totalRecord == 0) ? 1: Math.ceil(totalRecord/limit);
    sql = `SELECT * FROM Datahasil `
    if(filter){
      sql += ' WHERE ' + bagianWhere.join('AND');
    }
    sql += ` LIMIT ${limit} OFFSET ${offset}`
    db.all(sql,(err,data) => {
      // console.log(data)
      res.render('list',{title: "SQLITE3", data:data, halaman:halaman,jumlahHalaman:jumlahHalaman,query:req.query,url:url});
      });
    });
  });

app.get('/add',function(req, res){
  res.render('add');
})

app.post('/add',function(req, res){
  // let {string, integer, float, date, boolean} =req.body
  let string = req.body.string;
  let id = Date.now();
  let date =req.body.date;
  let float=req.body.float;
  let integer=req.body.integer;
  let boolean=req.body.boolean;

    db.run("INSERT INTO Datahasil (string, integer, float, date, boolean) VALUES ('"+ string +"', "+ integer +", '"+ float +"', '"+ date +"', '"+ boolean +"')",function(err, row) {
        if (err){
            console.log(err);
            res.send(err);
          }else{
            res.redirect('/')
        }
      });
})





//   fs.readFile(DATA_PATH, function(err, data){
//     if(err){
//       console.error(err);
//       res.send(err);
//     }else{
//       var data=JSON.parse(data);
//       data.push({id:id,
//                 string:req.body.string,
//                 integer: req.body.integer,
//                 float: req.body.float,
//                 date: req.body.date,
//                 name: req.body.name,
//                 boolean: req.body.boolean})
//     }
//     fs.writeFile(DATA_PATH, JSON.stringify(data, null, 3), function(err) {
//       if(err) {
//         console.error(err);
//         res.send(err)
//       } else {
//         res.redirect('/')
//       }
//     })
//   })
// });

app.get('/edit/:id',function(req, res){
  db.get("SELECT * FROM Datahasil WHERE id = " + req.params.id ,function(err, row) {
      if (err){
          console.log(err);
          res.send(err);
        }else{
          res.render('edit',{data:row})
      }
  })
})


app.post('/edit/:id',function(req,res){
    // let { string, integer, float, date, boolean} =req.body
    let string = req.body.string;
    let id = Date.now();
    let date =req.body.date;
    let float=req.body.float;
    let integer=req.body.integer;
    let boolean=req.body.boolean;
    db.run("UPDATE Datahasil SET string='"+ string +"', integer="+ Number(integer) +", float='"+ float +"', date='"+ date +"', boolean='"+ boolean +"' WHERE id=" + req.params.id ,function(err, row) {
      if (err){
          console.log(err);
          res.send(err);
        }else{
          res.redirect('/')
    }
  })
})


app.get('/delete/:id',function(req, res){
  // let { string, integer, float, date, boolean} =req.body
  let string = req.body.string;
  let id = Date.now();
  let date =req.body.date;
  let float=req.body.float;
  let integer=req.body.integer;
  let boolean=req.body.boolean;
  db.run("DELETE FROM Datahasil  WHERE id=" + req.params.id ,function(err, row) {
    if (err){
        console.log(err);
        res.send(err);
      }else{
        res.redirect('/')
  }
})
})




  app.listen(3000,function(){
    console.log("server jalan di port 3000");
  })
