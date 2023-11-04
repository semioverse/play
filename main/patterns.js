// lets, just indicate the wildCard as "_"
// Rule inheritance : Multiple Inheritance
// Following the rules of inheritance, any value given to a slot that is inherited by subframes will be updated (IF-ADDED) to the corresponding slots in the subframes and any new instances of a particular frame will feature that new value as the default.

// simplify operation to hasThread only, save for adding IS or NOT key. T / F
// Passing operation source from one card to another

// when A variable found in input
// if not an instanceof Card
// for each possibleValue of A
// or if !possibleValue[operation] then move
// this value to impossible

// Implimenting a Classifier (like in Frames)

// Negation
// Events -> trigger : Listeners
// Using the History for debugging
// Undo/Redo Stack: Since you already keep a history, implementing an undo/redo feature might be a natural extension.
// Time-travel Debugging: Leveraging the history, you could add a feature to go back to a previous state for debugging purposes.
// Type checking on symbols
// Should we allow for arbitrary method calls
// or should we rely only on existence or non-existence of threads
// - the latter approach would greatly simplify our code.

// Querying through spread activation (like in frames) https://en.wikipedia.org/wiki/Spreading_activation

// type-checking on patterns
// can our code handle cases with multiple variables in a row?
// We are not utilizing the matchMap effectively
// Note that a testPattern might have multiple possible bindings with rulePatterns

export default class Card extends Map {
  constructor(id, rules = new Map(), ...args) {
    super(...args);
    if (id !== undefined) {
      this.id = id;
      // for cleaner console
    }
    this.rules = rules; // Rule inheritance?
    //this.history = new Map(); // for debugging and operation request, result history
    //this._devlogging = false;
    this._variables = new Set();
    this._strict = false;

    // Initialize a WeakMap property for this instance
    // Store the real 'this' as a token inside the WeakMap
    this._privateMap = new WeakMap().set(this, true);

    this._proxy = new Proxy(this, {
      get: (root, prop, receiver) => {
        if (this._devlogging) {
          console.log("get triggered", root, prop, receiver);
        }
        if (typeof root[prop] === "function") {
          return function (...args) {
            return root[prop].apply(root, args);
          };
        }

        return Reflect.get(root, prop, receiver);
      },
      set: (root, prop, value, receiver) => {
        if (this._devlogging) {
          console.log("set triggered", root, prop, value, receiver);
        }
        const validator = root.#validate(root, prop, value);
        for (const result of validator) {
          if (result !== true) {
            console.log(`Validation failed: ${result}`);
            return false;
          }
        }
        return Reflect.set(root, prop, value, receiver);
      },

      has: (root, prop) => {
        if (this._devlogging) {
          console.log("has triggered", root, prop);
        }
        return Reflect.has(root, prop);
      },

      deleteProperty: (root, prop) => {
        if (this._devlogging) {
          console.log("deleteProperty triggered", root, prop);
        }

        const validator = root.#validate(root, prop);
        for (const result of validator) {
          if (result !== true) {
            console.log(`Validation failed: ${result}`);
            return false;
          }
        }
        return Reflect.deleteProperty(root, prop);
      },

      defineProperty: (root, prop, descriptor) => {
        if (this._devlogging) {
          console.log("defineProperty triggered", root, prop, descriptor);
        }
        // we use defineProperty in the navigate operation.
        const validator = root.#validate(root, prop);
        for (const result of validator) {
          if (result !== true) {
            console.log(`Validation failed: ${result}`);
            return false;
          }
        }
        return Reflect.defineProperty(root, prop, descriptor);
      },

      ownKeys: (root) => {
        if (this._devlogging) {
          console.log("ownKeys triggered", root);
        }
        const validator = root.#validate(root, "ownKeys");
        for (const result of validator) {
          if (result !== true) {
            console.log(`Validation failed: ${result}`);
            return [];
          }
        }
        return Reflect.ownKeys(root);
      },

      getOwnPropertyDescriptor: (root, prop) => {
        if (this._devlogging) {
          console.log("getOwnPropertyDescriptor triggered", root, prop);
        }
        const validator = root.#validate(root, prop);
        for (const result of validator) {
          if (result !== true) {
            console.log(`Validation failed: ${result}`);
            return undefined;
          }
        }
        return Reflect.getOwnPropertyDescriptor(root, prop);
      },

      getPrototypeOf: (root) => {
        if (this._devlogging) {
          console.log("getPrototypeOf triggered", root);
        }
        const validator = root.#validate(root, "getPrototypeOf");
        for (const result of validator) {
          if (result !== true) {
            console.log(`Validation failed: ${result}`);
            return null;
          }
        }
        return Reflect.getPrototypeOf(root);
      },

      setPrototypeOf: (root, proto) => {
        if (this._devlogging) {
          console.log("setPrototypeOf triggered", root, proto);
        }
        const validator = root.#validate(root, "setPrototypeOf");
        for (const result of validator) {
          if (result !== true) {
            console.log(`Validation failed: ${result}`);
            return false;
          }
        }
        return Reflect.setPrototypeOf(root, proto);
      },

      isExtensible: (root) => {
        if (this._devlogging) {
          console.log("isExtensible triggered", root);
        }
        const validator = root.#validate(root, "isExtensible");
        for (const result of validator) {
          if (result !== true) {
            console.log(`Validation failed: ${result}`);
            return false;
          }
        }
        return Reflect.isExtensible(root);
      },

      preventExtensions: (root) => {
        if (this._devlogging) {
          console.log("preventExtensions triggered", root);
        }
        const validator = root.#validate(root, "preventExtensions");
        for (const result of validator) {
          if (result !== true) {
            console.log(`Validation failed: ${result}`);
            return false;
          }
        }
        return Reflect.preventExtensions(root);
      },

      apply: (root, thisArg, args) => {
        if (this._devlogging) {
          console.log("apply triggered", root, thisArg, args);
        }
        const validator = root.#validate(root, "apply", args);
        for (const result of validator) {
          if (result !== true) {
            console.log(`Validation failed: ${result}`);
            return;
          }
        }
        return Reflect.apply(root, thisArg, args);
      },

      construct: (root, args) => {
        if (this._devlogging) {
          console.log("construct triggered", root, args);
        }
        const validator = root.#validate(root, "construct", args);
        for (const result of validator) {
          if (result !== true) {
            console.log(`Validation failed: ${result}`);
            return;
          }
        }
        return Reflect.construct(root, args);
      },
    });
    return this._proxy;
  }

  toggleStrict() {
    this._strict = !this._strict;
  }

  fresh() {
    const fresh = Symbol(this._variables.size);
    //const fresh = new Card(this._variables.size);
    // if we make these Maps -> we can do tons of stuff, including type-system
    // if they are Cards, even more
    this._variables.add(fresh);
    return fresh;
  }

  //We should handle key-dives as well as backtracking navigation operations
  async thread(...paths) {
    const validator = this.#validate(this._proxy, "thread", paths);
    for (const result of validator) {
      if (result !== true) {
        console.log(`Validation failed: ${result}`);
        return;
      }
    }
    let card = this._proxy;
    const thread = []; //so that backtracking during threading is possible
    // could serve as a history or breadcrumb trail, enabling backtracking or even time-travel functionalities within the Card graph.

    for await (const path of paths) {
      if (card instanceof Map) {
        if (card instanceof Map && !card.has(path)) {
          card.set(path, new Card());
        }
        card = card.get(path);
        thread.push(path);
      } else {
        console.log("map is not instanceof Map or Card");
        // break
      }

      // we must do position clean up like we do during navigation
    }
    return thread;
  }

  async weave(...threads) {
    const validator = this.#validate(this._proxy, "weave", threads);
    for (const result of validator) {
      if (result !== true) {
        console.log(`Validation failed: ${result}`);
        return;
      }
    }
    const weave = [];
    for await (const thread of threads) {
      weave.push(await this.thread(...thread));
    }
    return weave;
  }

  // This accepts an array of paths
  async *navigate(pathsOrGenerator) {
    const validator = this.#validate(this._proxy, "navigate", pathsOrGenerator);
    for await (const result of validator) {
      if (result !== true) {
        console.log(`Validation failed: ${result}`);
        return;
      }
    }
    let currentCard = this._proxy;
    let previousCard = null;
    let path = null;

    const pathsIterator =
      Symbol.iterator in pathsOrGenerator
        ? pathsOrGenerator[Symbol.iterator]()
        : pathsOrGenerator;

    for await (path of pathsIterator) {
      if (path === "key-dive") {
        const peek = pathsIterator.next();
        if (!peek.done && currentCard.has(peek.value)) {
          previousCard = currentCard;
          currentCard = peek.value;
          path = "key-dive";
        }
      } else if (currentCard.has(path)) {
        previousCard = currentCard;
        currentCard = currentCard.get(path);
      } else {
        console.log(`Failed at previousCard: ${previousCard} path: ${path}`);
      }
      // Consider extending this logic for Maps in general
      if (previousCard instanceof Map && currentCard instanceof Map) {
        let positions = currentCard.positions;
        if (!positions) {
          positions = new Set(); // Consider weakset
          currentCard.positions = positions;
          // intercepted by the Set Trap
        }
        positions.add(
          Object.freeze({ previousCard: previousCard, pathTaken: path })
        );

        // Cleaning up the positions set
        for (let pos of positions) {
          if (pos.previousCard.get(pos.pathTaken) !== currentCard) {
            positions.delete(pos);
          }
        }
      }
    }
    yield {
      previousCard: previousCard,
      pathTaken: path,
      currentCard: currentCard,
    };
  }

  async shift(sourceThread, destinationThread, keys) {
    const validator = this.#validate(this._proxy, "shift", [
      sourceThread,
      destinationThread,
      keys,
    ]);
    for await (const result of validator) {
      if (result !== true) {
        console.log(`Validation failed: ${result}`);
        return;
      }
    }

    // Navigate to the source thread and save the entries to be shifted
    const sourceNavigationResult = await this.navigate(sourceThread);
    if (sourceNavigationResult.currentCard) {
      const entriesToShift = keys.map((key) => [
        key,
        sourceNavigationResult.currentCard.get(key),
      ]);

      // Navigate to the destination thread
      const destinationNavigationResult = await this.navigate(
        destinationThread
      );
      if (destinationNavigationResult.currentCard) {
        // Insert the entries to be shifted into the destination card
        for (let [key, value] of entriesToShift) {
          destinationNavigationResult.currentCard.set(key, value);
        }

        // Delete the shifted entries from the source card
        for (let key of keys) {
          sourceNavigationResult.currentCard.delete(key);
        }
      }
    }
  }

  newRule(rulePattern = Map, guards = new Map()) {
    //guards.set("possible paths", new Set());
    //guards.set("impossible paths", new Set());
    const validator = this.#validate(this._proxy, "newRule", [
      rulePattern,
      guards,
    ]);
    for (const result of validator) {
      if (result !== true) {
        console.log(`Validation failed: ${result}`);
        return;
      }
    }
    const rules = this.rules;

    // Add the new rule
    rules.set(rulePattern, guards);
  }

  hasThread(bindings, ...paths) {
    let card = this._proxy;

    // Initialize 'bindings.impossible' and 'bindings.possible' if they don't exist
    if (!(bindings.impossible instanceof Map)) {
      bindings.impossible = new Map();
    }
    if (!(bindings.possible instanceof Map)) {
      bindings.possible = new Map();
    }

    for (const [idx, path] of paths.entries()) {
      if (card instanceof Map) {
        // Check if 'path' is already in impossibleBindings
        if (bindings.impossible.has(path)) {
          const impossiblePaths = bindings.impossible.get(path);
          if (impossiblePaths.has(path)) {
            return false; // Immediately return false if path is impossible
          }
        }

        // If 'path' is a variable, expand the search space.
        if (this._variables.has(path)) {
          const possiblePaths = Array.from(card.keys());
          let foundPossible = false;

          for (const possiblePath of possiblePaths) {
            let nextIdx = idx + 1;
            if (nextIdx >= paths.length) {
              break;
            }
            let nextRealPath = paths[nextIdx];
            let possibleNextCard = card.get(possiblePath);
            if (possibleNextCard && possibleNextCard.has(nextRealPath)) {
              foundPossible = true;

              // Add to possible bindings
              if (!bindings.possible.has(path)) {
                bindings.possible.set(path, new Set());
              }
              bindings.possible.get(path).add(possiblePath);
            } else {
              // Add to impossible bindings
              if (!bindings.impossible.has(path)) {
                bindings.impossible.set(path, new Set());
              }
              bindings.impossible.get(path).add(possiblePath);
            }
          }

          // If no possible paths are found, return false
          if (!foundPossible) {
            return false;
          }
        } else if (!card.has(path)) {
          return false;
        }
        card = card.get(path);
      } else {
        console.log("card is not instanceof Map or Card");
        return false;
      }
    }
    return true;
  }

  // We only do recursive deep-equality for arrays, because we assume reference-weaving
  #matchPatterns(testPattern = Map, rulePattern = Map, bindings = new Map()) {
    //console.log(testPattern, rulePattern);
    for (let [key, ruleValue] of rulePattern.entries()) {
      const testValue = testPattern.get(key);

      if (this._variables.has(ruleValue)) {
        // ruleValue is a variable
        if (!bindings.has(ruleValue)) {
          bindings.set(ruleValue, new Set([testValue]));
          //console.log("New binding set", ruleValue, testValue);
        } else {
          bindings.get(ruleValue).add(testValue);
        }
      } else if (Array.isArray(ruleValue) && Array.isArray(testValue)) {
        // Both values are arrays; perform deep equality check
        if (ruleValue.length !== testValue.length) {
          return null; // Length mismatch
        }
        for (let i = 0; i < ruleValue.length; i++) {
          // Recursive call to handle each array element
          if (
            !this.#matchPatterns(
              new Map([["value", testValue[i]]]),
              new Map([["value", ruleValue[i]]]),
              bindings
            )
          ) {
            return null; // Array elements mismatch
          }
        }
      } else if (ruleValue !== testValue) {
        return null; // Primitive value mismatch
      }
    }
    return bindings;
  }

  #validateGuards(guards, bindings) {
    for (let [root, operations] of guards.entries()) {
      if (bindings.has(root)) {
        const rootBindingSet = bindings.get(root);
        if (rootBindingSet.size > 1) {
          console.log("Dumping rootBindingSet: ", [...rootBindingSet]);
          return `Validation failed: Multiple bindings for root variable`;
        }

        root = Array.from(rootBindingSet)[0];
      }

      for (let [operation, input] of operations.entries()) {
        if (bindings.has(operation)) {
          const operationBindingSet = bindings.get(operation);
          if (operationBindingSet.size > 1) {
            console.log("Dumping operationBindingSet: ", [
              ...operationBindingSet,
            ]);
            return `Validation failed: Multiple bindings for operation variable`;
          }
          operation = Array.from(operationBindingSet)[0];
        }

        if (bindings.has(input)) {
          const inputBindingSet = bindings.get(input);
          if (inputBindingSet.size > 1) {
            console.log("Dumping inputBindingSet: ", [...inputBindingSet]);
            return `Validation failed: Multiple bindings for input variable`;
          }
          input = Array.from(inputBindingSet)[0];
        }

        if (!Array.isArray(input)) {
          return console.log(
            "After input variable substitution, input is still not an array, perhaps you have forgotten to place Brackets [X] somewhere"
          );
        } else {
          const realInput = input.map((item) => {
            if (bindings.has(item)) {
              const itemBindingSet = bindings.get(item);
              if (itemBindingSet.size > 1) {
                console.log("Dumping itemBindingSet: ", [...itemBindingSet]);

                //return `Validation failed: Multiple bindings for item variable`;
              }
              return Array.from(itemBindingSet)[0];
            }
            return item;
          });
          if (!root instanceof Card) {
            return console.log(
              "After root variable substitution, root is still not an instanceof Card"
            );
          } else {
            if (!root[operation](bindings, ...realInput)) {
              console.log("realInput", realInput);
              return `Gaurd failed: ${operation}(${realInput.join(
                ", "
              )}) on root ${root}`;
            }
          }
        }
      }
    }
    return true;
  }

  *#validate(root, operation, input = [], operationSource = null) {
    if (!(this.rules instanceof Map)) {
      this.rules = new Map();
    }

    const testPattern = new Map();
    testPattern.set("root", root);
    testPattern.set("operation", operation);
    testPattern.set("input", input);
    testPattern.set("operationSource", operationSource);

    const rules = this.rules;

    // Define a Map to hold possible matches for the test pattern
    const matchMap = new Map();

    // Loop over all rule patterns to find possible matches
    for (let [rulePattern, guards] of rules.entries()) {
      // Check if rulePattern matches testPattern
      const bindings = this.#matchPatterns(testPattern, rulePattern);
      if (bindings) {
        matchMap.set(rulePattern, bindings);
        // Validate guards based on bindings
        const validationResult = this.#validateGuards(guards, bindings);

        if (validationResult !== true) {
          yield `Validation failed for rule ${rulePattern}: ${validationResult}`;
          return; // exit the generator
        }
      }
    }

    // strict = false : If a rule applies it can constrain you, otherwise anything goes:
    // strict = true : Only if a rule applies can you possibly perform the operation:
    if (this._strict && matchMap.size === 0) {
      yield `Validation failed: No rules matched and Strict is enabled`;
      return; // exit the generator
    }

    // If we reach here, validation has succeeded for all matching rules
    yield true;
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

const game = new Card("game");

const apple = new Card("apple");

const X = game.fresh();
const Y = game.fresh();
const Z = game.fresh();

// Sample rule and guards using variable X
const rulePattern = new Map();
rulePattern.set("root", X);
rulePattern.set("operation", "thread");
rulePattern.set("input", ["path1", Y]);

const guards = new Map();

game.newRule(rulePattern, guards);
guards.set(X, new Map([["hasThread", [X, Y]]]));

await game.thread(game, apple);

await game.thread("path1", apple);

console.log(game);
