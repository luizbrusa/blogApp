const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const {eAdmin} = require("../helpers/eAdmin"); // Pega apenas a função eAdmin de dentro do Import

// Rota Padrão
router.get("/", eAdmin, (req, res) => {
    res.render("admin/index");
});

// Rotas de Categorias
require("../models/Categoria");
const Categoria = mongoose.model("categorias");

router.get("/categorias", eAdmin, (req, res) => {
    Categoria.find().sort({date: "desc"}).then((categorias) => {
        res.render("admin/categorias", {categorias: categorias});
    }).catch((err) => {
        req.flash("error_msg", "Houve um Erro ao Listar as Categorias!");
        req.redirect("/admin");
    })
});

router.get("/categorias/add", eAdmin, (req, res) => {
    res.render("admin/addCategoria");
});

router.post("/categorias/nova", eAdmin, (req, res) => {

    var erros = [];
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome Inválido!"});
    }

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug Inválido!"});
    }

    if (erros.length > 0){
        res.render("admin/addCategoria", {erros: erros});
    } else {
        var categoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
    
        new Categoria(categoria).save().then(() =>{
            req.flash("success_msg", "Categoria Salva com Sucesso!");
            res.redirect("/admin/categorias");
        }).catch((err) => {
            req.flash("error_msg", "Erro ao Salvar a Categoria: " + err);
            res.redirect("/admin/categorias");
        });
    }
});

router.get("/categorias/edit/:id", eAdmin, (req, res) => {
    Categoria.findOne({_id: req.params.id}).then((categoria) => {
        res.render("admin/editCategoria", {categoria: categoria});
    }).catch((err) => {
        req.flash("error_msg", "Categoria Não Existe!");
        res.redirect("/admin/categorias");
    });
});

router.post("/categorias/edit", eAdmin, (req, res) => {
    Categoria.findOne({_id: req.body.id}).then((categoria) => {
        categoria.nome = req.body.nome;
        categoria.slug = req.body.slug;

        var erros = [];
        if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
            erros.push({texto: "Nome Inválido!"});
        }
    
        if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
            erros.push({texto: "Slug Inválido!"});
        }
    
        if (erros.length > 0){
            res.render("admin/editCategoria", {erros: erros, categoria: categoria});
        } else {
            categoria.save().then(() => {
                req.flash("success_msg", "Categoria Salva com Sucesso!");
                res.redirect("/admin/categorias");
            }).catch((err) => {
                req.flash("error_msg", "Erro ao Salvar a Categoria: " + err);
                res.redirect("/admin/categorias");
            });
        }
    }).catch((err) => {
        req.flash("error_msg", "Categoria Não Existe!");
        res.redirect("/admin/categorias");
    });
});

router.get("/categorias/delete/:id", eAdmin, (req, res) => {
    Categoria.findOne({_id: req.params.id}).then((categoria) => {
        categoria.remove().then(() => {
            req.flash("success_msg", "Categoria Excluída com Sucesso!");
            res.redirect("/admin/categorias");
        }).catch((err) => {
            req.flash("error_msg", "Erro ao Excluir Categoria: " + err);
            res.redirect("/admin/categorias");
        });
    }).catch((err) => {
        req.flash("error_msg", "Categoria Não Existe!");
        res.redirect("/admin/categorias");
    });
});

// Rotas de Posts
require("../models/Post");
const Post = mongoose.model("posts");

router.get("/posts", eAdmin, (req, res) => {
    Post.find().populate("categoria").sort({data: "desc"}).then((posts) => {
        res.render("admin/posts", {posts: posts});
    }).catch((err) => {
        req.flash("error_msg", "Erro ao Buscar Posts: " + err);
        res.redirect("/admin");
    })
});

router.get("/posts/add", eAdmin, (req, res) => {
    Categoria.find().then((categorias) => {
        res.render("admin/addPost", {categorias: categorias});
    }).catch((err) => {
        req.flash("error_msg", "Erro ao Buscar Categorias: " + err);
        res.redirect("/admin/posts");
    });
});

router.post("/posts/novo", eAdmin, (req, res) => {

    var erros = [];
    if (!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
        erros.push({texto: "Título Inválido!"});
    }

    if (!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
        erros.push({texto: "Descrição Inválida!"});
    }

    if (!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null){
        erros.push({texto: "Conteúdo Inválido!"});
    }

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug Inválido!"});
    }

    if (req.body.categoria == ""){
        erros.push({texto: "Categoria Inválida!"});
    }

    if (erros.length > 0){
        res.render("admin/addPost", {erros: erros});
    } else {
        var post = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            slug: req.body.slug,
            categoria: req.body.categoria
        }
    
        new Post(post).save().then(() =>{
            req.flash("success_msg", "Post Salvo com Sucesso!");
            res.redirect("/admin/posts");
        }).catch((err) => {
            req.flash("error_msg", "Erro ao Salvar o Post: " + err);
            res.redirect("/admin/posts");
        });
    }
});

router.get("/posts/edit/:id", eAdmin, (req, res) => {
    Post.findOne({_id: req.params.id}).then((post) => {
        Categoria.find().then((categorias) => {
            res.render("admin/editPost", {post: post, categorias: categorias});
        }).catch((err) => {
            req.flash("error_msg", "Erro ao buscar Categorias: " + err);
            res.redirect("/admin/posts");
        })
    }).catch((err) => {
        req.flash("error_msg", "Post Não Existe!");
        res.redirect("/admin/posts");
    });
});

router.post("/posts/edit", eAdmin, (req, res) => {
    Categoria.findOne({_id: req.body.id}).then((post) => {
        post.titulo = req.body.titulo;
        post.descricao = req.body.descricao;
        post.conteudo = req.body.conteudo;
        post.slug = req.body.slug;
        post.categoria = req.body.categoria;

        var erros = [];
        if (!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
            erros.push({texto: "Título Inválido!"});
        }
    
        if (!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
            erros.push({texto: "Descrição Inválida!"});
        }
    
        if (!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null){
            erros.push({texto: "Conteúdo Inválido!"});
        }
    
        if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
            erros.push({texto: "Slug Inválido!"});
        }
    
        if (req.body.categoria == ""){
            erros.push({texto: "Categoria Inválida!"});
        }
    
        if (erros.length > 0){
            res.render("admin/editPost", {erros: erros, post: post});
        } else {
            post.save().then(() => {
                req.flash("success_msg", "Post Salvo com Sucesso!");
                res.redirect("/admin/posts");
            }).catch((err) => {
                req.flash("error_msg", "Erro ao Salvar o Post: " + err);
                res.redirect("/admin/posts");
            });
        }
    }).catch((err) => {
        req.flash("error_msg", "Post Não Existe!");
        res.redirect("/admin/posts");
    });
});

router.get("/posts/delete/:id", eAdmin, (req, res) => {
    Post.findOne({_id: req.params.id}).then((post) => {
        post.remove().then(() => {
            req.flash("success_msg", "Post Excluído com Sucesso!");
            res.redirect("/admin/posts");
        }).catch((err) => {
            req.flash("error_msg", "Erro ao Excluir Post: " + err);
            res.redirect("/admin/posts");
        });
    }).catch((err) => {
        req.flash("error_msg", "Post Não Existe!");
        res.redirect("/admin/posts");
    });
});

module.exports = router;