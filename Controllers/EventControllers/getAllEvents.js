const { EventModel } = require("../../Models/EventModel");

const getAllEvents = async (req, res) => {
    //console.log(req.params);

    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const endOfToday = new Date(now.setHours(23, 59, 59, 999));

    let filter = {};

    if (req.params && req.params.today !== "undefined") {
        filter = {
            startDate: { $lte: endOfToday },
            endDate: { $gte: startOfToday },
        };
    }

    const event = await EventModel.find(filter);

    if (event.length !== 0) {
        res.status(200).send({ message: "All event", error: false, data: event });
    } else {
        res.send({ message: "No event found", error: true });
    }
};

module.exports.getAllEvents = getAllEvents;
