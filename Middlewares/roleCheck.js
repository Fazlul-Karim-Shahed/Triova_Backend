const jwt = require("jsonwebtoken");
const { checkMobile } = require("../Functions/checkMobile");

const roleCheck = (roleArray) => {
    return async (req, res, next) => {

        try {
            const data = await jwt.verify(req.headers.authorization.split(" ")[1], process.env.SECRET_KEY);

            if (data) {
                const user = await checkMobile(data.mobile);

                if (user) {
                    let match = false;

                    roleArray.forEach((role) => {
                        if (user.role === role || user.role === "superAdmin") {
                            match = true;
                        }
                    });

                    if (match) {
                        req.user = user;
                        next();
                    } else {
                        res.send({ message: "Yoou are not authorized", error: true });
                    }
                } else {
                    res.send({ message: "User not found", error: true });
                }
            } else {
                req.send({ message: "Not verified", error: true });
            }
        } catch (err) {
            console.error("Error in roleCheck middleware:", err);
            res.send({ message: "Something went wrong", error: true, data: err.message });
        }
    };
};

module.exports.roleCheck = roleCheck;
