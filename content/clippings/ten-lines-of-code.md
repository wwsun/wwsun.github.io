---
title: 改变我世界的十行代码
description: Roel Nieskens 回顾十行对他意义非凡的代码——从 BASIC 问候、JavaScript 怪癖、6502 自修改汇编，到 POKE 无限命、CSS 动画诗，每一行都承载着一段故事。
tags:
  - translation
  - programming
  - retro-computing
  - css
  - assembly
source: https://pixelambacht.nl/2026/ten-lines-of-code/
date: 2026-09-25
author: Roel Nieskens
---

## 改变我世界的十行代码

> **原文**：[Ten Lines Of Code That Changed My World](https://pixelambacht.nl/2026/ten-lines-of-code/) | 作者：Roel Nieskens | 日期：2026-09-25

## 摘要

作者回顾了十行（段）对他有着特殊意义的代码。它们有的出自他手，有的是他从别处抄来反复使用，还有的让他笑、让他哭。从童年敲下的 BASIC 问候程序、恶搞 Batman 的 JavaScript 怪招，到能让程序自我修改的 6502 汇编、用来作弊的 POKE 指令、Windows 上的 touch 小脚本、调试 CSS 的 hotpink 边框，再到用 280 个字符写成的 CSS 动画诗——每一行背后都是一段与计算机初次打交道的记忆，也是一个关于「编程到底能做什么」的领悟。

## 术语表

| 英文          | 中文        | 说明                                                       |
| ------------- | ----------- | ---------------------------------------------------------- |
| Hello World   | Hello World | 最经典的入门示例程序，打印一句问候语                       |
| GOTO          | GOTO        | BASIC 中的无条件跳转语句                                   |
| wat           | wat         | 源自 JavaScript 演讲梗「Wat」，形容语言中令人费解的行为    |
| 6502          | 6502        | 一款经典 8 位 CPU，广泛用于 Apple II、Commodore 等早期机器 |
| assembly      | 汇编        | 最接近机器码的低级编程语言                                 |
| little endian | 小端序      | 多字节数据低位在前、高位在后的存储方式                     |
| POKE / PEEK   | POKE / PEEK | BASIC 中直接写入 / 读取内存字节的命令                      |
| batch script  | 批处理脚本  | Windows 下的 .bat 脚本                                     |
| IRC           | IRC         | 互联网中继聊天，早期程序员常用的求助频道                   |
| CodePen       | CodePen     | 在线前端代码片段展示与调试平台                             |
| keyframes     | 关键帧      | CSS 动画中定义各阶段样式的规则                             |

---

## 正文（双语对照）

Ten lines of code that, one way or another, mean something to me. Either because I wrote them, or I extensively copied them, or they made me laugh. Or cry.

十行代码，它们以各种方式对我意义非凡。有的是我自己写的，有的是我大量抄来的，还有的让我笑出声。或者让我哭。

### Hello World

```
10 PRINT "HELLO, WORLD!"
20 GOTO 10
```

I don't know when I typed this for the first time, or if it was exactly this version. Might have been without the comma, or with more exclamation marks.

我不知道自己第一次敲下这段代码是什么时候，也不确定是不是这个版本。可能没有逗号，也可能多几个感叹号。

Nevertheless, the computer obliged, cheerfully greeting the world, and very much in particular, the wide-eyed kid who had just communicated with a computer for the first time.

但不管怎样，电脑照做了，欢快地向世界问好——尤其是向那个刚刚第一次和电脑对话、眼睛瞪得溜圆的小孩问好。

The second line drove home the point that a computer will do anything you tell it to. Hello world forever!

第二行则让人彻底明白：你让电脑做什么，它就做什么。Hello world，直到永远！

### Holy JavaScript weirdness, Batman!

```
Array(16).join('wat' - 1) + 'Batman'
```

Copy the line and paste it your browser's console for a crossover between old school pop culture TV and nerdy coding humor, with a big fat dose of "JavaScript is stupid" on top.

把这一行复制粘贴到浏览器控制台，就能看到一出老派流行文化电视梗和极客编程幽默的混搭，外加一大勺「JavaScript 真蠢」。

A classic, and a genuine LOL when I first ran it.

这是个经典，我第一次运行时实实在在笑出了声。

### 自我修改的 6502 汇编代码

```
LDX #$00      ; Load X with the value 0
.loop LDA $2000,X  ; Load A with the byte at address $2000 + X
STA $0400,X   ; Store A at address $0400 + X
INX           ; Increase X by one
BNE .loop     ; Branch back to .loop while X is not 0
INC .loop+2   ; X is 0, increase the byte at .loop + 2
INC .loop+5   ; Also increase the byte at .loop + 5
LDA .loop+5   ; Load A with the byte at address .loop + 5
CMP #$07      ; Compare it with 7
BNE .loop     ; Branch back to .loop if A is not 7
```

Machine language is as close to the metal as it gets. No warnings, no logs, no guardrails. It even allows you to modify itself, by overwriting the actual bytes of the code while it runs.

机器语言是最贴近硬件底层的存在。没有警告，没有日志，没有护栏。它甚至允许你修改自身——在代码运行的过程中覆写实际的字节。

Like in this example, where you update the high bytes of the source and destination addresses. The branch loops from $2000 to $20FF, and the subsequent INC changes the address from $2000 to $2100, before starting the loop again.

就像这个例子，你会更新源地址和目的地址的高位字节。分支循环从 $2000 遍历到 $20FF，随后的 INC 把地址从 $2000 改成 $2100，然后重新开始循环。

(The 6502 is little endian, so we do +2 and +5 instead of +1 and +4)

（6502 是小端序，所以我们用 +2 和 +5，而不是 +1 和 +4。）

As low-level as it gets, hardcore, and slightly dangerous. Realizing you could do this really drove home the point that, when coding this close to the metal, anything goes.

这已经是最底层的写法，硬核，还带着点危险。意识到自己能做到这一点，让人彻底明白：在这么贴近硬件的层次写代码，什么都行得通。

### touch.bat

```
type nul > .\"%*"
```

This tiny batch script allowed for a poor man's touch on Windows, which I used extensively from Windows NT to Windows 7. I typed touch filename.txt in the Total Commander mini-shell to quickly generate new, empty files. Couldn't live without it.

这个小巧的批处理脚本，在 Windows 上实现了穷人的 touch 命令，从 Windows NT 到 Windows 7 我一直在用。我在 Total Commander 的迷你命令行里输入 touch filename.txt，就能快速新建空文件。没有它简直没法活。

### CSS 调试器

```
border: 10px solid hotpink;
```

The console.log of the cascades! The var_dump() of the styles! The printf() of the sheets!

层叠样式表里的 console.log！样式里的 var_dump()！样式表里的 printf()！

And always hotpink.

而且永远用 hotpink（亮粉色）。

### 无限生命

```
POKE 9450,173
```

Just poke a specific byte into the right place of the binary code currently in the computer's memory, and you suddenly get infinite lives, enegry or money.

只要把一个特定的字节写入电脑内存里当前二进制代码的对应位置，你就突然拥有了无限生命、无限能量或者无限金钱。

Not only did this allow you to cheat at the game, it also brought the powerful realization that everything in any game could be manipulated, as long as you knew where to PEEK and POKE.

这不仅让你能在游戏里作弊，还带来一个强有力的认知：任何游戏里的一切都可以被操纵，只要你知道该在哪里 PEEK 和 POKE。

### 提速循环

```
for(i=0;i<1000000;i++){;}
```

"The idea is," Wayne continued, "whenever we have those really slow weeks – you know, the kind where don't actually fix any bugs or make any other changes – we just drop one of the zeros on the loop. And then we just tell the manager that we ran into some speed issues with the latest change request, but after a whole lot of deep-juju optimization, we were able to speed things up significantly and should be able to do the change request the next week."

「想法是这样的，」Wayne 接着说，「每当我们碰上特别清闲的那几周——你知道的，那种一个 bug 都没修、别的改动也没有的周——我们就把循环里的一个零去掉。然后跟经理说，最新的变更请求遇到了一些性能问题，但经过一大堆深度黑魔法优化，我们成功大幅提速，下周应该就能把那个变更请求做完了。」

A funny story, and for those of us who ever had to toil away on boring, aimless projects, an idea that might have its appeal.

一个有趣的故事；对我们这些曾经在无聊又漫无目标的项目上苦熬过的人来说，这想法或许还挺诱人。

### RTFM 或者 rm -rf /

```
# rm -rf /
```

If you ran into a problem with Linux around the 2000s, you often took to IRC in search for help. It was there that many found the magic cure to all Linux problems, which was always the same: log in as root, and run rm -rf /.

如果你在 2000 年代前后遇到 Linux 问题，常常会上 IRC 求助。正是在那里，许多人找到了能治所有 Linux 问题的神奇解药，而且答案永远一样：用 root 登录，运行 rm -rf /。

Without fail, it made every Linux problem dissappear!

无一例外，它让每个 Linux 问题都消失了！

### SKAN2.PAS

```
{$M $4000,0,0} {16 Kb stack}
{Skan v2.00 by Trexx}
Program Skan2;
uses crt,dos;
var a,b,c: char;
    b1: byte;
    str: string[3];
    Ends: boolean;
begin
  Ends := False;
  a := 'a'; {Start values}
  b := 'a';
  c := 'a';
  repeat
    inc(c);
    if (c = 'z') then
    begin
      inc(b);
      c := 'a';
    end;
    if (b = 'z') then
    begin
      inc(a);
      b := 'a';
    end;
    str := a + b + c;
    {Change this when FULL.EXE is in another directory}
    exec('z:\public\full.exe', str);
    if (whereY > 10) then readln; {Hit anykey to quit}
  until KeyPressed or Ends;
end.
```

It was the early 90s and our school finally set up a LAN, so of course my cyberpunk scriptkiddies lamers 1337 h4x0rz buddies and I explored it. We knew that all usernames consisted of three letters, and those not in use would be left at the default password.

那是 90 年代初，我们学校终于装上了局域网，于是我和我那帮赛博朋克风的 script kiddies、lamers、1337 h4x0rz 哥们儿自然要去探索一番。我们知道所有用户名都是三个字母，而且那些没在使用的账号会保持默认密码。

So we whipped up this extremely crude username scanner in Borland Pascal. More bugs than lines of code, but it sorta did the job. (And it should — it's version 2.00 after all!)

于是我们用 Borland Pascal 随手拼出这个极其粗糙的用户名扫描器。bug 比代码行还多，但勉强能干活。（而且它确实该能干活——毕竟都 2.00 版了！）

We happily hacked all the dormant accounts we could find, and then… moved on.

我们兴高采烈地黑掉了能找到的所有休眠账号，然后……就没再管了。

### CSS280

```
*{transform:translateY(24vh);text-align:center}*> :before{animation:a 9s 1e+9 linear;content:'Roses are #F00'}@keyframes a{10%,15%,35%,40%,60%,65%,85%,90%{opacity:1}12%,37%,62%,87%{opacity:0}25%{content:'Violets are #00F'}50%{content:'All my base'}75%{content:'Are belong to you'}}
```

An animated poem in nothing but 280 characters of CSS. No JavaScript, not even HTML — it would run in an empty document with just a `<style>` block, and these 280 characters of pure CSS.

一首只用 280 个字符的 CSS 写成的动画诗。没有 JavaScript，连 HTML 都没有——它能在只有一个 `<style>` 块的空文档里运行，靠的就是这 280 个纯 CSS 字符。

The artifical limit was a step up from the earlier 140 character limit, dictated by Twitter, allowing small snippets of code to be posted that you could copy over to an empty CodePen to see an amusing effect.

这个人为限制比 Twitter 早先规定的 140 字符上了一个台阶，让人们可以发布小段代码，复制到空的 CodePen 里就能看到有趣的效果。

I'm especially proud of the 1e+9 duration, which is shorter than infinite (both in time as in character count).

我尤其为 1e+9 这个时长感到自豪，它比 infinite 更短（无论是时长上，还是字符数上）。

---

> **译者注**：
>
> - 文中 `Array(16).join('wat' - 1) + 'Batman'` 利用 `'wat' - 1` 得到 `NaN`，再与 16 个空位拼接，得到 `NaNNaNNaN...Batman`，呼应经典梗图与《蝙蝠侠》主题曲「Nanana… Batman」。
> - `script kiddies`、`lamers`、`1337 h4x0rz` 均为早期黑客亚文化黑话，前者指只会套用现成工具的低水平「脚本小子」，后两者是「l33t hackers（精英黑客）」的变体写法。
> - 原文将 "enegy"、"artifical"、"dissappear" 拼错，为保留原文风貌，译文未作纠正。
