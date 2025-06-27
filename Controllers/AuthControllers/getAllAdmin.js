const { SuperAdminModel } = require("../../Models/SuperAdminModel");
const { AdminModel } = require("../../Models/AdminModel");
const { EmployeeModel } = require("../../Models/EmployeeModel");

const getAllAdmin = async (req, res) => {
    let superAdmin = await SuperAdminModel.find();
    let admin = await AdminModel.find();
    let employee = await EmployeeModel.find();

    let allAdmin = [...superAdmin, ...admin, ...employee];

    if (allAdmin.length != 0) {
        res.status(200).send({ message: "All admins", error: false, data: allAdmin });
    } else {
        res.send({ message: "No admin found", error: true });
    }
};

module.exports.getAllAdmin = getAllAdmin;
