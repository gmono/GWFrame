/**
 * Created by gaozijian on 2016/12/10.
 */

//基础数据结构增强
/**
 * @return {boolean}
 */
Array.prototype.Has=function (val){
    var index=this.findIndex(function (str) {
        return str==val;
    });
    return index != -1;
};

Array.prototype.forEach=function (fun) {
    //fun(node,index)
    Frame.forEach(this,fun);
};
Array.prototype.Pureify=function () {
    //清除undefined null ''
    this.removeAll(['',undefined,null]);
};
Array.prototype.ObjectIfy=function(){
    //清除undefined null 空字符串 包括只有空格和换行符的字符串
    var fun=function(val){
        if(val==undefined||val==null) return true;
        if(typeof(val)=='string'){
            if(val.trim()=='') return true;
        }
        return false;
    };
    this.removeIf(fun);
};
Array.prototype.remove=function (index) {
    this.splice(index,1);
};
Array.prototype.removeIf=function (fun) {
    for(var t=0;t<this.length;++t){
        if(fun(this[t])) this.remove(t);
    }
};
Array.prototype.removeAll=function (vals) {
    var fun=function(val){
        for(var t=0;t<vals.length;++t){
            if(vals[t]==val) return true;
        }
        return false;
    };
    this.removeIf(fun);
};
Object.prototype.Copy=function () {
    var ret={};
    for(var t in this){
        ret[t]=this[t];
    }
    return ret;
};
String.prototype.format = function (args) {
    var result = this;
    if (arguments.length > 0) {
        if (arguments.length == 1 && typeof (args) == "object") {
            for (var key in args) {
                if (args[key] != undefined) {
                    var reg = new RegExp("({" + key + "})", "g");
                    result = result.replace(reg, args[key]);
                }
            }
        }
        else {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] != undefined) {           //var reg = new RegExp("({[" + i + "]})", "g");//这个在索引大于9时会有问题，谢谢何以笙箫的指出
                    var reg = new RegExp("({)" + i + "(})", "g");
                    result = result.replace(reg, arguments[i]);
                }
            }
        }
    }
    return result;
};

var Frame={};
//框架初始化规则
Frame.InitList={};
//目前发现对象的成员加入的顺序和遍历时顺序一样 故不设保存key的列表
//初始化数据结构name:{initfun:function,requires:[name1,name2]}
Frame.Init=function (name,initobj) {
    //排错
    if(initobj==undefined||initobj==null) return;
    if(name==undefined|name==null||name==""||name in Frame.InitList) return;
    //检测requires
    var requires=initobj.requires;
    for(var t=0;t<requires.length;++t){
        if(!(requires[t] in Frame.InitList)) return;//如果列表里没有
    }
    //加入
    Frame.InitList[name]=initobj.initfun;//保存初始化函数
};
Frame.InItFuns=[];//这是无序初始化函数的列表
Frame.OnLoad=function (initfun) {
    Frame.InItFuns.push(initfun);
}
window.onload=function () {
    for(var t in Frame.InitList){
        var fun=Frame.InitList[t];
        fun();
    }
    //先模块初始化 再无序初始化
    Frame.InItFuns.forEach(function(fun){fun()});
};
//以上为初始化过程








//类控制
/**
 * @return {string}
 */
Frame.AToStr=function (arr) {
    var ret="";
    for(var t=0;t<arr.length;++t){
        ret+=arr[t]+" ";
    }
    return ret;
};
Frame.GetClasses=function (node) {
    var cstr=node.getAttribute('class');
    var ret=cstr.split(' ');
    ret.ObjectIfy();
    return ret;
};
Frame.DelClass=function (node,classname) {
    var classes = Frame.GetClasses(node);
    var index = classes.findIndex(function (str) {
        return str == classname;
    });
    if (index != -1) {
        classes.remove(index);
    }
    node.setAttribute('class', Frame.AToStr(classes));
};
//没有就添加否则不管
Frame.AddClass=function (node,classname) {
    var classes=Frame.GetClasses(node);
    var index=classes.findIndex(function (str) {
        return str==classname;
    });
    if(index==-1){
        classes.push(classname);
        var ret=Frame.AToStr(classes);
        node.setAttribute('class',ret);
    }
};
//添加或替换 isadd为假则单纯替换
Frame.RepClass=function (node,oclass,nclass,isadd) {
    var classes=Frame.GetClasses(node);
    var index=classes.findIndex(function (str) {
        return str==oclass;
    });
    if(index==-1){
        if(isadd)
            classes.push(nclass);
        else return;
    }
    else classes[index]=nclass;
    var ret=Frame.AToStr(classes);
    node.setAttribute('class',ret);
};
//单纯替换
Frame.ResetClass=function (node,oclass,nclass) {
    Frame.RepClass(node,oclass,nclass,false);
};

//结构增强
Frame.forEach=function(narr,fun){
    //fun(node,index)
    for(var t=0;t<narr.length;++t){
        fun(narr[t],t);
    }
};




//CSS处理器
Frame.Css={};
Frame.Css.CNameToJName=function (cname) {
    //转换-分割为驼峰
    var ret="";
    var up=false;
    for(var t=0;t<cname.length;++t){
        var c=cname[t];
        if(c=='-'){
            up=true;
            continue;
        }
        if(up){
            c=c.toUpperCase();
            up=false;
        }
        ret+=c;
    }
    return ret;
};







//数据结构增强

HTMLElement.prototype.class=function (cname,ncname) {
    if(ncname==undefined){
        //这是添加类的情况
        Frame.AddClass(this,cname);
    }
    else{
        //这是替换类的情况
        Frame.ResetClass(cname,ncname);
    }
};
HTMLElement.prototype.delclass=function (cname) {
    Frame.DelClass(this,cname);
};
HTMLElement.prototype.hasclass=function (cname) {
    var classes=Frame.GetClasses(this);
    return classes.Has(cname);
};
HTMLElement.prototype.css=function (name,val) {
    var jname=Frame.Css.CNameToJName(name);
    if(val==undefined){
        //取css
        var code="this.style."+jname;
        return eval(code);
    }
    var code="this.style."+jname+"=\""+val+"\";";
    return eval(code);
    //理论上设置时不会返回值
};
HTMLCollection.prototype.forEach=Array.prototype.forEach;
HTMLCollection.prototype.map=Array.prototype.map;












//辅助函数区域
Frame.Helper={};
Frame.Helper.LoadIDS=function(idarr){
    //批量获取node by id
    var ret={};
    idarr.forEach(function (id) {
        var node=document.getElementById(id);
        ret[id]=node;
    });
    return ret;
};
Frame.Helper.LoadIDSToArray=function(idarr){
    //批量获取node by id to array
    var ret=[];
    idarr.forEach(function (id) {
        var node=document.getElementById(id);
        if(node==null) return null;
        ret.push(node);
    });
    return ret;
};
Frame.Helper.CreateEach=function (arr,sfun) {
    //迭代器生成器
    //sfun为转换函数 function(v)
    var t=0;
    var fun=function () {
        if(t>=arr.length) return null;//迭代到末尾
        if(sfun==null||sfun==undefined) sfun=function (v) {
            return v;
        };
        return sfun(arr[t++]);
    };
    return fun;
};
Frame.Helper.Zip=function (arrlist,keylist) {
    //arrlist [dfun1,dfun2] -> [{keylist[0]:1,keylist[1]:1},{keylist[0]:2,keylist[1]:2}]
    //如果keylist==undefined 则为-> [[1,1],[2,2],[3,3]]
    //没有keylist则相当于矩阵转置
    //迭代器合成
    var keyfun=function (subarr,keylist) {
        //keylist限长
        //返回{key:val,key:val}
        var t=0;
        var obj={};
        for(var s in keylist){
            var name=keylist[s];
            obj[name]=subarr[t++];
        }
        return obj;
    };
    var afun=function (subarr) {
        return subarr;
    };
    var fun=keylist==undefined? afun:keyfun;
    var retarr=[];
    ok:
        for(;;)
        {
            //t指示列号
            var sarr=[];
            for(var s=0;s<arrlist.length;++s){
                var val=arrlist[s]();//使用s号迭代器求得一个数 如果为null则代码到达末尾
                if(val==null) break ok;
                sarr.push(val);
            }
            retarr.push(fun(sarr));
        }
    return retarr;
};














//dom操作区域
Frame.Dom={};
Frame.Dom.TextToNodes=function (text) {
    var cont = document.createElement('div');
    cont.innerHTML = text;
    return cont.childNodes;
};
Frame.Dom.TextToTags=function (text) {
    var cont = document.createElement('div');
    cont.innerHTML = text;
    return cont.children;
};
//从一个只包含一个html节点的文本中获得那一个节点
Frame.Dom.GetNodeFromText = function (text) {
    return Frame.Dom.TextToTags(text)[0];
    //返回第一个子元素 适用于文本中只有一个元素的情况
};
Frame.Dom.forEach=function (node,fun) {
    //扫描子孙节点列表
    if(node.nodeName.toUpperCase()=="#TEXT") return;
    if(!node.hasChildNodes()) return;
    var childs=node.childNodes;
    for(var t=0;t<chids.length;++t){
        var tnode=childs[t];
        fun(tnode);
        Frame.Dom.forEach(tnode,fun);
    }
}
Frame.Dom.CreateNode=function (tagname,prolist,classlist,id,cont){
    //此函数由指定类列表和id tagname合成一个node
    //pro:{name,val}
    var classls="";
    classlist.forEach(function (val) {
        classls+=val+" ";
    });
    var protxt="";
    if(prolist!=null)
        for(var t=0;t<prolist.length;++t){
            protxt+=prolist[t].name+'="'+prolist[t].val+'" ';
        }
    var text="";
    if(id!=null)
        text='<{0} id="{1}" class="{2}" {3}>{4}</{0}>'.format(tagname,id,classls,protxt,cont);
    else text='<{0} class="{1}" {2}>{3}</{0}>'.format(tagname,classls,protxt,cont);
    return Frame.Dom.GetNodeFromText(text);
};













//ajax区域
Frame.Ajax={};
Frame.Ajax.load = function (url, met, fun, async, data) {
    if (async == undefined || async == null) async = true; //默认同步模式
    var xhr = new XMLHttpRequest();
    xhr.open(met, url, async);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var text = xhr.responseText;
            fun(text);
        }
    }
    if (met == 'POST') {
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.send(loader.toText(data));
    }
    else xhr.send();
};
Frame.Ajax.loadfile = function (url, fun, async) {
    Frame.Ajax.load(url, "GET", fun, async);
};
Frame.Ajax.loadToNode = function (node, url, cbk) {
    //返回页面js对象
    //如果cbk为undefined 则同步 否则异步 其中cbk为null则不回调
    //返回的是script对象字典
    //script对象具有objname属性 没有的不算
    var ret={};
    Frame.Ajax.loadfile(url, function (text) {
        node.innerHTML = text;
        //以下取出页面的js标签执行
        var fun=function(tnode){
            if (tnode.tagName == 'SCRIPT'&&tnode.getAttribute('objname')!=null) {
                var str = tnode.innerHTML;
                var oname=tnode.getAttribute('objname');
                ret[oname] = eval("new (function(){ {0} })();".format(str));
            }
        };
        node.children.forEach(fun);
    }, cbk!=undefined);
    if(cbk==undefined) return ret;
    else if(cbk!=null) cbk(ret);
}











//全屏滚动相关
//滚动器
Frame.View={};
Frame.View.Scroller=function (node,time,islisten,listenobj) {
    //这是一个对象
    //用于实现node的子节点滚动
    var fr=0;//0代表无效 1垂直 2水平
    if(node.hasclass('v-view')) fr=1;
    else if(node.hasclass('h-view')) fr=2;
    if(fr==0) throw new Error('这不是一个滚动框');
    this.next=function () {
        var tnode=node.children[0];
        var pro=fr==1?['margin-top','vh']:['margin-left','vw'];
        tnode.css(pro[0],'-100'+pro[1]);
        setTimeout(function(){
            tnode.css('display','none');
            node.appendChild(tnode);
            tnode.css(pro[0],'0');
            tnode.css('display','block');
        },time);

    };
    this.back=function () {
        //next的方过程
        var tnode=node.children[node.children.length-1];
        var pro=fr==1?['margin-top','vh']:['margin-left','vw'];
        tnode.css('display','none');
        node.insertBefore(tnode,node.children[0]);
        tnode.css(pro[0],'-100'+pro[1]);
        tnode.css('display','block');
        setTimeout(function(){
            tnode.css(pro[0],'0');
        },10);//这是为了神tm的chrome搞的10ms延迟 虽然有点影响体验但好歹让行为没有那么多意外出现了…………




    };
    var tlcall=function (num,dl,f) {
        var fun=function(){
            if(num==0) return;
            f();
            num--;
            setTimeout(fun,dl);
        };
        setTimeout(fun,dl);
    };
    this.nextn=function (num,dl) {
        //执行多次next 间隔dl ms
        tlcall(num,dl,this.next);
    };
    this.nextn=function (num) {
        tlcall(num,dl,this.back);
    };
    if(islisten){
        //监听鼠标滚动
        var fthis=this;
        var isok=true;
        var fun=function(e){
            if(!isok) return;
            // if(Math.abs(e.deltaY)<400) return;
            if(e.deltaY>0){
                fthis.next();
            }
            else fthis.back();
            isok=false;
            setTimeout(function () {
                isok=true;
            },time);
        };
        if(listenobj!=undefined) listenobj.addEventListener('mousewheel',fun);
        else node.addEventListener('mousewheel',fun);
    }
};














//以下为动画辅助
Frame.Animation={};
//从一个节点中得到文本并清除其文本
Frame.Animation.CutNode=function (node) {
    var text=node.innerText;
    node.innerText="";
    return text;
};
Frame.Animation.TimeIn=function (fnode,tfun,isnofirst,index,dir,endcbk) {
    //此为分时进入时序逻辑
    //tfun为迭代器 每次调用返回一个对象 {node,time}
    //isfirst指示第一个node的延时是否应该被忽略，undefined等同于true
    //index指定插入位置 如果为负数或undefined则表示插入道最后
    //此逻辑用于思想非固定间隔时间逻辑
    //fnode 为容器
    //dir为方向 bool true为后向 false为前向 undefined=true
    //注意前向延伸的末尾位置为length 后向延伸为length-1
    //结束时tfun返回null 不能为其他
    //endcbk为动画结束时的回调 可以为空

    //默认值处理
    isnofirst=isnofirst==undefined||isnofirst==null? true:isnofirst;
    index=(index == undefined ||index==null|| index < 0)? (!dir ? fnode.children.length : fnode.children.length - 1) : index;
    dir=dir == undefined||dir==null;
    //处理完毕
    var nownode=tfun();
    var fun=function () {
        //此函数每次调用 将nownode的node加入fnode中
        //并获取一个新的信息对象 根据time设置timeout
        fnode.insertBefore(nownode.node,fnode.children[dir?index+1:index]);
        if(dir) index++;
        //延时
        nownode=tfun();
        if(nownode==null) {
            if(endcbk!=null&&endcbk!=undefined) endcbk();//可以调用就调用结束回调函数
            return;
        }
        setTimeout(fun,nownode.time);
    };
    //若为前向延伸 则index不变 每次insert到此位置
    //若为后向延伸 则每次index+1 每次insert到index+1位置
    if(isnofirst) fun();
    else setTimeout(fun,nownode.time);
}
Frame.Animation.InvIn=function (fnode,tfun,time,isnofirst,index,dir,endfun) {
    //此tfun返回node 没有time
    //固定间隔延时
    var fun=function(){
        var obj={node:tfun(),time:time};
        if(obj.node==null) return null;
        else return obj;
        //以上遵守迭代器规范 一旦迭代到末尾返回null
    };
    Frame.Animation.TimeIn(fnode,fun,isnofirst,index,dir,endfun);
};
//以下为动画集 任何动画的添加都添加到此字典中
Frame.Animation.Animats={
    'fast-blurin':{cls:['word-fadein'],optcls:[]},
    'slow-blurin':{cls:['line-fadein'],optcls:[]}
};
Frame.Animation.AnimatModes=['inldiv','inlbldiv','blockdiv'];
Frame.Animation.CreateNode=function (aniname,data,mode,opt) {
    //给定一个动画名和一个数据 以及模式和选项
    //mode 0 1 2 inline inline-block block
    //opt为一个数组 其中存储了具体某个动画的optcls索引列表
    //代表对某个动画进行配置
    var ani=Frame.Animation.Animats[aniname];
    var cls=[];
    if(opt!=null&&opt!=undefined) for(var i=0;i<opt.length;++i){
        cls.push(ani.optcls[opt[i]]);
    }
    cls=cls.concat(ani.cls);
    if(mode>=0&&mode<Frame.Animation.AnimatModes.length)
        cls.push(Frame.Animation.AnimatModes[mode]);
    var node=Frame.Dom.CreateNode('div',null,cls,null,data);
    return node;
};









//以上为动画框架的全部内容 下面为辅助内容
Frame.Animation.Text={};//文本相关
Frame.Animation.Text.MultiIn=function (parameters) {
    var fnode = parameters.fnode;
    var aniname = parameters.aniname;
    var text = parameters.data;
    var spchar = parameters.splitstr;
    var time = parameters.time;
    var mode = parameters.mode;
    var endfun=parameters.endfun;

    if(text==null||text==undefined) text=Frame.Animation.CutNode(fnode);
    //这个时将text用f分割后依次加入
    var tlist=text.split(spchar);
    var t=0;
    var fun=function (str) {
        return Frame.Animation.CreateNode(aniname,str,mode);
    };
    var dfun=Frame.Helper.CreateEach(tlist,fun);
    Frame.Animation.InvIn(fnode,dfun,time,null,null,null,endfun);
};
Frame.Animation.Text.CharIn=function (parameters) {
    var fnode = parameters.fnode;
    var aniname = parameters.aniname;
    var text = parameters.data;
    var time = parameters.time;
    var endfun=parameters.endfun;
    if(text==null||text==undefined) text=Frame.Animation.CutNode(fnode);//执行默认规则
    var fun=function (str) {
        return Frame.Animation.CreateNode(aniname,str,0);
    };
    var dfun=Frame.Helper.CreateEach(text,fun);
    Frame.Animation.InvIn(fnode,dfun,time,null,null,null,endfun);
}
Frame.Animation.Text.LineIn=function (parameters) {
    var fnode = parameters.fnode;
    var aniname = parameters.aniname;
    var text = parameters.data;
    var time = parameters.time;
    var endfun=parameters.endfun;
    Frame.Animation.Text.MultiIn({fnode: fnode, aniname: aniname, text: text, splitstr: '\n', time: time,endfun:endfun});
};
//以上为动画函数标准形式 都只接受一个对象 并且名字fnode aniname data time endfun四个参数为固定参数 其他自定
//所有模块遵循一个标准 即如果data为null或undefined则自动取fnode中的内容为data
//以上为文本辅助部分，注意，每个辅助模块都必须放在Frame.Animation.XXX的容器里以避免混乱

//以下为动画列表类
Frame.Animation.ApplySet=function (dfun) {
    //dfun为迭代器返回的是一个动画指示对象
    //指示对象范式 {mod:'Text',met:CharIn,par:{}}
    var endfun=function () {
        var obj=dfun();
        if(obj==null) return;
        var npar=obj.par.Copy();
        npar.endfun=endfun;
        var code="Frame.Animation.{0}.{1}(npar);".format(obj.mod,obj.met);
        eval(code);
    };
    endfun();
};
Frame.Animation.ApplyList=function (modname,metname,par,datalist) {
    //对多个数据应用同一个动画
    //以上为fnode和data不确定的par
    //datalist [{fnode,data}]
    var now=0;
    var dfun=function () {
        if(now>=datalist.length) return null;
        var npar=par.Copy();
        var temp=datalist[now++];
        npar.data=temp.data;
        npar.fnode=temp.fnode;
        var ret={mod:modname,met:metname,par:npar};
        return ret;
    };
    Frame.Animation.ApplySet(dfun);
}
//以下为element动画增强部分
HTMLCollection.prototype.animal=function (modename,metname,aniname,time) {
    Frame.Animation.ApplyList(modename,metname,{time:time,aniname:aniname},
        this.map(function (n) {
            return {fnode:n,data:Frame.Animation.CutNode(n)};
        }));
};
//node array
Array.prototype.animal=HTMLCollection.prototype.animal;
HTMLElement.prototype.animal=function (modename,metname,aniname,time) {
    [this].animal(modename,metname,aniname,time);
}