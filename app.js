const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

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

app.get("/listings", async(req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", {allListings});
});

//new
app.get("/listings/new", (req, res) => {
    res.render("listings/new");
});


//show route
app.get("/listings/:id", async(req, res) => {
    let {id} = req.params;
    const listing =await Listing.findById(id);
    res.render("listings/show.ejs", {listing});
});

app.post("/listings", async(req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
});

app.get("/listings/:id/edit", async(req, res) => {
    let {id} = req.params;
    const listing =await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
});

app.put("/listings/:id", async(req, res) => {
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);
});

app.delete("/listings/:id", async(req, res) => {
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
});

app.listen(8080, () => {
    console.log("server is working well");
});