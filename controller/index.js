const express = require('express');
const app     = express();
const path    = require('path');
const sqlite3 = require('sqlite3').verbose();
const body    = require('body-parser');
const db      = new sqlite3.Database('../model/table.db', (err) => {
                  if (err) {
                    return console.error(err.message);
                  }
                  console.log('Connected to table.db database.');
                  });

db.serialize()//agar perintah sqlite3 nya serial
db.run('CREATE TABLE IF NOT EXISTS anggota (id INTEGER PRIMARY KEY AUTOINCREMENT,'+
      'nama TEXT NOT NULL, umur INTEGER NOT NULL, tinggi REAL NOT NULL,'+
      'tanggal_lahir TEXT NOT NULL, status TEXT NOT NULL) ;');

app.set('view engine', 'ejs'); // mendeklarasikan view engine
app.set('views', path.join(__dirname, '../view'));// mendefenisikan folder views
app.use(express.static(path.join(__dirname,'../public')))// agar file css bisa di akses di ejs
app.use(body.urlencoded({extended: true})); // agar body parser bisa digunakan

app.listen(3000, function(){
  console.log("server siap");
});

//###### menampilkan semua data dari database
app.get('/', function(req, res){

  let bagianWhere     = [];
  let where_status    = false;
  let idChecked       = req.query.idChecked;
  let id              = req.query.id;
  let namaChecked     = req.query.namaChecked;
  let nama            = req.query.string
  let umurChecked     = req.query.umurChecked;
  let umur            = req.query.integer;
  let tinggiChecked   = req.query.tinggiChecked;
  let tinggi          = req.query.float;
  let dateChecked     = req.query.dateChecked;
  let start_date      = req.query.start_date
  let end_date        = req.query.end_date;
  let statusChecked   = req.query.statusChecked;
  let status          = req.query.boolean;
  let halaman         = Number(req.query.page) || 1;
  let url             = (req.url == "/") ? "/?page=1" : req.url;
  if (url.indexOf('&cari=') != -1){
    halaman = 1;
  }
  url = url.replace('&cari=','')
  if(idChecked){
    bagianWhere.push( `id='${id}'` );
    where_status = true;
  }

  if(namaChecked){
    bagianWhere.push( `nama='${nama}'` );
    where_status = true;
  }

  if(umurChecked){
    bagianWhere.push( `umur='${umur}'` );
    where_status = true;
  }

  if(tinggiChecked){
    bagianWhere.push( `tinggi='${tinggi}'` );
    where_status = true;
  }

  if(dateChecked){
    bagianWhere.push(`tanggal_lahir BETWEEN '${req.query.start_date}' AND '${req.query.end_date}'`);
    where_status = true;
  }

  if(statusChecked){
    bagianWhere.push( `status='${status}'` );
    where_status = true;
  }


  let sql = 'SELECT count(id) AS totalRecord FROM anggota';
  if(where_status){
    sql += ' WHERE ' + bagianWhere.join(' AND ');
  }

  db.all(sql, (err, data) => {
    let totalRecord   = data[0].totalRecord;
    let limit         = 3;
    let offset        = (halaman-1)*limit;
    let jumlahHalaman  = (totalRecord == 0) ? 1 : Math.ceil(totalRecord/limit);
    sql =  `SELECT * FROM anggota`
    if(where_status){
      sql += ' WHERE ' + bagianWhere.join(' AND ');
    }
    sql+= ` LIMIT ${limit} OFFSET ${offset}`
      db.all(sql, (err, data) => {
        res.render('index', {title: "SQLITE 3", data:data, halaman:halaman, jumlahHalaman: jumlahHalaman, query: req.query, url:url });
      });
  })
});

//############ tampilkan hasil cari #################
app.post('/', function(req,res){


  db.all(sql, (err, totalHitung) => {
    if (err) {
      console.error(err)
      return res.send(err);
    }
    console.log('total hitung:', totalHitung[0].totalRecord);

    let halamanAwal   = 1;
    let limit         = 2;
    let offset        = (halamanAwal-1) * 2;
    let totalHalaman  = (totalHitung[0].totalRecord > 1) ? 1 : Math.ceil(totalHitung/limit);

    sql = `SELECT * FROM anggota`;
      if(where_status){
        sql += ' WHERE ' + bagianWhere.join(' AND ');
        console.log(sql);
      }
    sql += `LIMIT ${limit} OFFSET ${offset}`;
    db.all(sql, (err, data) => {
      if (err) {
        console.error(err)
        return res.send(err);
      }
      res.render('index', {title: "SEARCH", data:data});
    });//penutup db.all data untuk di render ke index
  });//penutup db.all totalHitung

//
//   // let halaman = Number(req.query.page) || 1;
//   // let batas   = 5;
//   // let offset  = (halaman-1) * 5;
//   // let total   = data[0].total;
//   // let pages   = (total == 0) ? 1 : Math.ceil(total/batas);

}); // penutup app.post('/search')

//#############LINK TAMBAH DATA################
app.get('/add', function(req,res){
    res.render('add',{title: "ADD"});
});

//###### menambahkan data ke database #############
app.post('/add', function(req,res){
    let string      = req.body.string;
    let integer     = req.body.integer;
    let float       = req.body.float;
    let date        = req.body.date;
    let boolean     = req.body.boolean;

    db.run('INSERT INTO anggota (nama, umur, tinggi, tanggal_lahir, status ) VALUES (?,?,?,?,?)', [string,integer,float,date,boolean], function(err) {
      if (err) {
        return console.log(err.message);
      }
    });
  res.redirect('/');
});


// ################### KE FORM EDIT #########################
app.get('/edit/:id', function(req,res){
  db.all('SELECT * FROM anggota', [], (err, data) => {
      if (err) {
        throw err;
      }
      let panjang = data.length;
      let id    = Number(req.params.id);
      let item  = null;
      let id_data   = 0;
      for (var i = 0; i<data.length; i++){
          if(data[i].id == id){
            item = data[i];
            id_data = item.id;
            break;
          }
      }
      res.render('edit',{title:"EDIT", data:item})
    });
  });

//############ simpan hasil edit #################
app.post('/edit/:id', function(req,res){
      let id          = req.body.id;
      let string      = req.body.string;
      let integer     = req.body.integer;
      let float       = req.body.float;
      let date        = req.body.date;
      let boolean     = req.body.boolean;

      db.run(`UPDATE anggota SET nama='${string}', umur='${integer}', tinggi='${float}', tanggal_lahir='${date}', status='${boolean}' WHERE id='${id}'`, function(err) {
        if (err) {
          return console.log(err.message);
        }
      });
    res.redirect('/');
  });

//######################### DELETE DATUM ############################################
app.get('/delete/:id', function(req,res){
    let id_delete = Number(req.params.id);
    db.all(`DELETE FROM anggota WHERE id ='${id_delete}'`, [], (err, data) => {
          if (err) {
              throw err;
          }
      res.redirect('/');
    })
});
