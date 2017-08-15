
$.fn.addtabs = function (options) {
    obj = $(this);
	var oldTab;
    Addtabs.options = $.extend({
        content: '', //直接指定所有页面TABS内容
        close: true, //是否可以关闭
        monitor: 'body', //监视的区域
        iframeUse: true, //使用iframe还是ajax
        method: 'init',
		reload:true,
        callback: function () { //关闭后回调函数
        }
    }, options || {});


    $(Addtabs.options.monitor).on('click', '[data-addtab]', function () {
        Addtabs.add({
            id: $(this).attr('data-addtab'),
            title: $(this).attr('title') ? $(this).attr('title') : $(this).html(),
            content: Addtabs.options.content ? Addtabs.options.content : $(this).attr('content'),
            url: $(this).attr('url'),
			close:$(this).attr('close')? Addtabs.options.close : $(this).attr('close'),
			reload:$(this).attr('reload') ? true : Addtabs.options.reload,
            ajax: $(this).attr('ajax') ? true : false
        });
    });

    obj.on('click', '.close-tab', function () {
        var id = $(this).parent().find("a").attr("aria-controls");
        Addtabs.close(id);
    });


    obj.on('mouseover', '.close-tab', function() {
        $(this).removeClass('glyphicon-remove').addClass('glyphicon-remove-circle');
    });

    obj.on('mouseout', '.close-tab', function() {
        $(this).removeClass('glyphicon-remove-circle').addClass('glyphicon-remove');
    });

};

window.Addtabs = {
    options:{},
    add: function (opts) {
        var id = 'tab_' + opts.id;
        obj.find('.active').removeClass('active');
        //如果TAB不存在，创建一个新的TAB    
        if (!$("#" + id)[0]) {
            var liDiv = $('<div>', {
                'class': 'liDiv'
            });
            var leftLi = $('<div>', {
                'class': 'tab-backImg-first tab-backImg-blur'
            });
            var middleLi = $('<div>', {
                'class': 'tab-backImg-second tab-backImg-blur'
            });
            var rightLi = $('<div>', {
                'class': 'tab-backImg-third tab-backImg-blur'
            });
			var a_title = $('<a>', {
			    'href': '#' + id,
                'aria-controls': id,
                'role': 'tab',
                'data-toggle': 'tab'
                }).bind('click', function() {
                    Addtabs.active($(this).parents('li').first().attr('id').substring(4));
                }).html(opts.title);
            //创建新TAB的title
			var title=$('<li>', {
                'role': 'presentation',
                'id': 'tab_' + id
            });
			if(opts.id!="home"){
                liDiv.append(leftLi);
                liDiv.append(middleLi.append(a_title));
                liDiv.append(rightLi);
            } else{
                var homeLi = $('<div>', {
                    'class':'tab-backImg-home tab-backImg-blur'
                });
                var alarmCnt = $('<span class="badge" id="alarm-cnt">0</span>');
                liDiv.append(homeLi.append(a_title.append('<img src="../resources/img/home/icon_grgzt.png">')).append(alarmCnt));
                liDiv.append(rightLi);
            }
		//是否允许关闭
            if (opts.close==null || opts.close) {
                liDiv.append(
                    $('<i>',{'class':'close-tab glyphicon glyphicon-remove'})
                );
            }
			title.append(liDiv);   

            //创建新TAB的内容
            var content = $('<div>', {
                'class': 'tab-pane',
                'id': id,
                'role': 'tabpanel'
            });

            //是否指定TAB内容
            if (opts.content) {
                content.append(opts.content);
            } else if (Addtabs.options.iframeUse && !opts.ajax) {//没有内容，使用IFRAME打开链接
                content.append(
                    $('<iframe>', {
                        'class': 'iframeClass',
                        'height': opts.height || Addtabs.defaultHeight(),
                        //'frameborder': "no",
                        //'border': "0",//iframe的右侧border不能是0，否则当页面分为横向三块能拖拽的时候，第三块拖拽有bug
						'onload': Addtabs.resize(),
                        'src': opts.url
                    }).load(function() {			
							$(this).css('background-color','#fff');			
					
                      
                    })
                );
            } else {
                $.get(opts.url, function (data) {
                    content.append(data);
                });
            }
          
            //加入TABS
            Addtabs.moveDropToTab();
            obj.children('.nav-tabs').append(title);
            obj.children(".tab-content").append(content);
        }else{
			//是否重新加载，判断url是否改变
			var oldUrl = $('#'+ id +' iframe').attr("src");
			if(opts.reload || oldUrl != opts.url){	
				$('#'+ id +' iframe').attr("src", opts.url);
			}			
        }
    
        //激活TAB
        Addtabs.active(id);
        Addtabs.drop();
    },
    close: function (id) {
        //如果关闭的是当前激活的TAB，激活他的前一个TAB
        if (obj.find("li.active").attr('id') == "tab_" + id) {
            $("#tab_" + id).prev().addClass('active').find('a').css('color',"#3c8dbc");
            $("#" + id).prev().addClass('active');
			//如果是下拉框里面的最后一个，激活显示的tab的最后一个
			if($("#tab_" + id).prev().length==0){
				Addtabs.prevHighlight();
			}
			
        }else{
			Addtabs.prevHighlight();
		}
        //关闭TAB
        $("#tab_" + id).remove();
        $("#" + id).remove();
		
        Addtabs.drop();
        Addtabs.options.callback();
    },
	prevHighlight:function(){
		obj.find('a').css('color',"#000000");	
		var lastOne = obj.find("li").last();
		lastOne.addClass("active").find('a').css('color',"#3c8dbc");
		var iframeId = lastOne.attr("id").substring(4);		
		$("#" + iframeId).addClass('active');		
	},
    drop: function (newlyAdd) {
        element = obj.find('.nav-tabs');
        //创建下拉标签
        var dropdown = $('<li>', {
            'class': 'dropdown pull-right hide tabdrop'
        }).append(
            $('<a>', {
                'id': 'tab-drop-toggle',
                'class': 'dropdown-toggle',
                'data-toggle': 'dropdown',
                'href': '#'
            }).append(
                $('<i>', {'class': "glyphicon glyphicon-align-justify"})
            ).append(
                $('<b>', {'class': 'caret'})
            )
        ).append(
            $('<ul>', {'class': "dropdown-menu", 'id':"tab-drop-menu"})
        );

        //检测是否已增加
        if (!$('.tabdrop').html()) {
            dropdown.prependTo(element);
        } else {
            dropdown = element.find('.tabdrop');
        }
        //检测是否有下拉样式
        if (element.parent().is('.tabs-below')) {
            dropdown.addClass('dropup');
        }

        Addtabs.fixDrop();
    },
    fixDrop: function() {
        var element = obj.find('.nav-tabs');
        var dropdown = element.find('.tabdrop');
        var dropMenu = dropdown.find('ul');
        Addtabs.moveDropToTab();
        var collection = 0;
        //检查超过一行的标签页
        var siderWidth = $('.main-sidebar').width();
        var elWidth = element.width();	
        var headerHeight = $('.main-header').height();
        element.append(dropdown.find('li'))
            .find('>li')
            .not('.tabdrop')
            .each(function () {
				//console.log(elWidth - ($(this).position().left - siderWidth) - $(this).width());
                if (this.offsetTop > headerHeight + 15 ||
                    (elWidth - ($(this).position().left - siderWidth) - $(this).width() < 57)) {
                    dropMenu.append(Addtabs.convertDropMenu($(this)));
                    collection++;
                }
            });

        //如果有超出的，显示下拉标签
        if (collection > 0) {
            dropdown.removeClass('hide');
            if (dropdown.find('.active').length == 1) {
                dropdown.addClass('actived');
            } else {
                dropdown.removeClass('actived');
            }
        } else {
            dropdown.addClass('hide');
        }
    },
    moveDropToTab: function() {
        var element = obj.find('.nav-tabs');
        var dropdown = element.find('.tabdrop');
        var dropMenu =$('.dropdown-menu');
        obj.children('.nav-tabs').append(Addtabs.covertTab(dropMenu.children()));
        dropMenu.empty();
    },
	resize:function(){
		Addtabs.fixDrop();
	},
    defaultHeight: function() {
        var tabH = $('.nav-tabs').height() || 40;
        return $(window).height() - $('.main-header').height() - tabH - 10;
    },
    closeMenu: function() {
        //$('.dropdown-menu:visible').prev().trigger('click');
        //if ($.isFunction(window.hideMenu)) {
        //    window.hideMenu();
        //}
        //用上面的方法按钮还是focus状态的，不行
        $('.main-header').trigger('click');
    },
	covertTab:function(liObj){
		liObj.each(function(){
			$(this).find('.liDiv').children().eq(0).addClass('tab-backImg-first').removeClass('tab-backImg-first-menu');
			$(this).find('.liDiv').children().eq(1).addClass('tab-backImg-second').removeClass('tab-backImg-second-menu')
			$(this).find('.liDiv').children().eq(2).addClass('tab-backImg-third').removeClass('tab-backImg-third-menu');
		});
		
		return liObj;
	},
	convertDropMenu:function(liObj){
		liObj.find('.liDiv').children().eq(0).addClass('tab-backImg-first-menu').removeClass('tab-backImg-first');
		liObj.find('.liDiv').children().eq(1).addClass('tab-backImg-second-menu').removeClass('tab-backImg-second')
		liObj.find('.liDiv').children().eq(2).addClass('tab-backImg-third-menu').removeClass('tab-backImg-third');
		return liObj;
	},
    active: function(id) {
		obj.find('.active').removeClass('active');
        $("#tab_" + id).addClass('active');
        $("#" + id).addClass("active");
        $("#tabs").find('a').css('color', "#000000");
        $("#tab_" + id).find('a').css('color', "#3c8dbc");
    }
};