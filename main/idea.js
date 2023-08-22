import Game from "./game.js";
export default class Idea extends Map {
  constructor(identity, interpretor, ...args) {
    super(...args);
    if (identity === undefined) {
      this.identities = new Map();
    } else {
      this.identities = new Map().set(identity);
    }
    this.rules = new Map();
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
    /*
Fresh Variables vs Wildcards:
1. Both fresh variables and wildcards are used to represent < unknown | unspecified > values within relations and goals.
2. Fresh variables can be bound to specific < values | terms >, while wildcards remain unbound and accept any < value | term > in their position.
3. The use of fresh variables and wildcards enables greater flexibility and expressiveness when defining relations and goals in the logic programming system.
*/
    this.freshSymbols = new Map();
    this.wildSymbols = new Set();
    //this.navIdeas = new Set();
    //this.expressions = new Map();
    //this.terminals = new Map(); // this is for interpretation
    //this.fusable = true; // this is like whether it can be parsed using the key
  }
  fresh(value) {
    const freshSymbol = Symbol("fresh");
    this.freshSymbols.set(freshSymbol, value); // the value is like the rewrite space, it is bound to the freshSymbol
    return freshSymbol;
  }

  wild() {
    const wildSymbol = Symbol("wild");
    this.wildSymbols.add(wildSymbol);
    return wildSymbol;
  }

  freshRule(func) {
    let a = this.wild(); // Generate a fresh wildcard.
    let b = this.wild(); // Generate another fresh wildcard.
    let c = this.wild(); // Generate a third fresh wildcard.
    func(a, b, c); // Pass these fresh wildcards into the function that defines the rule.
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

  async validate(target, prop, value = null) {
    //this.interpretor = new Interpretor(target, prop, value);
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

// TO DO:
// Make sure navigate is working properly
// Impliment key-dive on threading
// Impliment position adding into thread

// Modify Game class
// We want to be able to proxy through
