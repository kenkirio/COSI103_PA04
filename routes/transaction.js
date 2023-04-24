/*
  transaction.js -- Router for the TransactionTable
*/
const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction')
const User = require('../models/User');
const { isLoggedIn } = require('./pwauth');

// Display all transactions for the user
router.get('/transaction/',
  isLoggedIn,
  async (req, res, next) => {
	const sortBy = req.query.sortBy;
	let transactions = [];
	if (sortBy == "category") {
		transactions = await Transaction.find({userId:req.user._id})
											.sort({category:1});
	} else if (sortBy == "amount") {
		transactions = await Transaction.find({userId:req.user._id})
											.sort({amount:1});
	} else if (sortBy == "description") {
		transactions = await Transaction.find({userId:req.user._id})
											.sort({description:1});
	} else if (sortBy == "date") {
		transactions = await Transaction.find({userId:req.user._id})
											.sort({date:1});
	} else {
		transactions = await Transaction.find({userId:req.user._id});
	}
	res.locals.transactions = transactions;
    res.render('transaction');
});

// Create a new transaction
router.post('/transaction/create', 
  isLoggedIn,
  async (req, res, next) => {
	const trans = new Transaction(
		{description: req.body.description,
		amount: req.body.amount,
		category: req.body.category,
		date: req.body.date,
		userId: req.user._id
		})
	await trans.save();
	res.redirect('/transaction')
});

// Delete a transaction
router.get('/transaction/delete/:transactionId',
  isLoggedIn,
  async (req, res, next) => {
	await Transaction.deleteOne({_id:req.params.transactionId});
    res.redirect('/transaction')
});

// Display the edit page for a transaction
router.get('/transaction/edit/:transactionId',
  isLoggedIn,
  async (req, res, next) => {
    const transaction = await Transaction.findById(req.params.transactionId);
    res.locals.transaction = transaction;
    res.render('editTransaction');
});

// Edit a transaction
router.post('/transaction/updateTransaction',
  isLoggedIn,
  async (req, res, next) => {
    const {transactionId, description, amount, category, date} = req.body;
    await Transaction.findOneAndUpdate(
    	{_id:transactionId},
        {$set: {description, amount, category, date}}
	);
    res.redirect('/transaction');
});

// Group by category
router.get('/transaction/byCategory',
  isLoggedIn,
  async (req, res, next) => {
    let results =
        await Transaction.aggregate([  
			{$match: {userId:req.user._id}},
            {$group:{
				_id:'$category', 
				total:{$sum: '$amount'}}},
            {$sort:{total:-1}},              
        ]);
	res.locals.results = results;
	res.render("summarizeByCategory");
});

module.exports = router;