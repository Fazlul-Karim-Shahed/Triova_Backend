const fs = require("fs");
const path = require("path");
const { ExpenseModel } = require("../../Models/ExpenseModel");
const formidable = require("formidable");
const { formDataToObj } = require("../../Functions/formDataToObj");
const { saveAndGetFile } = require("../../Functions/saveAndGetFile");
const { cleanObject } = require("../../Functions/cleanObject");
const { saveMultipleFile } = require("../../Functions/saveMultipleFile");

const createExpense = async (req, res) => {
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(500).send(err);
        }

        fields = cleanObject(formDataToObj(fields));

        let expense = new ExpenseModel(fields);

        let documents = files && files["documents[]"] && files["documents[]"].length > 0 ? saveMultipleFile(files["documents[]"]) : null;


        if (documents) {
            documents.then((data) => {
                // //console.log("Create Expense Data: ", data);
                expense.documents = data;
                // console.log(data)

                expense
                    .save()
                    .then((expense) => {
                        res.send({ message: "expense created successfully", error: false, data: expense });
                    })
                    .catch((err) => {
                        res.send({ message: err.message, error: true });
                    });
            });
        } else {
            expense
                .save()
                .then((expense) => {
                    res.send({ message: "expense created successfully", error: false, data: expense });
                })
                .catch((err) => {
                    res.send({ message: err.message, error: true });
                });
        }
    });
};

module.exports.createExpense = createExpense;
