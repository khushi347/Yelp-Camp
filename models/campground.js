const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  url: String,
  filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
  return this.url.replace('upload', '/upload/w_200');
});

const campgroundSchema = new Schema({
  title: String,
  images: [ImageSchema],
  price: Number,
  description: String,
  location: String,
  
  // **CHANGES HERE** - Use GeoJSON format for better compatibility
  geometry: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(v) {
          return v.length === 2 && 
                 v[0] >= -180 && v[0] <= 180 && // Longitude
                 v[1] >= -90 && v[1] <= 90;     // Latitude
        },
        message: 'Coordinates must be [longitude, latitude]'
      }
    }
  },
  
  // Optional: Keep simple fields for easier access
  latitude: Number,
  longitude: Number,

  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review'
    }
  ]
}, {
  // Enable virtuals in JSON output
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// **ADD THIS: Create geospatial index for efficient queries**
campgroundSchema.index({ geometry: '2dsphere' });

// **ADD THIS: Virtual property for easier map marker popups**
campgroundSchema.virtual('properties.popupMarkup').get(function () {
  return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.location}</p>
    <p>${this.description.substring(0, 100)}...</p>
  `;
});

campgroundSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await Review.deleteMany({
      _id: { $in: doc.reviews }
    });
  }
});

module.exports = mongoose.model('Campground', campgroundSchema);