var global = {
    setCookie: function (name, value) {
        // 写cookies
        var Days = 30;
        var exp = new Date();
        exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
        document.cookie = name + "=" + escape(value) + "; Expires=" + exp.toGMTString() + "; Path=/";
    },
    getCookie: function (name) {
        // 读取cookies
        var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
        if (arr = document.cookie.match(reg)) return unescape(arr[2]);
        else return null;
    },
    delCookie: function (name) {
        // 删除cookies
        var exp = new Date();
        exp.setTime(exp.getTime() - 10000);
        var cval = global.getCookie(name);
        if (cval != null) document.cookie = name + "=" + cval + ";path=/;expires=" + exp.toGMTString();
    }
};
//后端设置
global.appRoot = global.getCookie("contextPath");
global.loginUser = global.getCookie("loginUser");