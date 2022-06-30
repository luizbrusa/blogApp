const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");

require("../models/Usuario");
const Usuario = mongoose.model("usuarios");

// Rotas de Usuários
router.get("/registro", (req, res) => {
    res.render("usuario/registro");
});

router.post("/novo", (req, res) => {
    var erros = [];
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome Inválido!"});
    }

    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto: "Email Inválido!"});
    }

    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({texto: "Senha Inválida!"});
    }

    if (!req.body.confirmasenha || typeof req.body.confirmasenha == undefined || req.body.confirmasenha == null){
        erros.push({texto: "Confirmação de Senha Inválida!"});
    }

    if (req.body.senha != req.body.confirmasenha){
        erros.push({texto: "Senhas Não Conferem!"});
    }

    if (erros.length > 0){
        res.render("usuario/registro", {erros: erros});
    } else{
        Usuario.findOne({email: req.body.email}).then((usuario) => {
            if (!usuario){
                let novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (err, hash) => {
                        if (err){
                            req.flash("error_msg", "Erro ao Criptografar a Senha");
                            res.redirect("/");
                        } else {
                            novoUsuario.senha = hash;
                            novoUsuario.save().then(() => {
                                req.flash("success_msg", "Usuário Cadastrado com Sucesso!");
                                res.redirect("/");
                            }).catch((err) => {
                                req.flash("error_msg", "Erro ao Cadastrar o Usuário!");
                                res.redirect("/usuario/registro");
                            });
                        }
                    });
                });
            } else{
                req.flash("error_msg", "O Usuário já existe com o e-mail: " + req.body.email);
                res.redirect("/usuario/registro");
            }
        }).catch((err) => {
            req.flash("error_msg", "Erro ao Buscar o Usuário por e-mail");
            res.redirect("/");
        });
    }
});

// Rotas de Login
router.get("/login", (req, res) => {
    res.render("usuario/login");
});

router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuario/login",
        failureFlash: true
    })(req, res, next);
});

router.get("/logoff", (req, res) => {
    req.logout((err) => {
        if (err) {
            req.flash("error_msg", "Erro ao Efetuar Logoff: " + err);
            res.redirect("/");
        } else {
            req.flash("success_msg", "Efetuado Logoff com Sucesso!");
            res.redirect("/");
        }
    });
});

module.exports = router;