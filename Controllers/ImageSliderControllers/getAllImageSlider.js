

const { ImageSliderModel } = require("../../Models/ImageSliderModel")


const getAllImageSlider = async (req, res) => {

    let imageSlider = await ImageSliderModel.find()

    if (imageSlider.length != 0) {

        res.status(200).send({ message: 'All imageSlider', error: false, data: imageSlider })
    }
    else {
        res.send({ message: 'No imageSlider found', error: true })
    }


}
 
module.exports.getAllImageSlider = getAllImageSlider;