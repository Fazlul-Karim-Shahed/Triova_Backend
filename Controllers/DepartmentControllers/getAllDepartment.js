const { DepartmentModel } = require("../../Models/DepartmentModel")


const getAllDepartment = async (req, res) => {



    let department = !req.body ? await DepartmentModel.find() : await DepartmentModel.find(req.body)

    if (department.length != 0) {

        res.status(200).send({ message: 'All department', error: false, data: department })
    }
    else {
        res.send({ message: 'No department found', error: true })
    }


}
 
module.exports.getAllDepartment = getAllDepartment