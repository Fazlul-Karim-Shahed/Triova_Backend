

const { BatchModel } = require("../../Models/BatchModel")


const getAllBatch = async (req, res) => {

    let batch = await BatchModel.find({ verified: true })

    if (batch.length != 0) {

        res.status(200).send({ message: 'All batch', error: false, data: batch })
    }
    else {
        res.send({ message: 'No batch found', error: true })
    }

}

module.exports.getAllBatch = getAllBatch