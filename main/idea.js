import Game from "./game.js";
import Interpretor from "./interpret.js";

// TO DO:
// Make sure navigate is working properly
// Impliment key-dive on threading
// Impliment position adding into thread
export default class Idea extends Map {
  constructor(identity, interpretor, ...args) {
    super(...args);
    // the identity is the shape
    if (identity === undefined) {
      this.identities = new Map();
    } else {
      this.identities = new Map().set(identity);
    }
    this.rules = new Map();
    // this.terminals = new Set();
    // rules:
    // rule => tableau (perhaps including "applicability rules", rules about if a rule is applicable)
    // rule:
    // pattern => trigger (if match then) // potentially rewrite rules
    // termination oxels can be placed to indicate contradiction

    if (interpretor === undefined) {
      this.interpretor = async () => true;
    } else if (interpretor instanceof Function) {
      this.interpretor = interpretor.bind(this);
    } else if (interpretor instanceof Interpretor) {
      this.interpretor = interpretor;
    } else if (interpretor instanceof Game) {
      this.interpretor = interpretor;
    }
    this.positions = new Set();
    //this.navIdeas = new Set();
    //this.expressions = new Map();
    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (typeof target[prop] === "function") {
          // If it's a method from the Map prototype
          if (!target.validate(target, prop)) {
            console.log(`Access to ${prop} is not allowed`);
          }

          return function (...args) {
            // Bind this to the original oxel and call the method
            return target[prop].apply(target, args);
          };
        }

        if (!target.validate(target, prop)) {
          console.log(`Access to ${prop} is not allowed`);
        }

        return Reflect.get(target, prop, receiver);
      },
      set: (target, prop, value, receiver) => {
        if (!target.validate(target, prop, value)) {
          console.log(`Modification of ${prop} is not allowed`);
        }
        return Reflect.set(target, prop, value, receiver);
      },
      has: (target, prop) => {
        if (!target.validate(target, prop)) {
          console.log(`Access to ${prop} is not allowed`);
        }
        return Reflect.has(target, prop);
      },
      deleteProperty: (target, prop) => {
        if (!target.validate(target, prop)) {
          console.log(`Modification of ${prop} is not allowed`);
        }
        return Reflect.deleteProperty(target, prop);
      },
      defineProperty: (target, prop, descriptor) => {
        if (!target.validate(target, prop)) {
          console.log(`Modification of ${prop} is not allowed`);
        }
        return Reflect.defineProperty(target, prop, descriptor);
      },
      ownKeys: (target) => {
        if (!target.validate(target, "ownKeys")) {
          console.log("Access to ownKeys is not allowed");
        }
        return Reflect.ownKeys(target);
      },
      getOwnPropertyDescriptor: (target, prop) => {
        if (!target.validate(target, prop)) {
          console.log(`Access to ${prop} is not allowed`);
        }
        return Reflect.getOwnPropertyDescriptor(target, prop);
      },
      getPrototypeOf: (target) => {
        if (!target.validate(target, "getPrototypeOf")) {
          console.log("Access to prototype is not allowed");
        }
        return Reflect.getPrototypeOf(target);
      },
      setPrototypeOf: (target, proto) => {
        if (!target.validate(target, "setPrototypeOf")) {
          console.log("Setting prototype is not allowed");
        }
        return Reflect.setPrototypeOf(target, proto);
      },
      isExtensible: (target) => {
        if (!target.validate(target, "isExtensible")) {
          console.log("Checking extensibility is not allowed");
        }
        return Reflect.isExtensible(target);
      },
      preventExtensions: (target) => {
        if (!target.validate(target, "preventExtensions")) {
          console.log("Preventing extensions is not allowed");
        }
        return Reflect.preventExtensions(target);
      },
      // Note: apply and construct traps are for function objects, and may not be applicable to the Card class, although they may be applicable to narrative generator.
      apply: (target, thisArg, args) => {
        if (!target.validate(target, "apply", args)) {
          console.log("Applying is not allowed");
        }
        return Reflect.apply(target, thisArg, args);
      },
      construct: (target, args) => {
        if (!target.validate(target, "construct", args)) {
          console.log("Construction is not allowed");
        }
        return Reflect.construct(target, args);
      },
    });
  }

  //We should handle key-dives as well as backtracking navigation operations
  async thread(...paths) {
    if (!(await this.validate(this, "thread", paths))) {
      console.log(`Call to thread is not allowed`);
    }
    let oxel = this;
    const story = []; //so that backtracking during threading is possible

    for await (const path of paths) {
      if (oxel instanceof Map) {
        if (oxel instanceof Map && !oxel.has(path)) {
          oxel.set(path, new Idea());
        }
        oxel = oxel.get(path);
        story.push(path);
      } else {
        console.log("map is not instanceof Map or Idea");
        // break
      }

      // we must do position clean up like we do during navigation
    }
    return story;
  }

  async weave(...threads) {
    if (!(await this.validate(this, "weave", threads))) {
      console.log(`Call to weave is not allowed`);
    }
    const stories = [];
    for (const thread of threads) {
      stories.push(await this.thread(...thread));
    }
    return stories;
  }

  async hasThread(...paths) {
    let oxel = this;
    // we should then also add key-dive functionality here
    for await (const path of paths) {
      if (oxel instanceof Map) {
        if (!oxel.has(path)) {
          return false;
        }
        oxel = oxel.get(path);
      } else {
        console.log("map is not instanceof Map or Idea");
      }
    }
    return true;
  }

  async hasWeave(...threads) {
    for await (const thread of threads) {
      if (!(await this.hasThread(...thread))) {
        return false;
      }
    }
    return true;
  }

  async hasAnyThreads(...threads) {
    for await (const thread of threads) {
      if (await this.hasThread(...thread)) {
        return true;
      }
    }
    return false;
  }

  async hasAnyWeaves(...weaves) {
    for await (const weave of weaves) {
      if (await this.hasWeave(...weave)) {
        return true;
      }
    }
    return false;
  }

  // hasAnyWeaveMatches(anotherOxel)

  // This accepts an array of paths
  async *navigate(pathsOrGenerator) {
    if (!(await this.validate(this, "navigate", pathsOrGenerator))) {
      console.log(`Call to navigate is not allowed`);
    }
    let currentIdea = this;
    let previousIdea = null;
    let path = null;

    const pathsIterator =
      Symbol.iterator in pathsOrGenerator
        ? pathsOrGenerator[Symbol.iterator]()
        : pathsOrGenerator;

    for await (path of pathsIterator) {
      if (path === "metaphor-dive") {
        const peek = pathsIterator.next();
        if (!peek.done && currentIdea.has(peek.value)) {
          previousIdea = currentIdea;
          currentIdea = peek.value;
          path = "metaphor-dive";
        }
      } else if (currentIdea.has(path)) {
        previousIdea = currentIdea;
        currentIdea = currentIdea.get(path);
      } else {
        console.log(`Failed at previousIdea: ${previousIdea} path: ${path}`);
      }
      if (previousIdea instanceof Idea && currentIdea instanceof Idea) {
        let positions = currentIdea.positions;
        if (!positions) {
          positions = new Set();
          currentIdea.positions = positions;
        }
        positions.add(
          Object.freeze({ previousIdea: previousIdea, pathTaken: path })
        );

        // Cleaning up the positions set
        for (let pos of positions) {
          if (pos.previousIdea.get(pos.pathTaken) !== currentIdea) {
            positions.delete(pos);
          }
        }
      }
    }
    yield {
      previousIdea: previousIdea,
      pathTaken: path,
      currentIdea: currentIdea,
    };
  }

  async shift(sourceThread, destinationThread, keys) {
    if (
      !(await this.validate(this, "shift", [
        sourceThread,
        destinationThread,
        keys,
      ]))
    ) {
      console.log(`Call to shift is not allowed`);
    }

    // Navigate to the source thread and save the entries to be shifted
    const sourceNavigationResult = await this.navigate(sourceThread);
    if (sourceNavigationResult.currentIdea) {
      const entriesToShift = keys.map((key) => [
        key,
        sourceNavigationResult.currentIdea.get(key),
      ]);

      // Navigate to the destination thread
      const destinationNavigationResult = await this.navigate(
        destinationThread
      );
      if (destinationNavigationResult.currentIdea) {
        // Insert the entries to be shifted into the destination oxel
        for (let [key, value] of entriesToShift) {
          destinationNavigationResult.currentIdea.set(key, value);
        }

        // Delete the shifted entries from the source oxel
        for (let key of keys) {
          sourceNavigationResult.currentIdea.delete(key);
        }
      }
    }
  }

  async swap(thread, key, value) {
    if (!(await this.validate(this, "swap", [thread, key, value]))) {
      console.log(`Call to swap is not allowed`);
    }

    const navigationResult = await this.navigate(thread);

    if (
      navigationResult.previousIdea &&
      navigationResult.previousIdea.has(navigationResult.pathTaken)
    ) {
      // Save the original value before overwriting
      const originalValue = navigationResult.previousIdea.get(
        navigationResult.pathTaken
      );

      // Overwrite the original entry with the new key-value pair
      navigationResult.previousIdea.delete(navigationResult.pathTaken);
      navigationResult.previousIdea.set(key, value);

      // Return the original entry
      return {
        key: navigationResult.pathTaken,
        value: originalValue,
      };
    }

    // If the navigation failed, return null
    return null;
  }

  // arrays along the combinatoric axes
  async weavingCombinator(combinatoricArrays) {
    const permutations = await Idea.generatePermutations(combinatoricArrays);
    const stories = [];

    for (const permutation of permutations) {
      stories.push(await this.weave(permutation));
    }

    return stories;
  }

  static async generatePermutations(combinatoricArrays, prefix = []) {
    if (combinatoricArrays.length === 0) {
      return [prefix];
    }

    const [first, ...rest] = combinatoricArrays;
    const permutations = [];

    for (const value of first) {
      const newPrefix = [...prefix, value];
      const newPermutations = await Idea.generatePermutations(rest, newPrefix);
      permutations.push(...newPermutations);
    }
    return permutations;
  }

  async snapshot(depth) {
    if (!(await this.validate(this, "snapshot", [depth]))) {
      console.log(`Call to snapshot is not allowed`);
    }

    const hardened = new WeakSet();
    const toFreeze = new Set();
    const paths = new WeakMap();

    const enqueue = (val, path = "unknown") => {
      if (!isObject(val)) {
        // ignore primitives
        return;
      }
      const type = typeof val;
      if (type !== "object" && type !== "function") {
        // future proof: break until someone figures out what it should do
        throw TypeError(`Unexpected typeof: ${type}`);
      }
      if (hardened.has(val) || toFreeze.has(val)) {
        // Ignore if this is an exit, or we've already visited it
        return;
      }
      toFreeze.add(val);
      paths.set(val, path);
    };

    const freezeAndTraverse = (obj) => {
      // Now freeze the object to ensure reactive
      // objects such as proxies won't add properties
      // during traversal, before they get frozen.
      Object.freeze(obj);

      const path = paths.get(obj) || "unknown";
      const descs = Object.getOwnPropertyDescriptors(obj);
      const proto = Object.getPrototypeOf(obj);
      enqueue(proto, `${path}.__proto__`);

      Object.getOwnPropertyNames(descs).forEach((
        /** @type {string | symbol} */ name
      ) => {
        const pathname = `${path}.${String(name)}`;
        const desc = descs[/** @type {string} */ (name)];
        if ("value" in desc) {
          enqueue(desc.value, `${pathname}`);
        } else {
          enqueue(desc.get, `${pathname}(get)`);
          enqueue(desc.set, `${pathname}(set)`);
        }
      });
    };

    const dequeue = () => {
      toFreeze.forEach(freezeAndTraverse);
    };

    const commit = () => {
      toFreeze.forEach((value) => hardened.add(value));
    };

    const deepCopyAndFreeze = (source, depth = 0) => {
      const destination = new Card();

      if (depth < 0) {
        console.log("Depth cannot be less than zero");
      }

      const queue = [[source, destination, 0]];

      while (queue.length > 0) {
        const [src, dest, d] = queue.shift();

        if (d < depth) {
          for (const [key, value] of src.entries()) {
            if (value instanceof Card) {
              const childCopy = new Card();
              dest.set(key, childCopy);
              queue.push([value, childCopy, d + 1]);
              enqueue(childCopy, key);
            } else if (value && typeof value === "object") {
              const copiedValue = { ...value };
              dest.set(key, copiedValue); // This will be frozen later.
              enqueue(copiedValue, key);
            } else {
              dest.set(key, value);
            }
          }
        }
      }

      return destination;
    };

    const copy = deepCopyAndFreeze(this, depth);

    // Harden the object and its properties
    dequeue();
    commit();

    return copy;
  }

  async validate(target, prop, value = null) {
    if (this.interpretor instanceof Function) {
      return this.interpretor(target, prop, value);
    } else if (this.interpretor instanceof Game) {
      return await this.interpretor.send({ target, prop, value });
    }
    // in order for use to validate stuff, the game needs to validate the lastEvent
    // with a default rule being to return true to this validation call.
    // How would we use the Game class in this way?
  }

  [Symbol.asyncIterator]() {
    const entries = this.entries();
    return {
      next() {
        return new Promise((resolve) => {
          const { done, value } = entries.next();
          // We can add some asynchronous operation here
          resolve({ done, value });
        });
      },
    };
  }
}
