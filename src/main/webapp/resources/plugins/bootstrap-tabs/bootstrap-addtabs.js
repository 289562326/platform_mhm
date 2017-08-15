znv.Tab = function (el, options) {
    var self = this;
    var c = this.config = $.extend({
        content: '', //直接指定所有页面TABS内容
        close: true, //是否可以关闭
        monitor: 'body', //监视的区域
        iframeUse: true, //使用iframe还是ajax
        method: 'init',
        reload: true,
        callback: function () { //关闭后回调函数
        }
    }, options || {});
    var obj = this.obj = $(el);
    $(c.monitor).on('click', '[data-addtab]', function () {
        self.add({
            id: $(this).attr('data-addtab'),
            title: $(this).attr('title') ? $(this).attr('title') : $(this).html(),
            content: c.content ? c.content : $(this).attr('content'),
            url: $(this).attr('url'),
            close: $(this).attr('close') ? c.close : $(this).attr('close'),
            reload: $(this).attr('reload') ? true : c.reload,
            ajax: $(this).attr('ajax') ? true : false
        });
    });

    obj.on('click', '.close-tab', function () {
        var id = $(this).parent().find("a").attr("aria-controls");
        self.close(id);
    });


    obj.on('mouseover', '.close-tab', function () {
        $(this).removeClass('glyphicon-remove').addClass('glyphicon-remove-circle');
    });

    obj.on('mouseout', '.close-tab', function () {
        $(this).removeClass('glyphicon-remove-circle').addClass('glyphicon-remove');
    });
};
$.extend(znv.Tab.prototype, {
    add: function (opts) {
        var self = this;
        var obj = this.obj;
        var id = 'tab_' + opts.id;
        obj.find('.active').removeClass('active');
        //如果TAB不存在，创建一个新的TAB
        if (!$("#" + id)[0]) {
            var liDiv = $('<div>', {
                'class': 'liDiv'
            }).bind('contextmenu', function (e) {
                showTabRight(e);
                var li = $(e.target).parents('li:first');
                window.currentTabId = li.attr('id').substring(4);
                return false;
            });
            var leftLi = $('<div>', {
                'class': 'tab-backImg-first tab-backImg-blur tab-border'
            });
            var middleLi = $('<div>', {
                'class': 'tab-backImg-second tab-backImg-blur tab-border'
            });
            var rightLi = $('<div>', {
                'class': 'tab-backImg-third tab-backImg-blur tab-border'
            });
            var a_title = $('<a>', {
                'href': '#' + id,
                'aria-controls': id,
                'role': 'tab',
                'data-toggle': 'tab'
            }).bind('click', function () {
                self.active($(this).parents('li').first().attr('id').substring(4));
            }).html(opts.title);
            //创建新TAB的title
            var title = $('<li>', {
                'role': 'presentation',
                'id': 'tab_' + id
            });
            if (opts.id != "home") {
                liDiv.append(leftLi);
                liDiv.append(middleLi.append(a_title));
                liDiv.append(rightLi);
            } else {
                var homeLi = $('<div>', {
                    'class': 'tab-backImg-home tab-backImg-blur tab-border'
                });
                var alarmCnt = $('<span class="badge" id="alarm-cnt">0</span>');
                liDiv.append(homeLi.append(a_title.append('<img src="../resources/img/home/icon_grgzt.png">')).append(alarmCnt));
                liDiv.append(rightLi);
            }
            //是否允许关闭
            if (opts.close == null || opts.close) {
                liDiv.append(
                    $('<i>', {'class': 'close-tab glyphicon glyphicon-remove'})
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
            } else if (this.config.iframeUse && !opts.ajax) {//没有内容，使用IFRAME打开链接
                //url加个数字 防止IE缓存出现的iframe的内容不匹配bug
                var u = opts.url, t = new Date().getTime();
                if (u.indexOf('?') > 0) {
                    u += '&_=' + t;
                } else {
                    u += '?_=' + t;
                }
                content.append(
                    $('<iframe>', {
                        'class': 'iframeClass',
                        'height': opts.height || this.defaultHeight(),
                        //'frameborder': "no",
                        //'border': "0",//iframe的右侧border不能是0，否则当页面分为横向三块能拖拽的时候，第三块拖拽有bug
                        'onload': this.resize(),
                        'src': u
                    }).load(function () {
                        $(this).css('background-color', '#fff');
                    })
                );
            } else {
                $.get(opts.url, function (data) {
                    content.append(data);
                });
            }

            //加入TABS
            this.moveDropToTab();
            obj.children('.nav-tabs').append(title);
            obj.children(".tab-content").append(content);
        } else {
            //是否重新加载，判断url是否改变
            var oldUrl = $('#' + id + ' iframe').attr("src");
            if (opts.reload || oldUrl != opts.url) {
                $('#' + id + ' iframe').attr("src", opts.url);
            }
        }

        //激活TAB
        this.active(id);
        this.drop();
    },
    close: function (id) {
        var obj = this.obj;
        //如果关闭的是当前激活的TAB，激活他的前一个TAB
        if (obj.find("li.active").attr('id') == "tab_" + id) {
            this.active($("#" + id).prev().attr('id'));
            //如果是下拉框里面的最后一个，激活显示的tab的最后一个
            if ($("#tab_" + id).prev().length == 0) {
                this.prevHighlight();
            }
        }
        //关闭TAB
        $("#tab_" + id).remove();
        $("#" + id).remove();

        this.drop();
        this.config.callback();
    },
    prevHighlight: function () {
        var obj = this.obj;
        obj.find('a').css('color', "#000000");
        var lastOne = obj.find("li").last();
        lastOne.addClass("active").find('a').css('color', "#3c8dbc");
        var iframeId = lastOne.attr("id").substring(4);
        $("#" + iframeId).addClass('active');
    },
    drop: function (newlyAdd) {
        var obj = this.obj;
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
            //$('<ul>', {'class': "dropdown-menu", 'id': "tab-drop-menu"})
            $('<div class="dropdown-menu" id="tab-drop-menu"></div>').append(
                $('<iframe>', {id: "menutabdrop",'src' : znv.appRoot + '/main/home/menu-tabdrop.html'})
            )
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

        this.fixDrop();
    },
    fixDrop: function () {
        var self = this;
        var obj = this.obj;
        var element = obj.find('.nav-tabs');
        var dropdown = element.find('.tabdrop');
        var df = document.getElementById('menutabdrop');
        if (!df || !df.contentWindow.$) {
            return;
        }
        var dropMenu = df.contentWindow.$('#tab-drop-menu');
        this.moveDropToTab();
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
                    (elWidth - ($(this).position().left - siderWidth) - $(this).width() < 90)) {
                    dropMenu.append(self.convertDropMenu($(this)));
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
            $(df).css('height', collection * 34 + 10);
        } else {
            dropdown.addClass('hide');
        }
    },
    moveDropToTab: function () {
        var obj = this.obj;
        var element = obj.find('.nav-tabs');
        var dropdown = element.find('.tabdrop');
        var df = document.getElementById('menutabdrop');
        if (!df || !df.contentWindow.$) {
            return;
        }
        var dropMenu = df.contentWindow.$('#tab-drop-menu');
        obj.children('.nav-tabs').append(this.covertTab(dropMenu.children()));
        dropMenu.empty();
    },
    resize: function () {
        this.fixDrop();
    },
    defaultHeight: function () {
        var tabH = $('.nav-tabs').height() || 40;
        return $(window).height() - $('.main-header').height() - tabH - 10;
    },
    closeMenu: function () {
        //$('.dropdown-menu:visible').prev().trigger('click');
        //if ($.isFunction(window.hideMenu)) {
        //    window.hideMenu();
        //}
        //用上面的方法按钮还是focus状态的，不行
        $('.main-header').trigger('click');
    },
    covertTab: function (liObj) {
        liObj.each(function () {
            $(this).find('.liDiv').children().eq(0).addClass('tab-backImg-first').removeClass('tab-backImg-first-menu tab-border');
            $(this).find('.liDiv').children().eq(1).addClass('tab-backImg-second').removeClass('tab-backImg-second-menu tab-border')
            $(this).find('.liDiv').children().eq(2).addClass('tab-backImg-third').removeClass('tab-backImg-third-menu tab-border');
        });

        return liObj;
    },
    convertDropMenu: function (liObj) {
        liObj.find('.liDiv').children().eq(0).addClass('tab-backImg-first-menu').removeClass('tab-backImg-first');
        liObj.find('.liDiv').children().eq(1).addClass('tab-backImg-second-menu').removeClass('tab-backImg-second')
        liObj.find('.liDiv').children().eq(2).addClass('tab-backImg-third-menu').removeClass('tab-backImg-third');
        return liObj;
    },
    active: function (id, tabMenuEl) {
        var obj = this.obj;
        if (!tabMenuEl) {
            tabMenuEl = $("#tab_" + id);
        }

        obj.find('.active').removeClass('active');
        $("#tab_" + id).addClass('active').children().children().each(function(){
        	var $this = $(this);
        	$this.addClass("tab-border");
        });
        
        $("#" + id).addClass("active").show();
        //todo use css
        $("#tabs").find('a').css('color', "#000000");
        $("#tabs").find('li[id^="tab_"]:not(.active)').each(function(){
        	var _this = $(this);
        	_this.children().children().each(function(){
            	var $this = $(this);
            	$this.removeClass("tab-border");
            });
        });
        var df = document.getElementById('menutabdrop');
        if (df && df.contentWindow.$) {
            df.contentWindow.tryActive(id);
        }
        tabMenuEl.addClass('active');
        tabMenuEl.find('a').css('color', "#3c8dbc");

        obj.find('.tab-pane:not(:first)').hide();
        $("#" + id).addClass("active").show();

        $(this.config.monitor).find('.selected[data-addtab]').removeClass('selected');
        $('#menu-' + id.substring(4)).addClass('selected');
    },
    closeAll: function() {
        var df = document.getElementById('menutabdrop');
        if (df && df.contentWindow.$) {
            df.contentWindow.closeAll();
        }
        $.each($('a[data-toggle="tab"]'), function() {
            var id = $(this).attr('aria-controls');
            if (id != 'tab_home') {
                Addtabs.close(id);
            }
        });
    },
    closeOther: function() {
        var df = document.getElementById('menutabdrop');
        if (df && df.contentWindow.$) {
            df.contentWindow.closeOther(currentTabId);
        }
        $.each($('a[data-toggle="tab"]'), function () {
            var id = $(this).attr('aria-controls');
            if (id != 'tab_home' && id != window.currentTabId) {
                Addtabs.close(id);
            }
        });
    }
});
