
/* new Vue() --> observer() --> defineReactive() --> new Dep()
--> nodeToFragment() --> compile() --> new Watcher() --> Dep.target --> Watcher.update()*/
  // vue mvvm实现
  class Vue {
    constructor(opts) {
      this.data = opts.data;
      this.el = opts.el;
      let data = this.data;
      let me = this;
      
      observer(data,this);
      this.$mount(this.el)
      
    }

    $mount(el){
      el = query(el);
      let dom = nodeToFragment(el,this)
      el.appendChild(dom);
    }
  }
  // 将el内元素编译成fragment dom 片段
  function nodeToFragment(node,vm) {
    let frag = document.createDocumentFragment();
    let child;
    //console.log(node.firstChild)
    while(child = node.firstChild){
      compile(child,vm);
      frag.append(child);
    }
    return frag;
  }
  // 解析指令
  function compileDirectives(attrs, options){

  }

  /**
 * 节点编译
 *  指令提取与编译
 * @param  {[type]} el [description]
 * @param  {[Vue]} vm [description]
 * @return {[type]}    [description]
 */
  function complie(el,vm){
    var options = vm.data;
    var nodeLinkFn = compileNode(el, options);
    var childLinkFn = el.hasChildNodes() ? compileNodeList(el.childNodes, options) : null;

    var childNodes = toArray(el.childNodes);
    if(nodeLinkFn) nodeLinkFn(el);
    if(childLinkFn) childLinkFn(childNodes);
  } 

/**
 * 编译子节点列表
 * 返回子节点 函数链接
 * @param  {[type]} nodeList [description]
 * @param  {[type]} options  [description]
 * @return {[type]}          [description]
 *
 * 节点遍历需要考虑文本的情况
 * 0: text
 * 1: a
 * 2: text
 * 3: ul
 * 4: text
 *
 * 规则
 * nodeLinkFn
 * childLinkFn [
 *      nodeLinkFn 
 *      childLinkFn [
 *              nodeLinkFn
 *              childLinkFn [].....
 *           ]
 *      ]
 * 
 * [nodeLinkFn,childLinkFn,nodeLinkFn,childLinkFn...........]
 * 
 */

function compileNodeList(nodeList, options) {
  var linkFns = [];
  var nodeLinkFn, childLinkFn, node;
  nodeList.forEach(node=>{
    //本身节点
    //nodeType = (1 || 3) 元素 文本节点
    nodeLinkFn = compileNode(node, options);
    // 如果有子节点
    if(node.hasChildNodes()) {
      childLinkFn = compileNodeList(node.childNodes, options)
    }else{
      childLinkFn = null;
    }
    linkFns.push(nodeLinkFn, childLinkFn)
  })
  return linkFns.length ? makeChildLinkFn(linkFns) : null;
}

/**
 * 生成子节点的link函数
 * linkFns 
 *     [nodeLinkFn,childrenLinkFn,nodeLinkFn,childrenLinkFn.......]
 * linkFns的数组排列是一个父节点link一个子节点link
 * 所以在遍历的时候通过i++的来0,1 | 2,3 这样双取值
 * 
 * @param  {[type]} linkFns [description]
 * @return {[type]}         [description]
 */
function makeChildLinkFn(linkFns) {
  return function childLinkFn(nodes) {
    var node, nodeLinkFn, childLinkFn;
    for(var i=0, n=0, l = linkFns.length; i<l;n++){
      node = nodes[n];
      nodeLinkFn = linkFns[i++];
      childLinkFn = linkFns[i++];
      var childNodes = toArray(node.childNodes);
      if(nodeLinkFn) nodeLinkFn(node)
      if(childLinkFn) childLinkFn(childNodes)
    }
  }
}
function compileNode(node,options){
  var type = node.nodeType;
   //元素节点
  //排除script
  if (type === 1 && node.tagName !== 'SCRIPT') {
    return compileElement(node, options);
  } else if (type === 3 && node.data.trim()) {
      //不为空的文本节点
      return compileTextNode(node, options);
  } else {
      return null;
  }
}
  function compileElement(node,options){
    let reg = /\{\{(.*)\}\}/;
    var onRE = /^v-on:|^@/;
    var linkFn;
    if(node.nodeType == 1){ // 元素
      let hasAttrs = node.hasAttributes();
      let attrs =  hasAttrs && toArray(node.attributes);
      if(hasAttrs) {
        linkFn = compileDirectives(attrs, options)
      }
      let name = '';
      for(let i = 0,len = attrs.length; i < len; i++){
        if(attrs[i].nodeName == 'v-model'){
          name = attrs[i].nodeValue; 
          node.addEventListener('input', e => options[name] = e.target.value);
          node.value = options[name];
          node.removeAttribute('v-model');
        }
      }
      new Watcher(options,node,name,'input') //添加监听器

      if(node.hasChildNodes()){
        node.childNodes.forEach(childNode=>compile(childNode,vm))
      }
    }
    if(node.nodeType==3){ //元素或属性中的文本内容
      if(reg.test(node.nodeValue)){
        name = RegExp.$1.trim();
        console.log(name)
        nodeType = 'text';
        new Watcher(options,node,name,'text');
      }
    }
  }
  //监听器
  class Watcher{
    constructor(vm,node,name,nodeType){
      Dep.target = this; //标记全局变量 Dep.target
      this.name = name;
      this.node = node;
      this.vm = vm;
      this.nodeType = nodeType;
      this.update(); 
      Dep.target = null; // 标记全局变量 Dep.target
    }
    update(){
      this.get(); // 收集依赖，触发getter
      if(this.nodeType == 'text'){
        this.node.nodeValue = this.value;
      }
      if(this.nodeType == 'input'){
        this.node.value = this.value;
      }
    }
    get(){
      this.value = this.vm[this.name]; // new value
    }
  }

  //观察者模式（Observer, Watcher, Dep)
  /* 
    1. Observer 类主要用于给Vue的数据 defineProperty 增加 getter/setter 方法，并且在 getter/setter 中收集依赖或者通知更新
    2. Watcher 类来用于观察数据（或者表达式）变化然后执行回调函数（其中也有收集依赖的过程），主要用于 $watch API 和指令上
    3. Dep 类就是一个可观察对象, 可以有不同指令订阅它（它是多播的）
  */
  //observer
  function observer(data,vm){
    Object.keys(data).forEach(key => defineReactive(vm,data,key))
  }

  //其实就是用 Object.defineProperty 多加了一层的访问,因此我们就可以用 vm.msg 访问到 app.data.msg

  function defineReactive(vm,data,key){
    let dep = new Dep();
    Object.defineProperty(vm,key,{
      configure: true,
      enumerable: true,
      get(){
        if(Dep.target){
          // dep 成功获取到它的订阅者，放入订阅者数组
          dep.addSub(Dep.target); //相当于dep.addSub(new Watcher()) Watcher 订阅了依赖
        }
        return data[key];
      },
      set(newValue){
        if(newValue == data[key]) return;
        data[key] = newValue;
        dep.notify();//发布
      }
    })
  }

  class Dep{
    constructor(){
      this.subs = [];//订阅者数组
    }
    addSub(sub){
      this.subs.push(sub)
    }
    notify(){
      // 遍历订阅者数组，执行相应的回调操作
      this.subs.forEach(sub => sub.update())
    }
  }