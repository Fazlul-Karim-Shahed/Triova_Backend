
const _ = require('lodash')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const { checkMobile } = require('../../Functions/checkMobile');
const { AdminModel } = require('../../Models/AdminModel');
const { SuperAdminModel } = require('../../Models/SuperAdminModel');
const { EmployeeModel } = require('../../Models/EmployeeModel');
const { UserModel } = require('../../Models/UserModel');
const { cleanObject } = require('../../Functions/cleanObject');


const signup = async (req, res) => {

    let data = await checkMobile(req.body.mobile)

    if (data) {
        res.send({ message: 'User already exist', error: true })
    }
    else {

        data = cleanObject(req.body);
        let salt = await bcrypt.genSalt(10)
        let hashedPass = await bcrypt.hash(data.password, salt)

        data['password'] = hashedPass

        data = data.role === 'admin' ? new AdminModel(data) : data.role === 'superAdmin' ? new SuperAdminModel(data) : data.role === 'employee' ? new EmployeeModel(data) : new UserModel(data)


        data = data.save().then(data => {

            const token = jwt.sign(_.pick(data, ['firstName', 'lastName', 'role', 'email', '_id', 'mobile', 'mobileVerified']), process.env.SECRET_KEY, { expiresIn: '1h' })
            res.send({
                message: 'Registration complete', error: false, value: {
                    token: token
                }
            })
        })
            .catch(err => {
                res.send({ message: 'Something went wrong while signup', error: true, value: err.message })
            })

    }

}

module.exports.signup = signup