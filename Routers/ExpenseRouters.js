const { createExpense } = require("../Controllers/ExpenseControllers/createExpense");
const { deleteExpense } = require("../Controllers/ExpenseControllers/deleteExpense");
const { getAllExpense } = require("../Controllers/ExpenseControllers/getAllExpense");
const { roleCheck } = require("../Middlewares/roleCheck");

const router = require("express").Router();

router.get("/", getAllExpense);
router.post("/", roleCheck(["admin"]), createExpense);
router.delete("/:id", roleCheck(["admin"]), deleteExpense);

module.exports = router;
