/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var axios = require('axios');
var request = require('request');

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});
const token = '?token=pk_51011e5f642e439bbab503ba7d449cfb';

const getApi = (symbol) => axios.get('https://cloud.iexapis.com/stable/stock/'+symbol+'/quote'+token);
let num = 0;
let ipAddr = [];
const repeatFunc = (query, arr) => {
	let d;
	if(typeof query === 'string') query = [query];
	if(query.length > 1) {
		return getApi(query.splice(0, 1)[0]).then(a => {
			arr.push({'stock': a.data.symbol, 'price': a.data.latestPrice});
			return repeatFunc(query, arr);
		});	 
	}
	return getApi(query[0])
	  	.then(a => {
	  		arr.push({'stock': a.data.symbol, 'price': a.data.latestPrice});
	  		return arr;
	  	});
}

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(function (req, res){
    	let query = req.query; 
		if(!ipAddr.includes(req.ip)){
			ipAddr.push(req.ip);
			num++;
		}
    	repeatFunc(query.stock, []).then(arr => {
    		if(arr.length === 1){
    			if(query.like) arr[0].like = num;
    			res.json({'stockData': arr[0]});
    		}else {
    			if(query.like){
    				arr[0].rel_like = -num; 
    				arr[1].rel_like = num;
    			}
    			res.json({'stockData': arr});
    		}
    	});
    	// getApi(query)
		  	// .then(result => {
		  	// 	console.log(result.data)
		  	// 	init = result.data;
		  	// 	res.json({stock: result.data.symbol})
		  	// })
		  	//.catch(err => console.log(err.response.data))
    });

 //  request('https://cloud.iexapis.com/stable/stock/goog/quote?token=pk_51011e5f642e439bbab503ba7d449cfb', (error, response, body) => {
 //    if(error) {
 //        return console.log('This is an error');
 //    }
 //    console.log(body);
	// });   
};
