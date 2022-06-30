// Carregando Módulos
const express = require("express");
const handlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const admin = require("./routes/admin");
const usuario = require("./routes/usuario");
const path = require("path");

// Utilizar o Passport
const passport = require("passport");
require("./config/auth")(passport);

const app = express();
require("./models/Post");
const Post = mongoose.model("posts");
require("./models/Categoria");
const Categoria = mongoose.model("categorias");

// Configurações
    // Session
    app.use(session({
        secret: "cursoNodeJS",
        resave: true,
        saveUninitialized: true
    }));
    // Usar o Passport para Autenticação
    app.use(passport.initialize());
    app.use(passport.session());
    // Flash
    app.use(flash());

    // Midleware - Intercepta todas as requisições e executa o bloco abaixo antes de seguir
    app.use((req, res, next) => { // Variáveis Globais
        res.locals.success_msg = req.flash("success_msg");
        res.locals.error_msg = req.flash("error_msg");
        res.locals.error = req.flash("error");
        res.locals.user = req.user || null;
        next();
    });

    // BodyParser
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());

    // HandleBars
    app.engine("handlebars", handlebars.engine({defaultLayout: "main",
        runtimeOptions: {
            allowProtoPropertiesByDefault: true,
            allowProtoMethodsByDefault: true,
        },
    }));
    app.set("view engine", "handlebars");

    var hbs = handlebars.create({});
    hbs.handlebars.registerHelper("ifEquals", function(arg1, arg2, options) {
        console.log(arg1, arg2);
        return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    });

    // Mongoose
    mongoose.Promise = global.Promise;
    mongoose.connect("mongodb://localhost/blogapp").then(() => {
        console.log("Conectado ao MongoDB...");
    }).catch((err) => {
        console.log("Erro ao Conectar ao MongoDB: " + err);
    });

    // Public Folder
    app.use(express.static(path.join(__dirname, "public")));

// Rotas
    app.get("/", (req, res) => {
        Post.find().populate("categoria").sort({data: "desc"}).then((posts) => {
            res.render("index", {posts: posts});
        }).catch((err) => {
            req.flash("error_msg", "Erro ao Buscar os Posts: " + err);
            res.redirect("/404");
        });
    });

    app.get("/post/:slug", (req, res) => {
        Post.findOne({slug: req.params.slug}).then((post) => {
            if (post) {
                res.render("post/index", {post: post});
            } else {
                req.flash("error_msg", "Postagem não encontrada!");
                res.redirect("/");
            }
        }).catch((err) => {
            req.flash("error_msg", "Erro ao Buscar o Post pelo SLUG: " + err);
            res.redirect("/");
        });
    });

    app.get("/categorias", (req, res) => {
        Categoria.find().then((categorias) => {
            res.render("categoria/index", {categorias: categorias});
        }).catch((err) => {
            req.flash("error_msg", "Erro ao Buscar Categorias: " + err);
            res.redirect("/");
        });
    });

    app.get("/categorias/:slug", (req, res) => {
        Categoria.findOne({slug: req.params.slug}).then((categoria) => {
            if (categoria) {
                Post.find({categoria: categoria._id}).then((posts) => {
                    res.render("categoria/posts", {posts: posts, categoria: categoria});
                }).catch((err) => {
                    req.flash("error_msg", "Posts não Encontrados pela Categoria!");
                    res.redirect("/");
                });
            } else {
                req.flash("error_msg", "Categoria não Encontrada!");
                res.redirect("/");
            }
        }).catch((err) => {
            req.flash("error_msg", "Erro ao Buscar Categoria por SLUG: " + err);
            res.redirect("/");
        });
    });

    app.get("/404", (req, res) => {
        res.send("Erro");
    })

    app.use("/admin", admin);
    app.use("/usuario", usuario);

// Demais Configurações
const WEBPORT = 8080;
app.listen(WEBPORT, () => {
    console.log("Servidor iniciado em http://localhost:" + WEBPORT + "/...");
});
