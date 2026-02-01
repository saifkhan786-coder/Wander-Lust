const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,

  image: {
    filename: {
      type: String,
      default: "listingimage",
    },
    url: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?q=80&w=1174&auto=format&fit=crop",
    },
  },

  price: Number,
  location: String,
  country: String,
});


const Listing = mongoose.model("listing", listingSchema);
module.exports = Listing;