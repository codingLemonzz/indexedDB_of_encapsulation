/**
 * the js code is used for the indexedDB of encapsulation
 *
 * author:zry
 *
 * time:2018.08.28
 **/

let bt_indexedDB = {
    db: '',
    /**
     * judge the indexedDB is supported in the browser.
     * @returns {boolean}
     */
    isSupport: function () {
        /**
         *Browser support：
         *  FireFox 10+（all）、Chrome 23+（all）、Opera15+（all）IE10+（part of）、safari10+、safari fro IOS 10.2+
         */
        let indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB || null;
        return !!indexedDB;
    },
    /**
     * Open database
     * @param dbname(String) ---- database name.
     * @param version(Number) ---- database version,current version must be greater than before,and it should be the type of Integer.
     * @returns
     */
    open: function (dbname, version) {
        return new Promise(resolve => {
            let request = window.indexedDB.open(dbname, version);
            request.onsuccess = function (event) {
                db = event.target.result;
                resolve(true);
            };
            request.onerror = function (error) {
                resolve(false, error);
            }
        });

    },
    /**
     * close database
     * @returns
     */
    closeDB: function () {
        return new Promise(resolve => {
            let request = db.close();
            request.onsuccess = function () {
                resolve(true);
            };
            request.onerror = function (error) {
                resolve(false, error);
            }
        })
    },
    /**
     * delete database
     * @param dbname(String)  ---- database name.
     * @returns
     */
    deleteDB: function (dbname) {
        return new Promise(resolve => {
            let request = window.indexedDB.deleteDatabase(dbname);
            request.onsuccess = function () {
                resolve(true);
            };
            request.onerror = function (error) {
                resolve(false, error);
            }
        });
    },
    /**
     * get database Object.
     * @returns database object
     */
    getDBObject: function(){
        return db;
    },
    /**
     * Open the database,if it doesn't exist,the browser will creat it.
     * @param dbname(String)  ---- database name.
     * @param version(Number)  ---- database version,current version must be greater than before,and it should be the type of Integer.
     * @param tableName(String)  ----table name in this database.
     * @param index(Array)  ---- the indexes that you will create in your table.eg: [{name:indexName,attr:indexAttr,unique:true},......]
     * @param keyPath(String)  ---- the primary key in the table,if it's empty,the indexedDB will create an auto increased primary key.
     * @param data(Array)  ---- the init data in this table.
     * @returns
     */
    createDB: function (dbname, version, tableName, index, keyPath, data) {
        return new Promise(resolve => {
            let request = window.indexedDB.open(dbname, version);
            request.onsuccess = function (event) {
                db = event.target.result;
                resolve(true);
            };
            request.onupgradeneeded = function (event) {
                db = event.target.result;
                let objectStore;
                if (!db.objectStoreNames.contains(tableName)) {
                    if (!!keyPath) {
                        objectStore = db.createObjectStore(tableName, {keyPath: keyPath});
                    } else {
                        objectStore = db.createObjectStore(tableName, {autoIncrement: true});
                    }
                    if (!!index) {
                        for (let i = 0; i < index.length; i++) {
                            objectStore.createIndex(index[i].name, index[i].attr, {unique: index[i].unique});
                        }
                    }
                    if (!!data) {
                        for (let i = 0; i < data.length; i++) {
                            objectStore.add(data[i]);
                        }
                    }
                }
                resolve(true);
            };
            request.onerror = function (error) {
                resolve(false, error);
            }
        });
    },
    /**
     * create table in this database
     * @param tableName(String)  ----table name in this database.
     * @param index(Array)  ---- the indexes that you will create in your table.eg: [{name:indexName,attr:indexAttr,unique:true},......]
     * @param keyPath(String)  ---- the primary key in the table,if it's empty,the indexedDB will create an auto increased primary key.
     * @param data(Array)  ---- the init data in this table.
     * @returns
     */
    createTable: function (tableName, index, keyPath, data) {
        return new Promise(resolve => {
            let objectStore;
            if (!db.objectStoreNames.contains(tableName)) {
                if (!!keyPath) {
                    objectStore = db.createObjectStore(tableName, {keyPath: keyPath});
                } else {
                    objectStore = db.createObjectStore(tableName, {autoIncrement: true});
                }
                if (!!index) {
                    for (let i = 0; i < index.length; i++) {
                        objectStore.createIndex(index[i].name, index[i].attr, {unique: index[i].unique});
                    }
                }
                if (!!data) {
                    for (let i = 0; i < data.length; i++) {
                        objectStore.add(data[i]);
                    }
                }
                resolve(true);
            }else{
                resolve(false);
            }
        });
    },
    /**
     * delete table in this database
     * @param tableName(String)  ---- table name in this database
     * @returns
     */
    deleteTable: function(tableName){
      return new Promise(resolve => {
          let request = db.deleteObjectStore(tableName);
          request.onsuccess = function (event) {
              resolve(true);
          };
          request.onerror = function (error) {
              resolve(false,error);
          };
      });
    },
    /**
     * Save data to the table
     * @param tableName(String) ---- table name
     * @param data(JSON) ---- the data that you save,plz pay attention,this args is type of JSON.
     * @returns
     */
    saveData: function (tableName, data) {
        return new Promise(resolve => {
            let request = db.transaction(tableName, 'readwrite').objectStore(tableName).add(data);
            request.onsuccess = function () {
                resolve(true);
            };
            request.onerror = function (error) {
                resolve(false, error);
            }
        });
    },
    /**
     * Delete data from the table
     * @param tableName(String)  ---- table name
     * @param index(?)  ---- the type of this args is the primary key that you set when you create the database,and the value is the primary key in the data.
     * @returns
     */
    deleteData: function (tableName, index) {
        return new Promise(resolve => {
            let request = db.transaction(tableName, 'readwrite').objectStore(tableName).delete(index);
            request.onsuccess = function () {
                resolve(true);
            };
            request.onerror = function (error) {
                resolve(false, error);
            }
        });
    },
    /**
     * Update data
     * @param tableName(String)  ---- table name
     * @param data(JSON)  ---- the data that you update,plz pay attention,this args is type of JSON,and the primary key must be in the data.
     * @returns
     */
    updateData: function (tableName, data) {
        return new Promise(resolve => {
            let request = db.transaction(tableName, 'readwrite').objectStore(tableName).put(data);
            request.onsuccess = function () {
                resolve(null);
            }
        });
    },
    /**
     * Get data by primary key
     * @param tableName(String)  ---- table name
     * @param index(?)  ---- the type of this args is the primary key that you set when you create the database,and the value is the primary key in the data.
     * @returns
     */
    getData: function (tableName, index) {
        return new Promise(resolve => {
            let request = db.transaction(tableName).objectStore(tableName).get(index);

            request.onsuccess = function (event) {
                if (request.result) {
                    resolve(request.result);
                } else {
                    resolve(false, 'no data found');
                }
            };
            request.onerror = function (error) {
                resolve(false, error);
            }
        });
    },
    /**
     * Get all data in this database
     * @param tableName(String)  ---- table name
     * @returns
     */
    getAll: function (tableName) {
        return new Promise(resolve => {
            let objectStore = db.transaction(tableName).objectStore(tableName);
            let list = [];

            objectStore.openCursor().onsuccess = function (event) {
                let cursor = event.target.result;
                if (cursor) {
                    list.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(list);
                }
            }
        });
    },
    /**
     * Get data by index that you set when create the database
     * @param tableName(String)  ---- table name.
     * @param key(?)  ---- the index name.eg:   index = {name:'name',attr:'name',unique: true}  key = 'name'
     * @param value(?)  ---- the value that you want to select in the index.  eg: value = 'bud001001'
     * @returns
     */
    getDataByKey: function (tableName, key, value) {
        return new Promise(resolve => {
            let objectStore = db.transaction([tableName], 'readonly').objectStore(tableName);
            let index = objectStore.index(key);
            if (!!index) {
                let request = index.get(value);
                request.onsuccess = function (e) {
                    let result = e.target.result;
                    if (result) {
                        resolve(result);
                    } else {
                        resolve(false, 'no data found');
                    }
                };
                request.onerror = function (error) {
                    resolve(false, error);
                }
            } else {
                resolve(false);
            }
        });
    },
    /**
     * clear data in this table
     * @param tableName(String)  ---- table name
     * @returns
     */
    clearData: function (tableName) {
        return new Promise(resolve => {
            let objectStore = db.transaction(tableName, 'readwrite').objectStore(tableName);
            let request = objectStore.clear();
            request.onsuccess = function (event) {
                resolve(true);
            }
            request.onerror = function (error) {
                resolve(error);
            }
        })
    }
};
