

const { ImageSliderModel } = require("../../Models/ImageSliderModel")


const deleteImageSlider = async (req, res) => {


    let imageSlider = await ImageSliderModel.deleteOne({ _id: req.params.imageSliderId })


    if (imageSlider.deletedCount != 0) {

        res.status(200).send({ message: 'imageSlider deleted successfully', error: false })
    }
    else {
        res.send({ message: 'No imageSlider found', error: true })
    }

}

module.exports.deleteImageSlider = deleteImageSlider