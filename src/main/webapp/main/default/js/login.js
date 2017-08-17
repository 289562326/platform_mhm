$(document).ready(function(){
	 $("#tbUserId").focus();
	    
	 //提交登录
	 $("#login_form").submit(function(){
		 if(check()){
			 login();
		 }
		 return false;
	 });
	 if (global.getCookie("rmbUser") === "true") {
	        $("#ck_rm").prop("checked", true);
	        $("#tbUserId").val(global.getCookie("username"));
	        $("#tbPassword").val(global.getCookie("password"));
	        window.encoded = true;
	    }
//	 $("input").bind({
//	        "keydown": function () {
//	            $("#tip").fadeOut(600);
//	        }
//	    });
});

function login(){
	var json = {
			"userId": $("#tbUserId").val(),
			"password": getPassword(),
			"userLoginName": $("#tbUserId").val()
	};
	//登录样式
	$.ajax({
		type: "put",
		headers: {
			Accept: "application/json; charset=utf-8"
		},
		url: global.appRoot + "/request/user/login",
		data: json,
		dataType: "json", 
		success: function (ret) {
			if (ret.resultCode == 0) {
				save(true);
				window.location.href = ret.resultObj.retUrl;
			}else{
				save(false);
				showMsg(ret.msgInfo);
			}
		},
		error:function(XMLHttpRequest, textStatus, errorThrown) { 
		}
	});
}
//
function showMsg(message){
	 var time =3000;
//	 var tipId =$("#tip");
//	 tipId.html('<i class="fa fa-times-circle-o"></i>' + message);
//	 tipId.fadeIn(600);
//	 setTimeout("tipId.fadeOut(600)", time);
	  
	 var tipId = "#tip";
	 $(tipId).html('<i class="fa fa-times-circle-o"></i>' + message);
	 $(tipId).fadeIn(600);
	 setTimeout("$('" + tipId + "').fadeOut(600)", time);

}
//密码
function getPassword(){
	var password = $("#tbPassword").val();
	return password;
}

//校验输入
function check(){ 
	var username = $("#tbUserId").val();
	var password = $("#tbPassword").val();
	if (username == "" || username == $("#tbUserId").attr("placeholder")) {
		showMsg("用户名不能为空");
		$("#tbUserId").focus();
		return false; 
	} 
	if (password == "" || password == $("#tbPassword").attr("placeholder")) {
		showMsg("密码不能为空");
		$("#tbPassword").focus();
		return false; 
	} 
	//$("#tip,#tip2").html(""); 
	return true; 
}

//记住用户名密码 
function save(isSave) { 
	if ($("#ck_rm").prop("checked") && isSave) {
		var username = $("#tbUserId").val();
		var password = $("#tbPassword").val();
		
		global.setCookie('username',username);
		global.setCookie('password',getPassword());
		global.setCookie('rmbUser',"true");
		
	}else{ 
		global.delCookie('username');
		global.delCookie('password');
		global.delCookie('rmbUser');
	} 
};