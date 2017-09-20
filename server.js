"use strict"

const express = require('express')
const app = express()
const path = require('path')
const fs = require('fs')
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended : true}))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))

app.use(function( req, res, next){
	res.setHeader('Acsess-Control-Allow-Origin', '*')
	res.setHeader('Ceach-Control', 'no-cache')
	next()
})

let db = new sqlite3.Database(path.join(__dirname ,'./database/bread.db'), sqlite3.OPEN_READWRITE, (err) => {
	if (err) {
		console.error(err.message);
	}
	console.log('database');
});
//console.log(db);

app.get('/',function(req, res){
	//filter
	let filter =[]
	let isFilter =false;
	if (req.query.cid && req.query.id) {
		filter.push(`id = '${parseInt(req.query.id)}'`)
		isFilter = true;
	}if (req.query.cstring && req.query.string) {
		filter.push(`string = '${req.query.string}'`)
		isFilter = true;
	}if (req.query.cinteger && req.query.integer) {
		filter.push(`integer = '${Number(req.query.integer)}'`)
		isFilter = true;
	}if (req.query.cfloat && req.query.float) {
		filter.push(`float = '${parseFloat(req.query.float)}'`)
		isFilter = true;
	}if(req.query.cdate && req.query.startdate && req.query.enddate){
		filter.push(`date BETWEEN '${req.query.startdate}' AND '${req.query.enddate}'`);
		isFilter = true;
	}if (req.query.cboolean && req.query.boolean) {
		filter.push(`boolean = '${req.query.boolean}'`)
		isFilter = true;
	}
	let sql = 'SELECT count(*) AS total FROM bread'
	if (isFilter) {
		sql += ` WHERE ${filter.join(' AND ')}`
	}
	//console.log(sql,'satu');
	db.all(sql, (err, data) => {
		if (err) {
			console.error(err)
			return res.send(err);
		}
		// pagination
		let page = Number(req.query.page) || 1
		let limit = 3;
		let offset = (page-1) * 3;
		let total = data[0].total;
		let pages = (total == 0) ? 1 : Math.ceil(total/limit);
		let url = (req.url == "/") ? "/?page=1" : req.url;
		sql = "SELECT * FROM bread";
		if (isFilter) {
			sql += ` WHERE ${filter.join(' AND ')}`
		}
		sql += ` LIMIT ${limit} OFFSET ${offset}`;
		//console.log(sql, 'dua');
		db.all(sql, (err, data)=>{
			if (err) {
				console.error(err)
				return res.send(err);
			}
			res.render('list', {title: "BREAD", header: "BREAD", data : data, pagination: {page: page, limit: limit, offset: offset, pages: pages, total: total, url: url}, query: req.query});
		})
	});
});

app.get('/add', function(req, res) {
	res.render('add')
})

app.post('/add', function(req, res) {
	var string = req.body.string;
	var integer = parseInt(req.body.integer);
	var float = parseFloat(req.body.float);
	var date = req.body.date;
	var boolean = req.body.boolean;
	db.run(`INSERT INTO bread(string, integer, float, date, boolean)VALUES(?,?,?,?,?)`, [string, integer, float, date, boolean], (err) => {
		if(err) {
			console.error(err);
			return res.send(err);
		}
		res.redirect('/')
	})
})

app.get('/edit/:id', function(req, res) {
	let id = req.params.id
	console.log(id);
	db.all("SELECT * FROM bread WHERE id = ?", [id], (err, data)=>{
		if (err) {
			console.error(err);
			return res.send(err);
		}
		if (data.length > 0) {
			res.render('edit', {item : data[0]});
		}else{
			res.render('Data Tidak ada')
		}
	})
})

app.post('/edit/:id', function(req, res) {
	let id =  parseInt(req.params.id);
	let string = req.body.string;
	let integer = parseInt(req.body.integer);
	let float = parseFloat(req.body.float);
	let date = req.body.date;
	let boolean = req.body.boolean;
	db.run(`UPDATE bread SET string='${string}', integer='${integer}', float='${float}', date='${date}', boolean='${boolean}' WHERE id='${id}'`, [],(err)=>{
		if(err){
			console.error(err);
			return res.send(err);
		}
		res.redirect('/');
	})
})

app.get('/delete/:id', function(req, res){
	let id =Number(req.params.id)
	db.run("DELETE FROM bread WHERE id=?", [id], (err)=>{
		if (err) {
			console.error(err);
			return res.send(err);
		}
		res.redirect('/');

	})
})

app.listen(3000, function(){
	console.log("port");
})
