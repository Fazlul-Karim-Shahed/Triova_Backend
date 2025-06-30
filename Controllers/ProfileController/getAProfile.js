


const { AdminModel } = require("../../Models/AdminModel")
const { EmployeeModel } = require("../../Models/EmployeeModel")
const { SuperAdminModel } = require("../../Models/SuperAdminModel")
const { UserModel } = require("../../Models/UserModel")


const getAProfile = async (req, res) => {

    let batch =
        req.params.role === "user"
            ? await UserModel.findOne({ _id: req.params.id })
            : req.params.role === "superAdmin"
            ? await SuperAdminModel.findOne({ _id: req.params.id })
            : req.params.role === "employee"
            ? await EmployeeModel.findOne({ _id: req.params.id })
            : req.params.role === "promoter" ? await EmployeeModel.findOne({ _id: req.params.id }) : req.params.role === "brandAmbassador" ? await EmployeeModel.findOne({ _id: req.params.id }) : req.params.role === "influencer" ? await EmployeeModel.findOne({ _id: req.params.id }) : await AdminModel.findOne({ _id: req.params.id })

    if (batch) {

        res.status(200).send({ message: 'Profile', error: false, data: batch })
    }
    else {
        res.send({ message: 'No profile found', error: true })
    }

}

module.exports.getAProfile = getAProfile