if (process.env.NODE_ENV == "production") {
    module.exports = {mongoURI: "mongodb+srv://admin:KJIxIrNRMBtMazlX@cluster0.a4d8cm5.mongodb.net/?retryWrites=true&w=majority"};
} else {
    module.exports = {mongoURI: "mongodb://localhost/blogapp"};
}