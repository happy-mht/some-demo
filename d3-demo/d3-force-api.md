### d3-force API
该模块基于 `vercity Verlet` 模拟物理粒子之间的作用力。这个模拟做了简化处理：假设单位时间步长 `Δt= 1`，所有的粒子单位质量 `m = 1`。 这样的话每个粒子在 `Δt` 时间内的加速度 `α` 就等于所受的合力 `F`。可以不断修改粒子的运动速度然后调整粒子的位置。

1. 在信息可视化领域，模拟经常被用来实现 [networks](http://bl.ocks.org/mbostock/ad70335eeef6d167bc36fd3c04378048) 和 [hierarchies](http://bl.ocks.org/mbostock/95aa92e2f4e8345aaa55a4a94d41ce37)!
2. 您也可以模拟碰撞检测，例如 [bubble charts](http://www.nytimes.com/interactive/2012/09/06/us/politics/convention-word-counts.html) 或 [beeswarm plots](http://bl.ocks.org/mbostock/6526445e2b44303eebf21da3b6627320).
3. 你甚至可以用它作为一个简单的物理引擎，比如模拟一块布.
在使用这个模块时，首先为指定的一组节点创建一个仿真 <a href="#simulation" >simulation</a>并且指定力学模型类型，然后粒子之间产生力的相互作用并在每次tick的时候触发监听器事件，在监听器事件回调用更新粒子的位置。
### 安装

1. 使用npm `npm install d3-force`
2. 下载[最新的版本](https://github.com/d3/d3-force/releases/latest)
3. 直接使用[d3js.org](https://d3js.org/)官网的链接作为独立的库或D3 4.0的一部分。支持AMD，CommonJS和vanilla环境。在vanilla中，导出一个d3_force全局：
```<!DOCTYPE html>
<script src="https://d3js.org/d3-collection.v1.min.js"></script>
<script src="https://d3js.org/d3-dispatch.v1.min.js"></script>
<script src="https://d3js.org/d3-quadtree.v1.min.js"></script>
<script src="https://d3js.org/d3-timer.v1.min.js"></script>
<script src="https://d3js.org/d3-force.v1.min.js"></script>
<script>
    var simulation = d3.forceSimulation(nodes);
</script>
```

## API 参考
###  <a name="simulation">simulation</a>
<a name="forceSimulation">\# </a>d3.forceSimulation([nodes])

用指定的数组创建一个没有作用力的模拟器。如果没有指定节点，则默认为空数组。 模拟器会自动开始; 可以使用 `simulation.on` 来为仿真的每一次tick添加事件监听器。 可以使用 `simulation.stop` 停止仿真，`simulation.tick` 再次启动仿真。

<a name="restart">\# </a> `simulation.restart()`
重新启动模拟器的内部计时器并返回该模拟器。与 <a href="#alphaTarget">`simulation.alphaTarget`</a> 或 <a href="#alpha">`simulation.alpha`</a> 协同作用，这个方法可以用在在交互时重新启动仿真，比如拖拽了某个节点或使用 <a href="#stop">`simulation.stop`</a> 暂停仿真之后进行重新调整布局。

<a name="stop">\# </a> `simulation.stop()`
停止模拟器的内部定时器，如果它正在运行，并返回模拟。如果仿真已经停止，这个方法什么也不做。此方法对于手动调整模拟时非常有用; 请参阅 <a href="#tick">simulation.tick</a>。

<a name="tick">\# </a> `simulation.tick()`
通过 `(alphaTarget - alpha) × alphaDecay` 来调整仿真当前的 `alpha` 值; 然后将新的 `alpha` 值传递给当前的force（力）来调整布局; 然后使用 `velocity × velocityDecay` (速度衰减，加速度) 计算每个节点的速度; 最后通过节点当前位置和速度计算出节点的下一个位置。

 这个方法不会触发events(事件)。事件只能通过仿真creation(创建并自启动) 或者调用 `simulation.restart` 时由内部的计时器触发。`simulation.restart` 由内部计时器调度。模拟开始时刻的自然数是 `[log(alphaMin)/ log(1 - alphaDecay)]`; 默认参数情况下为300次.

这个方法可以与 `simulation.stop` 结合使用来计算静态布局。 对于大规模图来说，静态布局应该使用 [in a  web worker](https://bl.ocks.org/mbostock/01ab2e85e8727d6529d20391c0fd9a16) 计算，以避免冻结用户界面。

<a name="simulation.nodes">\# </a> `simulation.nodes([nodes])`

如果指定了节点，则将仿真节点设置为指定的对象数组，然后根据需要初始化它们的位置和速度，然后重新初始化任何约束力; 返回模拟器。 如果没有指定节点，则按照指定的方式将模拟的节点数组返回给构造函数。

每个节点必须是一个对象类型，以下几个属性是通过仿真模拟器添加的：
- index - 节点的索引（从零开始）
- x - 节点的当前的 `x-` 位置
- y - 节点的当前的 `y-` 位置
- vx - 节点的当前的 `x-` 速度
- vy - 节点的当前的 `y-` 速度

位置⟨x, y⟩和速度⟨vx, vy⟩随后可以通过力和模拟器进行修改。 如果vx或vy中其中一个是NaN，则速度会被初始化为⟨0,0⟩。 如果x或y是NaN，则该位置会根据 [phyllotaxis arrangement](https://bl.ocks.org/mbostock/11478058) 被初始化，不再是随机的。

要确定给定位置的节点，您可以指定两个附加属性：
- fx - 节点固定的x-位置
- fy - 节点固定的y-位置

在每次 `tick` 完成后，定义了 `node.fx` 的节点的`node.x` 将被重置为 `node.fx` ， `node.vx` 置为0; 同理，定义了 `node.fy` 的节点的 `node.y` 将被重置为 `node.fy`， `node.vy` 置为0。 在设置完的时候， `node.fx` 和 `node.fy` 设置为 `null` ，或者删除这2个属性。

如果节点数组中的元素发生改变，比如移除或添加一个节点。则需要重新调用这个方法。

<a name="alpha">\# </a> `simulation.alpha([alpha])`

设置或获取仿真当前的 `alpha` 值，区间为[0,1]. 默认为1。

<a name="alphaMin">\# </a> `simulation.alphaMin([min])`

设置或获取最小的 `alpha` 值，区间为[0,1], 默认为0.001. 在仿真过程中，`alpha` 值会不断减小，当 `alpha < alphaMin` 时，仿真会停止。

<a name="alphaDecay">\# </a> `simulation.alphaDecay([decay])`

设置或获取衰减系数，用来设置 `alpha` 的衰减率。默认为 `0.0228... = 1 - pow(0.001,1 / 300)`，其中 0.001 是默认的 <a href="#alphaMin">`alphaMin`</a> 值。

`alpha decay rate` 决定当前 `alpha` 到 `alphaTarget` 过渡的快慢; 衰减系数越大，仿真的过程越短，当然效果会越差。 衰减系数越小，则仿真过程越长，最终的效果也就越好。

如果想要仿真永远运行，则设置 `decay` 为 0，此时仿真的 `alpha` 保持不变。

<a name="alphaTarget">\# </a> `simulation.alphaTarget([target]`

`alpha` 的目标值，区间为[0,1]. 默认为0

<a name="velocityDecay">\# </a> `simulation.velocityDecay([decay])` 

速度衰减系数，相当于摩擦力。区间为[0,1], 默认为0.4。在每次tick之后，节点的速度都会等于当前速度乘以 `1 - decay`。 如同α 衰减一样，速度衰减越慢最终的效果越好，但是如果速度衰减过慢，可能会导致震荡。

<a name="simulation.force">\# </a> `simulation.force(name[, force])`

默认情况下，仿真是中的节点是没有力的作用的，需要通过这个方法为仿真系统设置力的作用，力有很多种，需要根据实际情况指定，比如在对图布局进行仿真时，可以设置如下几种力:
```js
var simulation = d3.forceSimulation(nodes)
    .force("charge", d3.forceManyBody()) // 节点间的作用力
    .force("link", d3.forceLink(links)) // 连线作用力
    .force("center", d3.forceCenter()); // 重力，布局有一个参考配置，不会跑偏
```
要删除给定名称的力，将力设置为 `null`。 例如，要删除 `charge` 力： 
```js
simulation.force("charge", null);
```

<a name="simulation.find">\# </a> `simulation.find(x, y[, radius])` 

返回离(x，y)最近的节点，可以指定一个搜索半径，默认为无穷大。 如果搜索区域内没有找到节点，则返回 `undefined`。

<a name="simulation.on">\# </a> `simulation.on(typenames, [listener])` 

设置或获取事件监听器。

事件监听器通过 `type.names` 的形式指定， 每个 `typename` 都是一个类型，可以选择后跟句点（.）和名称，如 `tick.foo` 和 `tick.bar`; 该名称允许多个监听器注册为相同的类型。 该类型必须是以下之一：
- tick - 每次tick时调用
- end - 当仿真结束时调用，即 `alpha < alphaMin` 

请注意，调用 `simulation.tick` 时，不会触发 `tick` 事件; 事件仅由内部计时器触发。

有关详细信息，请参阅 `dispatch.on`。

### <a name="Force">Force</a>

`Force` 只是一个修改节点位置或速度的函数; 在部分，一个力可以被定义为一个经典的物理力，如电荷或重力，或者其他的几何约束，如将节点限制在一个区域内。 比如如果想要所有的节点都朝向 ⟨0,0⟩ 运动，则可以定义如下:
```js
function force(alpha) {
  for (var i = 0, n = nodes.length, node, k = alpha * 0.1; i < n; ++i) {
    node = nodes[i];
    node.vx -= node.x * k;
    node.vy -= node.y * k;
  }
}
```
`Force` 读取节点的当前位置 `⟨x，y⟩`，然后增大或减小节点当前的速度 `⟨vx，vy⟩`。 然而，`Force` 也可能 “窥探” 到节点的下一个位置 `⟨x+ vx，y +vy⟩`;  这 [`iterative relaxation` (迭代松弛)](https://en.wikipedia.org/wiki/Relaxation_(iterative_method)) 解决几何约束所必需的。 `Force` 也可以直接修改节点位置以避免向仿真中添加能量，比如重新启动仿真时。

在这个模块中提供了以下几种力:
- <a href = "#Centering" >Centering</a>
- <a href = "#Collision" >Collision</a>
- <a href = "#Links" >Links</a>
- <a href = "#Many-Body" >Many-Body</a>
- <a href = "#Positioning" >Positioning</a>

Forces 可通过 `force.initialize` 来选择性接收仿真的节点数组。

<a name="force">\# </a> `force(alpha)`

为力指定的一个可选的 `alpha`。 作用力可以被用到通过 `force.initialize` 指定的节点上 ，但是，一些力可能应用于节点的一个子集，或者为不同的节点之间指定不同的作用力。 例如，`d3.forceLink` 可以为每个连接单独指定作用力。

<a name="initialize">\# </a> `force.initialize(nodes)`

为作用力指定节点。 当一个力通过 `simulation.force` 被绑定到仿真中，并通过 `simulation.nodes` 指定了节点时时调用。 在初始化过程中，力可能会执行必要的工作，如评估每个节点的参数，以避免在每次应用力时重复执行工作。

#### <a name="Centering">Centering</a> 

centering作用力可以使得节点布局开之后围绕某个中心。相当于某个中心点对所有的节点都有一个制约，不会让布局的中心偏离。

<a name="forceCenter">\# </a> `d3.forceCenter([x, y])` 

用指定的 x- 和 y- 坐标创建一个 Centering 力。默认为 ⟨0,0⟩。

<a name="center.x">\# </a>  `center.x([x])`

设置或获取center的 x 坐标，默认为0

<a name="center.y">\# </a> `center.y([y])`

设置或获取center的 y 坐标，默认为0

#### <a name="Collision">Collision</a> 

碰撞作用力可以为节点指定一个 radius 区域来防止节点重叠, 而不是一个位置坐标。 更正式地说，两个节点 a 和 b 之间的距离至少是 `radius(a) + radius(b)`。 为了减少抖动，可以设置的 `strength` （碰撞强度）和 `iteration count` （迭代次数）2个参数。

<a name="forceCollide">\# </a> `d3.forceCollide([radius])`

使用默认的半径创建一个碰撞作用力。radius默认所有的节点都为1

<a name="collide-radius">\# </a> `collide.radius([radius])`

为指定节点设置一个碰撞半径，这个方法可以为节点分别设置不同的半径。默认情况下为:

```js
function radius() {
  return 1;
}
```
radius访问器会为仿真中的每个节点调用一次，以单独设置节点的碰撞半径，访问器函数会传递节点 node 以及索引 index.

<a name="collide-strength">\# </a> `collide.strength([strength])`

设置碰撞力的强度，范围[0,1], 默认为0.7。 节点的重叠通过迭代松弛来解决。

<a name="collide-iterations">\# </a> `collide.iterations([iterations])`

设置或获取迭代次数，默认为1，迭代次数越多最终的布局效果越好，但是计算复杂度更高，迭代次数越低，则计算复杂度越小，最终的效果也就越差。默认为1

#### <a name="Links">Links</a>

link 作用力可以根据期望的 `link distance` (连接距离)将节点连接在一起。作用力的强度与节点之间的距离成正比，类似于弹簧作用力。

<a name="forceLink">\# </a> `d3.forceLink([links])`

为指定的link数组创建一个link作用力。如果没有指定连接关系数组则默认为空。

<a name="links">\# </a> `link.links([links])`

设置或获取link作用力的连接数组并重新计算 distance 和 strength. 如果没有指定 links 则返回当前的 links 数组，默认为空.

每个link都是包含以下两个属性的对象:

- source - 链接的源节点; 请参阅 `simulation.nodes`
- target - 链接的目标节点; 请参阅 `simulation.nodes`
- index - 在links数组中的索引

为方便起见，每个连接的源和目的可以是数字索引或者字符串标示符。参考 <a href="#link.id">`link.id`</a> 。

如果links数组发生了改变，比如添加或删除一个link时则必须重新调用这个方法

<a name="link.id">\# </a>  `link.id([id])`

设置或获取 link 中节点的查找方式，默认使用 `node.index`：
```js
function id(d) {
  return d.index;
}
```
默认的 id 访问器允许将 source 和 target 设置为基于 nodes 数组的索引形式，比如:
```js
var nodes = [
  {"id": "Alice"},
  {"id": "Bob"},
  {"id": "Carol"}
];
var links = [
{"source": 0, "target": 1}, // Alice → Bob
{"source": 1, "target": 2} // Bob → Carol
];
```
也可以使用唯一的字符串来表示，比如:
```js
function id(d) {
  return d.id;
}
```
然后可以使用每个节点的id属性的值设置为source和target值:
```js
var nodes = [
  {"id": "Alice"},
  {"id": "Bob"},
  {"id": "Carol"}
];
var links = [
{"source": "Alice", "target": "Bob"},
{"source": "Bob", "target": "Carol"}
];
```
这个方法当图使用JSON格式表示的时候是很有用的。 [看此例](https://bl.ocks.org/mbostock/f584aa36df54c451c94a9d0798caed35)

当 link 作用力初始化的时候 id 访问器都会在每个节点上调用

<a name="distance">\# </a> `link.distance([distance])`

设置或获取两个节点之间的距离，默认为:

```js
function distance() {
  return 30;
}
```
distance访问器会在每个link上调用，也就是可以为每个link设置不同的distance。

<a name="link.strength">\# </a> `link.strength([strength])`

如果指定了强度，则将强度访问器设置为指定的数字或函数，重新评估每个链接的强度访问器，并返回该强制。 如果没有指定强度，则返回当前强度存取器，默认为：
```js
function strength(link) {
  return 1 / Math.min(count(link.source), count(link.target));
}
``` 
其中 `count(node)` 是一个返回与节点链接的其他节点的数量(节点的度)。这样的默认设置是为了当一个节点度很大时减小强度，提高稳定性。

强度也可以单独设置。

<a name="iterations">\# </a> `link.iterations([iterations])` 

设置或获取迭代次数，默认为1. 迭代次数越多，最终的仿真效果越好，计算复杂度也越高。

#### <a name="Many-body">Many-Body</a>
many-body (多体)作用力应用在所用的节点之间，当strength为正的时候可以模拟重力，当为负的时候可以模拟电荷力。这个实现使用四叉树和 `Barnes-Hut approximation` 的方法提高了性能。精确度可以通过 `theta` 来控制.

与link不同，link作用力仅仅会影响有连接关系的两个节点，而电荷力是全局的，任何两个节点之间都有力的影响。

<a name="forceManyBody">\# </a> `d3.forceManyBody()`

使用默认的设置构建一个多体作用力。

<a name="manyBody.strength">\# </a> `manyBody.strength([strength])`

设置或获取强度参数，可以为负值也可以为正值，分别表示不同的力学类型，默认为:

```js
function strength() {
  return -30;
}
```
这个参数可以单独设置，也就是等于可以为不同的节点设置不同的电荷值

<a name="theta">\# </a> `manyBody.theta([theta])`

设置或获取 theta 参数。theta 参数用来设置` Barnes–Hut` 的近似标准。默认为0.9.

theta 是在实现 `Barnes-Hut approximation` 时的一个参数，每个应用需要 `O(n log n)`，其中n是节点的数量。 对于每个应用程序，四叉树存储当前节点位置; 那么对于每个节点，计算给定节点上所有其他节点的组合力。 对于远离的节点集群，可以通过将集群视为单个更大的节点来近似计算充电力。 `theta` 参数确定近似的准确性：如果四叉树的宽度 w 与从节点到细胞质心的距离 l 的比值 `w / l` 小于 `theta`，则给定细胞中的所有节点都被处理, 作为单个节点而不是单独的节点。

<a name="distanceMin">\# </a> `manyBody.distanceMin([distance])`

设置或获取最小连接距离

<a name="distanceMax">\# </a> `manyBody.distanceMax([distance])`

设置或获取最大连接距离

#### <a name="Positioning">Positioning</a>

x 和 y position作用力可以将作用力限制在一个维度，方向或y方向。

<a name="forceX">\# </a> `d3.forceX([x])`

根据给定的x位置创建一个x方向的作用力。如果没有指定x则默认为0

<a name="x.strength">\# </a> `x.strength([strength])`

设置或获取力的强度访问器，strength 决定了节点x方向的速度增量: `(x - node.x) × strength`, 这个值越大则节点的位置会越快的朝向目标位置过渡，默认为:
```js
function strength() {
  return 0.1;
}
```
这个强度可以单独设置。

<a name="x.x">\# </a> `x.x([x])`

设置或获取 x 坐标访问器。默认为:
```js
function x() {
  return 0;
}
```
可以单独设置。

<a name="forceY">\# </a> `d3.forceY([y])`

根据给定的y位置创建一个 y 方向的作用力。如果没有指定 y 则默认为 0

<a name="y.strength">\# </a>  `y.strength([strength])`

设置或获取力的强度访问器，strength决定了节点x方向的速度增量: `(y - node.y) × strength`, 这个值越大则节点的位置会越快的朝向目标位置过渡，默认为:

```js
function strength() {
  return 0.1;
}
```
这个强度可以单独设置。

<a name="y.y">\# </a> `y.y([y])`

设置或获取y坐标访问器。默认为:
```js
function y() {
  return 0;
}
```
可以单独设置。

<a name="forceRadial">\# </a> `d3.forceRadial(radius[, x][, y])`

[![alt text][1]](https://bl.ocks.org/mbostock/cd98bf52e9067e26945edd95e8cf6ef9)


创建一个新的定位力，朝向以 ⟨x，y⟩ 为中心的指定半径的圆。 如果未指定 x 和 y，则默认为 ⟨0,0⟩。

[1]: https://raw.githubusercontent.com/d3/d3-force/master/img/radial.png

<a name="radial.strength">\# </a> `radial.strength([strength])`

如果指定强度，则将强度访问器设置为指定的数字或函数，重新评估每个节点的强度访问器，并返回此力。 强度决定了增加节点的 x 和 y 的速度。 例如，值为 0.1 表示节点应该从当前位置的十分之一移动到每个应用程序的圆上最近的点。 更高的值使节点更快地移动到目标位置，通常以其他力量或约束为代价。 不建议在 [0,1] 范围之外的值。

如果没有指定强度，则返回当前强度存取器，默认为：
```js
function strength() {
  return 0.1;
}
```
对模拟中的每个节点调用强度访问器，同时传递该节点及其索引。 然后在内部存储所得到的数字，使得每个节点的强度只在力被初始化时或者当以新的力量调用该方法时才被重新计算，而不是在力的每次施加时重新计算。

<a name="radial.radius">\# </a> radial.radius([radius])

如果指定了半径，则将圆弧半径设置为指定的数字或函数，重新评估每个节点的半径访问器，并返回该力。 如果未指定半径，则返回当前的半径访问器。

在仿真中为每个节点调用 `radius` 访问器，并传递节点及其索引。 然后将得到的数字存储在内部，使得每个节点的目标半径仅在力被初始化时或在用新半径调用该方法时重新计算，而不是在每次施加力时重新计算。

<a name="radial.x">\# </a>  `radial.x([x])`

如果指定了 x，则将圆心的 x 坐标设置为指定的数字并返回此力。 如果未指定 x，则返回中心的当前 x 坐标，默认为零。

<a name="radial.y">\# </a>  `radial.y([y])`

如果指定了 y，则将圆心的 y 坐标设置为指定的数字并返回此力。 如果未指定 y，则返回中心的当前 y 坐标，默认为零。




