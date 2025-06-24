const { EventModel } = require("../../Models/EventModel");

const getAEvent = async (req, res) => {
    try {
        const event = await EventModel.findOne({ name: req.params.name }).populate("products");

        // console.log(event);

        if (!event) {
            return res.status(404).send({ message: "Event not found", error: true });
        }

        res.status(200).send({ message: "Got event", error: false, data: event });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Server error", error: true });
    }
};

module.exports.getAEvent = getAEvent;
