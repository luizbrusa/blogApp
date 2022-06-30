module.exports = {
    eAdmin: (req, res, next) => {
        if (req.isAuthenticated() && req.user.eAdmin == 1) {
            return next();
        } else {
            req.flash("error_msg", "Usuário Sem Permissão Administrativa!");
            res.redirect("/");
        }
    }
}