const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");

app.get("/", (req, res) => {
    res.send("i am a root");
});

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
 .then(() => {
     console.log("connect to DB");
 })
 .catch((err) => {
    console.log(err);
 });
 
async function main(){
    await mongoose.connect(MONGO_URL);
};

app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));


// app.get("/testlisting", async(req, res) => {
//     let samplelisting = new Listing({
//         title: "my new house",
//         description: "by the beech",
//         price: 12000,
//         location: "pakistan",
//         country: "india"
//     });
    
//     await samplelisting.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });

const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
        if (error) {
            let errMsg = error.details.map((el) => el.message).join(",");
            throw new ExpressError(400, errMsg);
        }else {
            next();
        }
}

const validatereview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
        if (error) {
            let errMsg = error.details.map((el) => el.message).join(",");
            throw new ExpressError(400, errMsg);
        }else {
            next();
        }
}

app.get("/listings", wrapAsync(async(req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", {allListings});
}));

//new
app.get("/listings/new", (req, res) => {
    res.render("listings/new");
});


//show route
app.get("/listings/:id", wrapAsync(async(req, res) => {
    let {id} = req.params;
    const listing =await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", {listing});
}));

app.post("/listings", validateListing, wrapAsync(async(req, res, next) => {  
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
}));

app.get("/listings/:id/edit", wrapAsync(async(req, res) => {
    let {id} = req.params;
    const listing =await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}));

app.put("/listings/:id", validateListing, wrapAsync(async(req, res) => {
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);
}));

app.delete("/listings/:id", async(req, res) => {
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
});

app.post("/listings/:id/reviews", validatereview, wrapAsync(async(req, res) => {
   let listing = await Listing.findById(req.params.id);
   let newReview = new Review(req.body.review);

   listing.reviews.push(newReview);

   await newReview.save();
   await listing.save();

   res.redirect(`/listings/${listing._id}`);
}));

//delete review route
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req, res) => {
    let {id, reviewId} = req.params;

    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);

}));

// 404 handler (ALWAYS after all routes)
app.use((req, res, next) => {
    next(new ExpressError(404, "page not found"));
});

// Error handler
app.use((err, req, res, next) => {
    let { status = 500, message = "Something went wrong" } = err;
    res.render("error.ejs", {message});
    // res.status(status).send(message);
});

app.listen(8080, () => {
    console.log("server is working well");
});