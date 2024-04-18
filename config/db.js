if(process.env.NODE_ENV == "production"){
    module.exports = {mongoURI: "mongodb+srv://admin:admin@junior.gmloq5l.mongodb.net/?retryWrites=true&w=majority&appName=junior"}
}else{
    module.exports = {mongoURI: 'mongodb://127.0.0.1:27017/blogDB'}
}   