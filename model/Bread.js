"use strict"

class Bread {
    constructor() {
        this.data = []
    }

    static createTable(db) {
        db.serialize(function () {
            db.run("CREATE TABLE IF NOT EXISTS data(dataID PRIMARY KEY,string TEXT NOT NULL,integer INTEGER NOT NULL,float FLOAT NOT NULL,date DATE NOT NULL, boolean BOOLEAN NOT NULL);", function (err) {
                if (err) console.log(err)
                else {
                    console.log("Table data created");
                }
            })
        })
    }

    readAll(db, cb) {
        db.all(`SELECT * FROM data`, function (err, data) {
            cb(data)
        })
    }

    pageIndex(db, skip, cb) {
        db.all(`SELECT * FROM data limit 5 offset ${skip};`, function (err, data) {
            cb(data)
        })
    }

    filterAll(db, id, string, integer, float, startDate, endDate, boolean, cb) {
      let arrArg = [id,string,integer,float,boolean,startDate];
      let arrDatabase = ['dataID','string','integer','float','boolean','date'];
      let tempStr = ``;
      let count = 0;
      for(let i=0;i<arrArg.length;i++){

      if(i<5){
        if(arrArg[i] === "Choose the boolean ...")count--;
        if(arrArg[i]){
          count++;
          if(count === 1){
            tempStr = arrDatabase[i] +` = `+ `'${arrArg[i]}'`;
          }else if(count > 1){
            tempStr += ' and '+arrDatabase[i] +` = `+ `'${arrArg[i]}'`;
          }
        }
        if(i === arrArg.length-1){
          if(count === 0){
            tempStr = `dataID = '${arrArg[0]}'`
          }
        }
      }else if(i>=5){
        arrArg[6] = endDate;
        if(arrArg[i] && arrArg[i+1]){

          count++;
          if(count === 1){
            tempStr = arrDatabase[i] +` between `+ `'${arrArg[i]}'`+"and"+`'${arrArg[i+1]}'`
          }else if(count > 1){
            tempStr += ' and '+arrDatabase[i] +` between `+ `'${arrArg[i]}'`+"and"+`'${arrArg[i+1]}'`
          }
        }

        if(i === arrArg.length-2){
          if(count === 0){
            tempStr = `dataID = '${arrArg[0]}'`
          }
        }
        arrArg.pop();
      }
    }

          db.all(`SELECT * FROM data WHERE ${tempStr};`, function (err, data) {
              cb(data)
          })
    }

    pageIndexFilter(db, id, string, integer, float, startDate, endDate, boolean,skip, cb) {
      let arrArg = [id,string,integer,float,boolean,startDate];
      let arrDatabase = ['dataID','string','integer','float','boolean','date'];
      let tempStr = ``;
      let count =0;
      for(let i=0;i<arrArg.length;i++){

      if(i<5){

        if(arrArg[i] === "Choose the boolean ..."){
          arrArg[i] = null;
        }else if(arrArg[i]){
          count++;
          if(count === 1){
            tempStr = arrDatabase[i] +` = `+ `'${arrArg[i]}'`;
          }else if(count > 1){
            tempStr += ' and '+arrDatabase[i] +` = `+ `'${arrArg[i]}'`;
          }
        }
      }else if(i>=5){
        arrArg[6] = endDate;
        if(arrArg[i] && arrArg[i+1]){
          count++;
          if(count === 1){
            tempStr = arrDatabase[i] +` between `+ `'${arrArg[i]}'`+"and"+`'${arrArg[i+1]}'`
          }else if(count > 1){
            tempStr += ' and '+arrDatabase[i] +` between `+ `'${arrArg[i]}'`+"and"+`'${arrArg[i+1]}'`
          }
        }

        if(i === arrArg.length-2){
          if(count === 0){
            tempStr = `dataID = '${arrArg[0]}'`
          }
        }
        arrArg.pop();
      }
    }
      console.log(tempStr);
        db.all(`SELECT * FROM data WHERE ${tempStr} limit 5 offset ${skip};`, function (err, data) {
            cb(data)
        })
    }


    findById(db, id, cb) {
        db.all(`SELECT * FROM data WHERE data.dataID = '${id}'`, function (err, data) {
            cb(data);
        })
    }

    edit(db, id, string, integer, float, date, boolean) {

        db.all(`UPDATE data SET string = '${string}', integer = '${integer}', float = '${float}', date = '${date}', boolean = '${boolean}' WHERE dataID = '${id}';`, function (err) {
            if (err) console.log(err)
        })
    }

    add(db, string, integer, float, date, boolean) {
        db.all(`INSERT INTO data (dataID,string,integer,float,date,boolean) VALUES ('${Date.now()}','${string}','${integer}','${float}','${date}','${boolean}');`, function (err) {
            if (err) console.log(err)
        })
    }

    delete(db, id) {
        db.all(`DELETE FROM data WHERE dataID = '${id}';`, function (err) {
            if (err) console.log(err);
        })
    }
}

export { Bread as default }
