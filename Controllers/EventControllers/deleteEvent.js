

const { EventModel } = require("../../Models/EventModel")


const deleteEvent = async (req, res) => {


    let event = await EventModel.deleteOne({ _id: req.params.eventId })


    if (event.deletedCount != 0) {

        res.status(200).send({ message: 'event deleted successfully', error: false })
    }
    else {
        res.send({ message: 'No event found', error: true })
    }

}

module.exports.deleteEvent = deleteEvent