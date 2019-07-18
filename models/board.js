let express = require('express');
let mongoose = require('mongoose');
let mai = require('mongoose-auto-increment');

mai.initialize(mongoose.connection);

let schema = new mongoose.Schema({
    user: String,
    title:String,
    content:String,
    createTime:{type: Date, default: Date.now},
    updateTime:{type: Date, default: Date.now}
})

schema.plugin(mai.plugin, {model : 'board', field:'postNumber', startAt: 1} );

module.exports = mongoose.model('board', schema);