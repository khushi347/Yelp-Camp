const Joi = require('joi');

module.exports.campgroundSchema = Joi.object({
  campground: Joi.object({
    title: Joi.string().required(),
    location: Joi.string().required(),

    price: Joi.number()
      .required()
      .min(0),

    description: Joi.string().required(),

    latitude: Joi.number()
      .required()
      .min(-90)
      .max(90),

    longitude: Joi.number()
      .required()
      .min(-180)
      .max(180),
  }).required(),

  images: Joi.any()   // 👈 IMPORTANT (for multer)
});    

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        body: Joi.string().required(),
        rating: Joi.number().min(1).max(5).required()
    }).required()
});