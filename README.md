# Play!

**Play!** is a new media, it's an **interfacing interface 🎛️🔁🎛️**.

**Music** 🎵 has at its disposal duration of time ⏳.

**Painting** 🎨 can present to the viewer the whole content of its message at one moment 🖼️.

**Movie** 🎥 attempted a synthesis of **music** 🎵 and **painting** 🎨  but lacked in *mutability* and *extensiveness*, *receptivity* and *interactivity*.

Indeed for what the **movie** 🎥 itself lacked in *receptivity* and *mutability* it demanded of the viewer 👀, and the injunction of this medium can be summarized as ***Watch!*** 👁️

**Interface** 🎛️ has always represented a partial inverson of the **movie-viewer** 🎥👀 relation adding *mutability, extensiveness, receptivity* and *interactivity* to the thing in view.

**Social-interface** 🌐👥 brought *sociality* to the *mutability, extensiveness, receptivity,* and *interactivity* of the **interface** 🎛️ in ways defined by the affordances of the particular **interface**.

**Interfacing interface** 🎛️🔁🎛️ brings *mutability*, *extensiveness*, *interactivity*, *receptivity* to the architecture/frame of **interface** itself through **interface** itself. The injunction of this medium is ***Play!***

Play! as an **Interfacing interface** 🎛️🔁🎛️ takes the inherent properties of **music** 🎵, **painting** 🖼️, **movie** 🎥, **interface** 🎛️, and **social-interface** 🌐👥 to create a new and evolved media format that leverages the different aspects of each media form while overcoming their individual limitations.

The keyword here is ***"Play!"*** It's not just about watching or listening passively. Instead, it's about active participation, experimentation, and discovery, much like playing a game. *With **Play!**, the interface is the playground, the medium, and the message, all at once.*

**[Play! (telegram)](https://t.me/semioverse)**[ 💬🎭](https://t.me/semioverse)

---

# Oxels!

Oxels are **Organizational Elements**. The name originates from the experimental organizations collective **[Xorg](https://xorg.how)** 🚀🧑‍🔬. While this repository only represents one branch of what Oxels can be, framing it in this way has been conducive to creative thinking 💡🎨.

In the context of this program, Oxels are a transformative data structure that revolutionizes the way we compose, weave, program, and interpret networks of associations. An Oxel is not just a node; it's a perspective, a reference-frame, a point of view within a semio-dimensional associative/relational graph. It can hold any data type, even other Oxels, enabling intricate and dynamic interconnections. Oxels are both a vessel to navigate the semioverse, as well as that which makes up its structure 🚢🧩🌐.

Whether you're crafting a game, exploring a social network, or constructing a semio-dimensional grammar, the Oxel is your key 🔑 to unlocking new depths of understanding and connection. Oxels effectively allow us to move beyond the linearity of the literary form itself! Welcome to the Semioverse, where Oxels are the language and the landscape!

## Interpretors - An Overview
At its heart, a Map in JavaScript serves as a mutable collection of key-value pairs where the key and value can be any value, including references to other Maps.

Oxels (as extensions of the javascript Map class) can be thought of as sets of directed associations (entries) between keys and values. Where keys and values tend to be references to other Oxels, this can be the case recursively and potentially cyclically. Essentially Oxels are sets of associations between references to other sets of associations.

Interpretors (as extensions of the Oxel class) are also forms/shapes/patterns of sets of directed associations between reference to other Oxels. Interpretors can then be understood as having different forms of interpretation, or different interpretation patterns.

*Generally speaking, in order to interpret, an interpreter traces a pattern, pattern-matches it against its own keys, and recursively interprets its own associated values as operations to perform such as navigation, tracing, shifting, and rewriting.*

Since Interpreters are themselves nodes/forms in reference graphs, it's possible for an interpreter to encounter other interpreters, or even to interpret itself, leading to recursive, and introspective processes.

---

# What? That sounds crazy! What do they do exactly? 🤔🧩

The Oxel class extends JavaScript's built-in Map class thus preserving the insertion order of key-value pairs, where **keys and values can be of any type including other Oxel instances**. This creates a network of iterable sets of associations/relationships that are the key-value pairs of each Oxel.

Oxels can be thought of as sets of directed associations (entries) between keys and values. Where keys and values tend to be references to other Oxels, this is the case recursively. Essentially Oxels are sets of associations between references to sets of associations.

The Oxel class includes methods such as thread, weave, navigate, and swap, each functionally representing different components of meaning and facilitating the creation, navigation, and transformation of Oxel-graphs.

**Constructor 🏗️:** It accepts three parameters `identity`, `interpreter`, and `...args`. *(These parameters simply aid development and are not recommended when compared to the advantages of reference-weaving)*

`positions` is a Set object for storing references to the positions of this Oxel in other Oxels.  `interpreter` is a mechanism to verify each action made on the Oxel object.

```javascript
const player = new Oxel("scenes")
const scenes = new Oxel("scenes");
const roles = new Oxel("roles");
const moves = new Oxel("moves");
```

**thread 🧵:** The thread method adds each input path as a key 🔑 within the current Oxel and gets the value of that key, traversing the graph to the next Oxel if it exists (creating a new Oxel otherwise) which becomes the current Oxel. This repeats till all paths have been added and traversed.

```javascript
player.thread(scenes, roles, moves)
```

![Thread](image/README/thread.png)

**weave 🕸️:** The weave method utilizes the thread method to weave several threads, much like weaving a tapestry.

![1688826697642](image/README/weave.png)

**hasThread 🧵:** This method can help to check if a particular thread exists within an Oxel, and it could be used for checking conditions in gameplay rules.

![hasThread](image/README/hasThread.png)

**shift 🔄:** The `shift` method is used to move a 🔑 key-value pair from one position in the Oxel-graph to another.

It takes two routes and an array of elements as input, navigates to the end of the first route, removes the elements located there, then navigates to the end of the second route and inserts the removed elements.

![shift](image/README/shift.png)

The `shift` method could be used to transfer roles, objects, or other oxels between different parts of the game state. For example, it could be used to move a player from one scene to another, to pass an element from one character to another, or to move something from `potentiality` to `actuality`.

**swap 🔄:** This method is used to replace a value at the given key 🔑 in a `Oxel` or `Map` structure at the end of each given route. The `swap` method will replace the key-value pair at the end of the route. The original key-value pair that was replaced is yielded back to the caller.

**navigate 🧭:** This method is for navigating through the Oxel's structure based on paths or a generator object.

```javascript
player.navigate(scenes, roles, moves)
```

It follows the paths provided, keeping track of `currentOxel` and `previousOxel` in the `positions` set, effectively allowing for bi-directional navigation.

If it encounters the reserved keyword `"metaphor-dive"`, the following key becomes a new root point for navigation, effectively changing the "axis" of navigation.

The navigate method yields an object containing `previousOxel`, `pathTaken`, and `currentOxel`.

**snapshot 📸:** This method is used to create a snapshot of the current state of the `Oxel` structure up to a specified depth. It first checks if the operation is allowed by the `interpreter`, then creates a deep copy of the current `Oxel` up to the provided depth, and lastly freezes the copied structure to prevent mutation. The snapshot method has many uses including allowing players to capture the *state-of-play* in order to undo moves or to provide *proofs of state* 🧩📸🔐.

What emerges from the methods introduced so far is a dynamic system of meaning where individual units (Oxels) are linked through paths (thread 🧵), creating a network (weave 🕸️) that can be explored (navigate 🧭) and transformed (shift/swap 🔄).

*(note that in the future we want to make all methods and properties oxels themselves that are woven, and use the oxel-based interpreter)*

# Oxels as perspectives 👁️🧩

**Interestingly the structure created by threading/weaving oxels embodies the concept of perception 👁️ (or reference-frames).** For example, imagine constructing oxels to symbolize all individuals populating your life-world, yourself included 👥🌍🧩.

You would embark on a process of threading from yourself to others:

```javascript
self.thread(relation, otherperson1, relation, otherperson2, ...etc). 
```

Yet, this thread does not record a *direct* relationship between two individuals. **Instead, the relationship is mediated, emerging from the self as the root 👁️🔀🧩.**

Within the self's graph, you can discern the relationships between yourself and others, as well as the relationships amongst others. *However, the constellation of relationships exists on a horizon of meaning extending from the self, and the same constellations (all else remaining constant) don't necessarily extend from the other.*

If you tried to explore `otherperson.keys()`, you would find that no relations have yet been formed on the otherperson's graph. **This means that every oxel can be considered a perspective/point of view of a relational graph.**

*(every oxel is a master-signifier that organizes a constellation of meaning)*

When we draw constellations in the sky, they are lines we draw from our point of view, but we are not actually saying that the stars are *in-themselves organized by these very lines, and indeed many cultures have organized the stars into totally different constellations 🌌🔀🧩...*

```javascript
constellations.weave(
[star1, star2, star3, star1],
[star6, star1, star5, star6],
[star7, star8, star9, star2])
```

![constellation](image/README/constellations.jpg)

## Metaphor 🦉

A metaphor involves using a signifier from one symbolic constellation to represent something in another constellation. Metaphors can bridge gaps between disparate concepts, making unfamiliar ideas more relatable and understandable. Using Oxel instances as keys 🔑 essentially enables the system to function on multiple levels of abstraction simultaneously.

Because the Oxel class extends the Map class allowing for keys and values to be of any type, keys 🔑 can themselves be Oxel instances. By permitting keys to be Oxel instances rather than simple identifiers (of type string/symbol), Oxels allows for metaphorical connections to be made.

Using Oxel instances as keys 🔑 - signifying metaphor - adds a degree of conceptual abstraction that makes this system incredibly powerful for bridging gaps between disparate systems or concepts.

## Metaphor-dive during Navigation

When the navigation method encounters the "metaphor-dive" token, it performs a jump from one concept to another related concept - not by a direct link, but via an intermediate implicitly metaphorical relationship.

When the navigation method encounters the "metaphor-dive" token, it traverses into the oxel that is being used as a key 🔑 in the current oxel. Rather than traversing the “metonymic axis” of language the “metaphor-dive” allows for traversals across the “metaphoric axis” of language. A metonymic thread can then consist entirely of metaphors.

This mirrors the way human cognition often works: we constantly make connections between seemingly unrelated concepts based on their shared properties or associated ideas. For example, the word 'network' has been borrowed from its original physical sense (a net-like structure 🕸️) to describe social and computer systems.

With metaphor-dive, Oxel-graphs can support more sophisticated forms of reasoning, including analogical and metaphorical thinking. It can enable a form of computational creativity, where new connections between concepts are generated dynamically based on their metaphorical relationships. By understanding all conceptual relationships as `mediated` by other concepts, the Oxel-graph can evolve and expand in a more organic and dynamic way, closely mirroring the way human knowledge grows.

# Interpretation

The interpreter starts by looking at the root of the graph. It then traverses the graph according to the "grammar" encoded in the keys ("parameters", "functionBlock", "if-else", "condition", etc.). Each key can be interpreted as instructions on what to do next: gather parameters, evaluate a condition, and so on.

In this sense, the keys 🔑 of each oxel can be oxel-graphs themselves, which can be interpreted as *schemas* or Abstract Semantic Graphs that help an interpreter understand what each of the nodes in value-graph represents by associating them with their iteratively correspondent node in the key-graph.

![interpreter](image/README/interpreter.png)

Each of these structures might have a corresponding interpretation rule-oxel in an interpreter, effectively creating a language of oxels. This enables not just data, but also operations, control flows, and functions to be represented and manipulated as oxels themselves.

While traversing through this oxel-graph, an interpreter would parse the keys 🔑 and values, interpreting them based on their role.

**Because an interpreter's rule-oxels are themselves oxel-graphs that are interpreted through this same process, we obtain a meta-circular and homoiconic interface, programming language, and data structure.**

The meta-circularity and homoiconicity allow for oxels to be incredibly expressive and dynamic. You can create new operations, alter existing ones, or change the control flow entirely, all within the structure of the oxels themselves. In other words, the oxels and their relationships are both the structure and the manipulation of the structure.

And because each Oxel forms a graph rooted at itself, oxels can represent not just objects, but entire worlds of objects, each with their own relationships and rules. This encapsulation allows for multiple "perspectives" to exist simultaneously within the same oxel structure, with each perspective being a possible interpretation of the structure.

---

# Imminant non-locality of meaning 🌀⚡⚡🗲

The Meaning of Oxels is inherently non-local since what an Oxel means is an interpretation of its "form" or "shape" - of the reference patterns (in the oxel-graph) and pattern references (in an interpretor-oxel's interpretation rule-oxels) - that give them their meaning.

Thus by changing the form we imminently alter the form/shape of all other oxels that reference it. This in turn changes the meaning of the oxel for an interpretor because the “form” is simply different. Interestingly, this doesn’t require the use of event-propogation, the change of form and meaning is simply *imminant*.

Non-locality in reference structures is comparable to a three-dimensional puzzle or an intricately woven tapestry. Each piece or thread does not have inherent meaning on its own; rather, it contributes to the collective form, pattern, and overall image. If you alter one piece of the puzzle or one thread in the tapestry, the entire image changes, albeit perhaps subtly.

In an oxel-graph (reference-graph), changing a single reference imminantly changes meaning throughout the graph. This is because the change doesn't just affect that particular reference; it recontextualizes all the Oxels that reference it. In this way, meaning is a dynamic, emergent property of the entire system rather than a static attribute of individual components.

# Meta-linguistic Assertions

"The **role** A plays in **scene** X is recognized as functionally pragmatically equivalent (scalar correlation) to the **role** B plays in **scene** Y."
*(This kind of statement can be explicit or implicit in parsing: see semio-dimensional grammars)*

---

# Contributing to this repo! 🤝🧩

**Join the [Play! (telegram)](https://t.me/semioverse) we have weekly gatherings for casting semioversal magic!** *Bring your dreams and visions and lets weave interfaces for them!* 🎭🌍🎲💬

## [🚀 Sponsor Play!](https://mainnet.slice.so/slicer/play)

Feeling generous? 🎁 Spark more fun by sponsoring Play! through the [link](https://mainnet.slice.so/slicer/play) above or light up our day by sending some `ETH` love to the slicer's address: `0xd481a2d3ca2d4fa1f061e3ba10431fb4f38d92a5`

## Merge to Earn 💰🔄🧩

This repository uses [Merge to Earn](https://mte.slice.so/) to reward contributors with a piece 🍰 of the [Play! slicer](https://mainnet.slice.so/slicer/play).

It enables a transparent, equitable reward system for collaborative and open-source development.

When merging a pull request, contributors **can receive an agreed number of slices (ERC1155 tokens) representing ownership over the earnings of the Play! slicer.**

> Curious cat? 😸 Peek into the magic with this [Demo PR](https://github.com/slice-so/merge-to-earn/pull/4)

Funds earned can be claimed anytime on [slice.so](https://slice.so) while slices can be transferred and managed from either the Slice website or directly from your ETH wallet.

You can also buy and sell your slices on [OpenSea](https://opensea.io/assets/ethereum/0x21da1b084175f95285B49b22C018889c45E1820d/37)!

**🎨🎭🎤 Not just a coding wizard 🧙‍♂️? Check out [Play Labs](https://github.com/semioverse/semioverse/tree/master/labs) for instructions on how to sprinkle your unique magic and claim your prize! 🌟🗺️🎪**

Disclaimer: *Shares of the Play! slicer do not represent shares of ownership over Play! in any form, rather they represent only shares of the tokens that pass through the slicer.*

---

*This document is a living artifact and may evolve with the growth and exploration of the community. The contents, concepts, and vision here are not set in stone but are a launchpad for continued innovation and exploration. Together, we will shape the future of Play!, Oxels, and beyond!* 🚀🧩🌌
