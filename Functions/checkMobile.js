

const { AdminModel } = require("../Models/AdminModel")
const { SuperAdminModel } = require("../Models/SuperAdminModel")
const { EmployeeModel } = require("../Models/EmployeeModel")
const { UserModel } = require("../Models/UserModel")


const checkMobile = async (mobile) => {

    let userMobileCheck = await UserModel.findOne({ mobile: mobile })
    let superAdminMobileCheck = await SuperAdminModel.findOne({ mobile: mobile })
    let employeeMobileCheck = await EmployeeModel.findOne({ mobile: mobile })
    let adminMobileCheck = await AdminModel.findOne({ mobile: mobile })

    let data = (userMobileCheck) ? userMobileCheck : (superAdminMobileCheck) ? superAdminMobileCheck : (employeeMobileCheck) ? employeeMobileCheck : (adminMobileCheck) ? adminMobileCheck : null

    return data
}


exports.checkMobile = checkMobile