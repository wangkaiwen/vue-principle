/**
 * Created by kevin on 2018/03/20.
 */
function Observer(data) {
    this.data=data;
    this.walk(data);
}

Observer.prototype={
    walk(data){
        Object.keys(data).forEach(key=>{
            this.convert(key,data[key]);
        })
    },
    convert(key,value){
        this.defineReactive(this.data,key,value);
    },
    defineReactive(data,key,val){
        var dep=new Dep();
        var childObj=observer(val);
        Object.defineProperty(data,key,{
            enumerable:true,
            configurable:false,
            get:function(){
                Dep.target&&dep.depend();
                return val;
            },
            set:function(newVal){
                if(val===newVal){
                    return;
                }
                console.log('监听到值变化了'+val);
                val=newVal;
                childObj=observer(newVal);
                dep.notify();//通知所有订阅者
            }
        })
    }
};


function observer(value,vm){
    if(!value||typeof value!=='object'){return}
    return new Observer(value)
}

var uid=0;

//订阅器
function Dep(){
    this.id=uid++;
    this.subs=[];
}
Dep.prototype={
    addSub:function(sub){
        this.subs.push(sub);
    },
    depend(){
        Dep.target.addDep(this);
    },
    removeSub(sub){
        var index=this.subs.indexOf(sub);
        if(~index){
            this.subs.splice(index,1);
        }
    },
    notify:function(){
        this.subs.forEach(sub=>{sub.update()});
    }
};
Dep.target = null;