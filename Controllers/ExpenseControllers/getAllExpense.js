const { ExpenseModel } = require("../../Models/ExpenseModel");

const getAllExpense = async (req, res) => {
    let expense = await ExpenseModel.find();

    if (expense.length != 0) {
        res.status(200).send({ message: "All expense", error: false, data: expense });
    } else {
        res.send({ message: "No expense found", error: true });
    }
};

module.exports.getAllExpense = getAllExpense;
