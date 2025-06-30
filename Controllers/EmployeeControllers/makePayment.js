const formidable = require("formidable");
const { EmployeeModel } = require("../../Models/EmployeeModel");
const { ExpenseModel } = require("../../Models/ExpenseModel");
const { cleanObject } = require("../../Functions/cleanObject");
const { formDataToObj } = require("../../Functions/formDataToObj");
const { saveAndGetFile } = require("../../Functions/saveAndGetFile");

const makePayment = async (req, res) => {

    console.log(req.params);

    const form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(500).json({ error: true, message: "Form parsing failed", details: err.message });
        }

        try {
            const employeeId = req.params.employeeId;

            fields = cleanObject(formDataToObj(fields));
            const { amount, description, paymentMethod = "Bkash", paymentStatus = "Paid", transactionId } = fields;

            if (!employeeId || !amount) {
                return res.status(400).json({ error: true, message: "Missing employeeId or amount" });
            }

            const employee = await EmployeeModel.findById(employeeId);
            if (!employee) {
                return res.status(404).json({ error: true, message: "Employee not found" });
            }

            // Save document (optional)
            let document = null;
            if (files.document) {
                document = await saveAndGetFile(files.document[0]);
            }

            // Add payment to employee
            const payment = {
                amount: parseFloat(amount),
                date: new Date(),
                description: description || `Commission payment to ${employee.firstName}`,
                document: document,
                paymentMethod,
                paymentStatus,
                transactionId,
            };

            employee.payment.push(payment);
            await employee.save();

            // Create matching expense
            const expense = new ExpenseModel({
                amount: parseFloat(amount),
                description: description || `Commission payment to ${employee.firstName}`,
                date: new Date(),
                documents: document ? [document] : [],
                verified: true,
                companyName: "Triova",
            });

            await expense.save();

            res.status(200).json({
                message: "Payment processed successfully",
                error: false,
                data: { employee, expense },
            });
        } catch (error) {
            console.error("Payment error:", error);
            res.status(500).json({ error: true, message: "Server error", details: error.message });
        }
    });
};

module.exports.makePayment = makePayment;
