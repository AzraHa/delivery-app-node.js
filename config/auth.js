module.exports = {
    isAuthenticatedSuperAdmin : function (req, res, next) {
        if (req.isAuthenticated()){
            if(req.user.role === 'superAdmin'){
                return next();
            }else{
                res.redirect('back');
            }
        }else{
            res.redirect('back');
        }
    },
    isAuthenticatedAdmin : function (req, res, next) {
        if (req.isAuthenticated()){
            if(req.user.role === 'adminrestaurant'){
                return next();
            }else{
                res.redirect('back');
            }
        }else{
            res.redirect('back');
        }
    },
    isAuthenticatedCustomer : function (req, res, next) {
        if (req.isAuthenticated()){
            if(req.user.role === 'customer'){
                return next();
            }else{
                res.redirect('back');
            }
        }else{
            res.redirect('back');
        }
    },
    isAuthenticatedSupplier : function (req, res, next) {
        if (req.isAuthenticated()){
            if(req.user.role === 'supplier'){
                return next();
            }else{
                res.redirect('back');
            }
        }else{
            res.redirect('back');
        }
    },

    isLoggedIN : function(req,res,next){
        if (req.isAuthenticated()){
            if(req.user.role === 'supplier'){
                res.redirect('/supplier/dashboard');
            }else if(req.user.role === 'superAdmin'){
                res.redirect('/adminRestaurant/dashboard');
            }else if(req.user.role === 'superAdmin'){
                res.redirect('/admin/dashboard');
            }else if(req.user.role === 'customer'){
                res.redirect('/users/dashboard');
            }
        }else{
            res.render('index');
        }
    }
};
