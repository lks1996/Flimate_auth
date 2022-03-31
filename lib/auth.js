module.exports = {
    isOwner:function(request, response) {
        if (request.user) {
            return true;
        } else {
            return false;
        }
    },
    statusUI:function(request, response) {
        var authStatusUI = `
            <a href="/auth/login">Sign In</a> |
            <a href="/auth/register">Join</a> |
            <a href="/auth/google">Sign In with Google</a>`
        if (this.isOwner(request, response)) {
            authStatusUI = `${request.user.displayName} | <a href="/auth/logout">Sign Out</a>`;
        }
        return authStatusUI;
    }
}
