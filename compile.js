/**
 * Created by kevin on 2018/03/20.
 */
function Compile(el,vm){
    this.$vm=vm;
    this.$el = this.isElementNode(el) ? el : document.querySelector(el);
    if(this.$el){
        this.$fragment=this.node2Fragment(this.$el);
        this.init();
        this.$el.appendChild(this.$fragment);
    }
}
Compile.prototype={
    init:function(){
        this.compileElement(this.$fragment);
    },
    node2Fragment:function(el){
        var fragment=document.createDocumentFragment(),child;
        while (child=el.firstChild){
            fragment.appendChild(child);
        }
        return fragment;
    },
    compileElement:function(el){
        var childNodes=el.childNodes;
        [].slice.call(childNodes).forEach(node=>{
            var text=node.textContent;
            var reg=/\{\{(.*)\}\}/;
            if(this.isElementNode(node)){
                this.compile(node);
            }else if(this.isTextNode(node)&&reg.test(text)){
                this.compileText(node,RegExp.$1);
            }
            if(node.childNodes&&node.childNodes.length){
                this.compileElement(node);
            }
        })
    },

    compile:function(node){
        var nodeAttrs=node.attributes;
        [].slice.call(nodeAttrs).forEach(attr=>{
            var attrName=attr.name;
            if(this.isDirective(attrName)){
                var exp=attr.value;
                var dir=attrName.substring(2);
                if(this.isEventDirective(dir)){
                    compileUtil.eventHandler(node,this.$vm,exp,dir);
                }else{
                    compileUtil[dir]&&compileUtil[dir](node,this.$vm,exp);
                }
                node.removeAttribute(attrName);
            }
        })
    },

    compileText: function(node, exp) {
        compileUtil.text(node, this.$vm, exp);
    },

    isDirective: function(attr) {
        return attr.indexOf('v-') == 0;
    },

    isEventDirective: function(dir) {
        return dir.indexOf('on') === 0;
    },

    isElementNode: function(node) {
        return node.nodeType == 1;
    },

    isTextNode: function(node) {
        return node.nodeType == 3;
    }
};


var compileUtil={
    if(node,vm,exp){
        this.bind(node,vm,exp,'if');
    },
    else(node,vm,exp){
        this.bind(node,vm,exp,'else');
    },
    text:function(node,vm,exp){
        this.bind(node,vm,exp,'text');
    },
    html(node,vm,exp){
        this.bind(node,vm,exp,'html');
    },
    model(node,vm,exp){
        this.bind(node,vm,exp,'model');
        var me=this,val=this._getVMVal(vm,exp);
        node.addEventListener('input',function(e){
            var newValue=e.target.value;
            if(val===newValue){
                return
            }
            me._setVMVal(vm,exp,newValue);
            val=newValue;
        })

    },
    class(node,vm,exp){
        this.bind(node,vm,exp,'class');
    },
    bind(node,vm,exp,dir){
        var updaterFn=updater[dir+'Updater'];
        updaterFn&&updaterFn(node,this._getVMVal(vm,exp));

        new Watcher(vm,exp,function(value,oldValue){
            updaterFn&&updaterFn(node,value,oldValue);
        })
    },
    eventHandler(node,vm,exp,dir){
        var eventType=dir.split(':')[1],fn=vm.$options.methods&&vm.$options.methods[exp];
        if(eventType&&fn){
            node.addEventListener(eventType,fn.bind(vm),false);
        }
    },
    _getVMVal(vm,exp){
        var val=vm;
        exp=exp.split('.');
        exp.forEach(k=>val=val[k]);
        return val;
    },
    _setVMVal(vm,exp,value){
        var val=vm;
        exp=exp.split('.');
        exp.forEach((k,i)=>{
            if(i<exp.length-1){
                val=val[k];
            }else {
                val[k]=value;
            }
        })
    }
};

var updater={
    textUpdater(node,value){
        node.textContent=typeof value=='undefined'?'':value;
    },
    htmlUpdater(node,value){
        node.innerHTML=typeof value=='undefined'?'':value;
    },
    classUpdater(node,value,oldValue){
        var className=node.className;
        className=className.replace(oldValue,'').replace(/\s$/,'');
        var space=className&&String(value)?' ':'';
        node.className=className+space+value;
    },
    modelUpdater(node,value,oldValue){
        node.value=typeof value=='undefined'?'':value;
    },
    ifUpdater(node,value){
        node.PNode=node.parentNode;
        node.SNode=node.nextSibling;
        if(!value){
            node.parentNode.removeChild(node);
        }else{
            console.log(node.PNode,node.SNode);
            node.PNode.insertBefore(node,node.SNode);
        }
    },
    elseUpdater(node,value){

    }


}