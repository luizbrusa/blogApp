const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Model de Usuário
require("../models/Usuario");
const Usuario = mongoose.model("usuarios");

module.exports = function(passport) {
    passport.use(new LocalStrategy({usernameField: "email", passwordField: "senha"}, (email, senha, done) => {
        Usuario.findOne({email: email}).then((usuario) => {
            if (!usuario) {
                return done(null, false, {message: "Esta conta não Existe"});
            } else {
                bcrypt.compare(senha, usuario.senha, (err, success) => {
                    if (success) {
                        return done(null, usuario);
                    } else {
                        return done(null, false, {message: "Senha Incorreta!"});
                    }
                })
            }
        });
    }));

    // Função para colocar os dados do Usuário na Sessão ao efetuar Login
    passport.serializeUser((usuario, done) => {
        done(null, usuario.id)
    });

    // Função para remover os dados do Usuário na Sessão ao efetuar Logoff
    passport.deserializeUser((id, done) => {
        Usuario.findById(id, (err, usuario) => {
            done(err, usuario);
        })
    })
}