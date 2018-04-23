/**
 * Created by kevin on 2018/03/20.
 */
function MVVM(options) {
    this.$options = options || {};
    var data;
    if(typeof this.$options.data=='function'){
        data= this._data = this.$options.data();
    }else{
        data= this._data = this.$options.data;
    }

    Object.keys(data).forEach(key=> {

        this._proxyData(key);
    });
    this._initComputed();

    observer(data, this);
    this.$compile = new Compile(options.el || document.body, this);
}

MVVM.prototype = {
    $watch(key,cb,options){
        new Watcher(this,key,cb);
    },
    _proxyData(key, setter, getter){
        setter = setter || Object.defineProperty(this, key, {
                configurable: true,
                enumerable: true,
                get(){
                    return this._data[key];
                },
                set(value){
                    this._data[key] = value;
                }
            })
    },
    _initComputed(){
        var computed=this.$options.computed;
        if(typeof computed=='object'){
            Object.keys(computed).forEach(key=>{
                Object.defineProperty(this,key,{
                    get:typeof computed[key]==='function'?computed[key]:computed[key].get,
                    set(){}
                })
            })
        }
    },

}