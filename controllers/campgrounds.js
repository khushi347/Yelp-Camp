const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');
const mongoose = require('mongoose');

module.exports.renderHome = async (req, res) => {
  const campgrounds = await Campground.find({})
    .sort({ _id: -1 })
    .limit(3);

  res.render('campgrounds/home', {
    campgrounds,
    fullWidth: true
  });
};


module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({})
    .populate('reviews');

  // Campgrounds with valid geometry
  const geoCampgrounds = campgrounds.filter(
    c => c.geometry && c.geometry.coordinates
  );

  const geoCount = geoCampgrounds.length;

  const avgPrice = campgrounds.length
    ? Math.round(
        campgrounds.reduce(
          (sum, c) => sum + (Number(c.price) || 0),
          0
        ) / campgrounds.length
      )
    : 0;

  const reviewCount = campgrounds.reduce(
    (sum, c) => sum + (c.reviews?.length || 0),
    0
  );

  res.render('campgrounds/index', {
    campgrounds,
    geoCount,
    avgPrice,
    reviewCount,
    campgroundsGeoJSON: JSON.stringify({
      type: 'FeatureCollection',
      features: geoCampgrounds.map(c => ({
        type: 'Feature',
        geometry: c.geometry,
        properties: {
          id: c._id.toString(),
          title: c.title,
          location: c.location,
          price: c.price
        }
      }))
    })
  });
};


module.exports.renderNewForm = (req, res) => {
  res.render('campgrounds/new');
};

module.exports.createCampground = async (req, res, next) => {
  try {
    const longitude = parseFloat(req.body.campground.longitude);
    const latitude = parseFloat(req.body.campground.latitude);
    
    if (isNaN(longitude) || isNaN(latitude)) {
      req.flash('error', 'Invalid coordinates provided');
      return res.redirect('/campgrounds/new');
    }
    
    if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
      req.flash('error', 'Coordinates out of valid range');
      return res.redirect('/campgrounds/new');
    }
    
    const campground = new Campground({
      ...req.body.campground,
      geometry: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      latitude: latitude,
      longitude: longitude
    });
    
    if (req.files && req.files.length > 0) {
      campground.images = req.files.map(f => ({
        url: f.path,
        filename: f.filename
      }));
    }
    
    campground.author = req.user._id;
    await campground.save();
    
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
  } catch (err) {
    next(err);
  }
};

module.exports.renderEditForm = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash('error', 'Invalid campground ID');
      return res.redirect('/campgrounds');
    }
    
     const campground = await Campground.findById(id).populate('author');
    
    if (!campground) {
      req.flash('error', 'Campground Not Found');
      return res.redirect('/campgrounds');
    }
    
    // Check authorization
    if (!campground.author.equals(req.user._id)) {
      req.flash('error', 'You do not have permission to edit this campground');
      return res.redirect(`/campgrounds/${id}`);
    }
    
    // Extract coordinates
    let longitude, latitude;
    if (campground.geometry && campground.geometry.coordinates) {
      longitude = campground.geometry.coordinates[0];
      latitude = campground.geometry.coordinates[1];
    } else if (campground.longitude && campground.latitude) {
      longitude = campground.longitude;
      latitude = campground.latitude;
    }
    
    res.render('campgrounds/edit', { 
      campground,
      longitude,
      latitude 
    });
  } catch (err) {
    req.flash('error', 'Something went wrong');
    res.redirect('/campgrounds');
  }
};

module.exports.showCampground = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash('error', 'Invalid campground ID');
      return res.redirect('/campgrounds');
    }
    
    const campground = await Campground
      .findById(id)
      .populate({
        path: 'reviews',
        populate: {
          path: 'author'
        }
      })
      .populate('author');
    
    if (!campground) {
      req.flash('error', 'Campground Not Found');
      return res.redirect('/campgrounds');
    }
    
    res.render('campgrounds/show', { campground });
  } catch (err) {
    req.flash('error', 'Something went wrong');
    res.redirect('/campgrounds');
  }
};

module.exports.updateCampground = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash('error', 'Invalid campground ID');
      return res.redirect('/campgrounds');
    }
    
    let updateData = { ...req.body.campground };
    
    // Check for coordinate inputs
    const longitude = req.body.campground.longitude || req.body.campground.geometry?.coordinates?.[0];
    const latitude = req.body.campground.latitude || req.body.campground.geometry?.coordinates?.[1];
    
    if (longitude && latitude) {
      const lng = parseFloat(longitude);
      const lat = parseFloat(latitude);
      
      if (!isNaN(lng) && !isNaN(lat)) {
        updateData.geometry = {
          type: 'Point',
          coordinates: [lng, lat]
        };
        updateData.longitude = lng;
        updateData.latitude = lat;
      }
    }
    
    const campground = await Campground.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!campground) {
      req.flash('error', 'Campground Not Found');
      return res.redirect('/campgrounds');
    }
    
    // Handle new images
    if (req.files && req.files.length > 0) {
      const imgs = req.files.map(f => ({
        url: f.path,
        filename: f.filename
      }));
      campground.images.push(...imgs);
      await campground.save();
    }
    
    // Handle image deletion
    if (req.body.deleteImages) {
      const deleteArray = Array.isArray(req.body.deleteImages) 
        ? req.body.deleteImages 
        : [req.body.deleteImages];
      
      for (let filename of deleteArray) {
        await cloudinary.uploader.destroy(filename);
      }
      await campground.updateOne({
        $pull: { images: { filename: { $in: deleteArray } } }
      });
    }
    
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
  } catch (err) {
    next(err);
  }
};

module.exports.deleteCampground = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash('error', 'Invalid campground ID');
      return res.redirect('/campgrounds');
    }
    
    const campground = await Campground.findById(id);
    
    if (!campground) {
      req.flash('error', 'Campground Not Found');
      return res.redirect('/campgrounds');
    }
    
    // Delete images from Cloudinary
    if (campground.images && campground.images.length > 0) {
      for (let img of campground.images) {
        await cloudinary.uploader.destroy(img.filename);
      }
    }
    
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted Campground!');
    res.redirect('/campgrounds');
  } catch (err) {
    req.flash('error', 'Something went wrong');
    res.redirect('/campgrounds');
  }
};