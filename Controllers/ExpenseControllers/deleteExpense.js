const { ExpenseModel } = require("../../Models/ExpenseModel");

const deleteExpense = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).send({ message: "Expense ID is required", error: true });
    }

    try {
        const expense = await ExpenseModel.findByIdAndDelete(id);

        if (!expense) {
            return res.status(404).send({ message: "Expense not found", error: true });
        }

        res.status(200).send({ message: "Expense deleted successfully", error: false, data: expense });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal server error", error: true });
    }
};

module.exports.deleteExpense = deleteExpense;
