---
title: Node.js Stream
date: 2017-06-18
---

流是Node.js中一个非常重要的概念，也是Node.js之所以[适用于I/O密集型](http://www.infoq.com/cn/articles/nodejs-weakness-cpu-intensive-tasks)场景的重要原因之一。
流是Node.js移动数据的方式，流可以是可读的和／或可写的。在Node.js中很多模块都使用到了流，包括HTTP和fs模块，本文将用尽可能简单的方式为你介绍Node中流的概念。

## 流 Stream

> 事实上，流通常用于将程序连接在一起。流可以被读和写。被流连接在一起的程序通常很小，并且只专注于做一件事。

你可能经常在项目中使用Gulp来做项目的代码构建，那么在使用过程中，你很可能碰到过类似下面的错误。
错误大概是这样个的：

	stream.js:94
		throw er; // Unhandled stream error in pipe.

当初次碰到这种错误的时候，你可能和我一样对流的概念毫无头绪，好在我们可以借助Google来寻找答案。
一个最佳的开始是用Google搜索“node stream”之类的关键字，
从而我们可以获得[stream-adventure](https://github.com/substack/stream-adventure)这类的课程学习。

在Node.js的文档中，流（Stream）的官方定义如下：

> 流是一个抽象接口，在Node.js中它借助于多种对象实现。例如，一个对HTTP服务器的请求是一个流，可以是stdout。流是可读的，可写的，或两者兼备。所有的流都是`EventEmitter`的实例。

也就是说，Node.js中的很多模块都是用到了流，例如`http`和`fs`模块。例如在文件系统模块（`fs`）中，
我们可以通过流来读写文件数据的实例。由于数据是流，这就意味着在完成文件读取之前，
从收到最初几个字节开始，就可以对数据动作。这是Node.js中的一个常见模式：

## 可读流

```javascript
const fs = require('fs');
const stream = fs.ReadStream('name.txt');
stream.setEncoding('utf-8');
stream.on('data', chunk => {
	console.log('read some data');
});
stream.on('close', () => {
	console.log('all the data is read');
});
```

在上面的例子中，我们创建了一个可读流，并在流读取文件的过程中监听事件，在收到新数据时触发事件数据。
当文件读取完成后触发关闭事件。

此外，在流中，我们要负责按自己想要的方式使用数据，所以我们必须在数据事件接收到数据的时候处理它。
如果想要读区所有数据，就必须将其拼接到一个变量中：

```javascript
let data = '';

stream.on('data', chunk => {
	data += chunk;
	console.log('read some data');
});
```

如果读取的文件很大，这就会触发多个data事件，这就需要开发者可以在以接收到数据的时候就做一些事情，
而不是等到整个文件都读取完成。

## 可写流

显然，我们也可以创建可写流以便写数据。这意味着，只要一段简单的脚本，就可以使用流读入文件然后写入另一文件：

```javascript
const fs = require('fs');
let readStream = fs.ReadStream('name.txt');
let writeStream = fs.WriteStream('out.txt');
readStream.setEncoding('utf-8');
readStream.on('data', chunk => {
	writeStream.write(chunk);
});
readStream.on('close', () => {
	writeStream.end();
});
```

在上面的例子中，当接收到data事件的时候，我们便将数据写入到可写流writeStream中，这非常的高效，
因为只要从可读文件接收到数据事件，数据就会被写入文件。尤其是对大文件而言，不会被阻塞。因此，
对于网络和文件系统中移动数据而言，流的方式非常的高效。

### 通过管道连接流

本质上，流允许你讲其他对象或程序连接在一起。你将某些输入，然后让它经过流，
将它传递到另一个程序中。我比较喜欢拿水管来做类比。将一组小型的管道（程序）连接在一起，
用于完成一些特定的任务。

管道（pipe）的概念很早就存在于Unix系统中，你可以通过这篇文章了解更多：[Unix Pipelines](https://en.wikipedia.org/wiki/Pipeline_(Unix))

由于在输入和输出之间通过管道传输数据在Node.js中很常见，所以它也提供了连接两个可读和可写流并在它们之间通过管道传输数据的方法。
例如：`readStream.pipe(writeStream)`。

`pipe()`方法会仔细处理事件，在需要的时候会暂停流并恢复流操作，所以除非需要对事件的发生有完全的控制权，
否则应该使用`pipe()`。

```javascript
const fs = require('fs');

// 指定读取流，指向目标文件，编码格式为utf-8
const file = fs.createReadStream('hello.txt', {encoding: 'utf-8'});

// 流是EventEmitter的实例，我们可以为其添加事件
// 当打开文件时触发open事件
file.on('open', function () {

	// 使用管道，将文件内容输出到屏幕上
	// process对象也是一个EventEmitter实例
	this.pipe(process.stdout);
});
```

## References

1. [Introduction to streams](http://www.sitepoint.com/introduction-to-streams/)
1. [Hack Reactor's Video About Node Streams](https://www.youtube.com/watch?v=OeqnIuTMod4)
2. [Stream (Node.js)](https://nodejs.org/api/stream.html)
3. [File System (Node.js)](https://nodejs.org/api/fs.html)
4. [Node Streams Article by Max Ogden](http://maxogden.com/node-streams.html)
