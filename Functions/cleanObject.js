


const cleanObject = (obj) => {

    let newObj = {}

    for (let key in obj) {
        if (obj[key] === '' || obj[key] === undefined || obj[key] === null) {
            continue
        }
        else {
            newObj[key] = obj[key]
        }
    }

    return newObj

}


module.exports.cleanObject = cleanObject