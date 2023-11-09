export class Var extends Map {
  constructor(logic = "NAND" | "NOR", values = Array) {
    super();
    this.set(logic, values);
  }
  add(logic = "NAND" | "NOR", values = Array) {
    this.set(logic, values);
  }
  [Symbol.asyncIterator](bindings) {
    // Var accepts bindings and validates
    // iteratively resolving until we arrive at False?
    const entries = this.entries();
    return {
      next() {
        return new Promise((resolve) => {
          const { done, value } = entries.next();
          resolve({ done, value });
        });
      },
    };
  }
}

export class Pattern extends Map {
  constructor(
    root = Card,
    operation = String,
    input = Array,
    source = undefined,
    ...args
  ) {
    super(...args);
    this.set("root", root);
    this.set("operation", operation);
    this.set("input", input);
    if (source !== undefined && source instanceof Card) {
      this.set("source", source);
    }
    return this;
  }
}

export class Guards extends Map {
  constructor(root = Card, operation = String, input = Array) {
    super();
    this.set(root, new Map([[operation, input]]));
    return this;
  }
  add(root = Card, operation = String, input = Array) {
    if (!(this.get(root) instanceof Map)) {
      this.set(root, new Map([[operation, input]]));
    } else {
      const map = this.get(root);
      map.set(operation, input);
    }
  }
}

export default class Card extends Map {
  constructor(id, rules = new Map(), ...args) {
    super(...args);
    if (id !== undefined) {
      this.id = id;
    }
    this.set("recognitions", new Map());
    this.set("rules", rules);
    //this._history = new Map(); // interceptedOperation -> result
    this._variables = new Set();
    this.strict = false;
    this._private = new WeakMap().set(this, true);

    this._proxy = new Proxy(this, {
      get: (root, prop, receiver) => {
        if (typeof root[prop] === "function") {
          if (prop === "set") {
            return function (key, value) {
              console.log(
                `Intercepted set call with key: ${key} and value: ${value}`
              );

              const rootvalidator = root.validate(this._proxy, prop, [
                key,
                value,
              ]);
              for (const result of rootvalidator) {
                if (result !== true) {
                  console.log(`Validation failed: ${result}`);
                  return false;
                }
              }
              // Our set method checks and respects whether the key, or value (if they are card instances)
              // validate being associated with eachother in the context of this Card.
              if (key instanceof Card) {
                console.log("validating key for assocation:", key);
                const keyvalidator = key.validate(this._proxy, prop, [
                  key,
                  value,
                ]);
                for (const result of keyvalidator) {
                  if (result !== true) {
                    console.log(`Validation failed: ${result}`);
                    return false;
                  }
                }
              }
              if (value instanceof Card) {
                console.log("validating value for assocation:", key);
                const valuevalidator = value.validate(this._proxy, prop, [
                  key,
                  value,
                ]);
                for (const result of valuevalidator) {
                  if (result !== true) {
                    console.log(`Validation failed: ${result}`);
                    return false;
                  }
                }
              }

              // Call the original 'set' method on the Map
              return Reflect.apply(Map.prototype.set, root, [key, value]);
            };
          } else if (["delete", "clear"].includes(prop)) {
            return function (...args) {
              const rootvalidator = root.validate(this._proxy, prop, ...args);
              for (const result of rootvalidator) {
                if (result !== true) {
                  console.log(`Validation failed: ${result}`);
                  return false;
                }
              }
              return root[prop].apply(root, args);
              // Not sure whether this._proxy or root
            };
          } else if (
            [
              "call", // we add the call method here.
              "get",
              "has",
              "keys",
              "values",
              "entries",
              "forEach",
              "toString",
              "toLocaleString",
              "valueOf",
              "hasOwnProperty",
              "isPrototypeOf",
              "propertyIsEnumerable",
              "hasEntry",
              "hasThread",
              "var",
              "navigate",
            ].includes(prop)
          ) {
            return function (...args) {
              return root[prop].apply(root, args);
            };
          } else {
            return function (...args) {
              const rootvalidator = root.validate(this._proxy, prop, ...args);
              for (const result of rootvalidator) {
                if (result !== true) {
                  console.log(`Validation failed: ${result}`);
                  return false;
                }
              }
              return root[prop].apply(root, args);
            };
          }
        }
        const result = Reflect.get(root, prop, receiver);
        //this._history.set([root, prop, receiver], result);
        return result;
      },
    });
    return this._proxy;
  }

  hasEntry(key, value) {
    return this.get(key) === value ? true : false;
  }

  var() {
    const v = Symbol(this._variables.size);
    // if we use Maps/Cards instead of Symbol -> we can do interesting checks during substitution
    this._variables.add(v);
    return v;
  }

  async thread(...entries) {
    let card = this._proxy;
    const thread = [];
    for await (const [key, value] of entries) {
      if (card instanceof Map) {
        if (!card.has(key)) {
          card.set(key, value);
        }
        card = value;
        thread.push(key);
      } else if (card instanceof Map && card.get(key) !== value) {
        card.set(key, value);
        card = value;
      } else {
        console.log("map is not instanceof Map or Card");
      }
    }
  }

  async weave(...threads) {
    const weave = [];
    for await (const thread of threads) {
      weave.push(await this.thread(...thread));
    }
    return weave;
  }

  // This accepts an array of paths
  async *navigate(pathsOrGenerator) {
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
        let positions = currentCard.get("positions");
        if (!positions) {
          positions = new Set(); // Consider weakset
          currentCard.set("positions", positions);
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
    // Navigate to the source thread and save the entries to be shifted
    // we need to make a navigation generator
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

  newRule(rulePattern = Pattern, guards = new Guards()) {
    //guards.set("possible paths", new Set());
    //guards.set("impossible paths", new Set());
    const rules = this.get("rules");

    // Add the new rule
    rules.set(rulePattern, guards);
  }

  // We only do recursive deep-equality for arrays, because we assume reference-weaving
  #matchPatterns(testPattern = Map, rulePattern = Map, bindings = new Map()) {
    console.log("🚀 ~ Card ~ testPattern:", testPattern);
    console.log("🚀 ~ Card ~ rulePattern:", rulePattern);
    console.log("🚀 ~ Card ~ bindings:", bindings);

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
          if (!(root instanceof Card)) {
            return console.log(
              "After root variable substitution, root is still not an instanceof Card"
            );
          } else {
            if (typeof root[operation] !== "function") {
              console.log("operation not a method of root");
            } else if (!root[operation](...realInput)) {
              console.log("🚀 ~ Card ~ #validateGuards ~ root:", root);
              console.log(
                "🚀 ~ Card ~ #validateGuards ~ operation:",
                operation
              );
              console.log(
                "🚀 ~ Card ~ #validateGuards ~ realInput:",
                ...realInput
              );
              console.log(
                `Gaurd failed: ${operation}(${realInput.join(
                  ", "
                )}) on root ${root}`
              );
              return false; // Guard failed
            }
          }
        }
      }
    }

    return true;
  }

  *validate(root, operation, input = Array, operationSource = null) {
    const rules = this.get("rules");
    const recognitions = this.get("recognitions");

    const testPattern = new Pattern(root, operation, input, operationSource);
    let matchFound = false;
    const matchMap = new Map();
    for (let [rulePattern, guards] of rules.entries()) {
      let bindings = this.#matchPatterns(testPattern, rulePattern);
      console.log("🚀 ~ Card ~ *validate ~ bindings:", bindings);
      if (bindings) {
        matchFound = true;
        matchMap.set(rulePattern, bindings);

        const validationResult = this.#validateGuards(guards, bindings);
        testPattern.set(this._proxy, validationResult);
        recognitions.set(testPattern, validationResult);
        if (validationResult === true) {
          yield true;
          return;
        } else {
          `Validation failed for rule ${rulePattern}: ${validationResult}`;
          yield false; // Validation failed
          return; // Exit the generator on failure
        }
      }
    }

    // toggle this to strict or not.
    if (this.strict)
      if (!matchFound) {
        testPattern.set(this._proxy, undefined);
        recognitions.set(testPattern, undefined);
        yield undefined;
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
          resolve({ done, value });
        });
      },
    };
  }
}

const game = new Card("game");
const player = new Card("player");

console.log(`                                     
  ▄▄▄  ▄• ▄▌▄▄▌  ▄▄▄ ..▄▄ · 
  ▀▄ █·█▪██▌██•  ▀▄.▀·▐█ ▀. 
  ▐▀▀▄ █▌▐█▌██▪  ▐▀▀▪▄▄▀▀▀█▄
  ▐█•█▌▐█▄█▌▐█▌▐▌▐█▄▄▌▐█▄▪▐█
  .▀  ▀ ▀▀▀ .▀▀▀  ▀▀▀  ▀▀▀▀`);

const X = game.var();
const Y = game.var();

const rulePattern = new Pattern(X, "set", ["roles", Y]);

const guards = new Guards(X, "hasEntry", [X, Y]);

game.newRule(rulePattern, guards);
console.log("----------------------------");

console.log(`                                     
  • ▌ ▄ ·.        ▌ ▐·▄▄▄ ..▄▄ · 
  ·██ ▐███▪▪     ▪█·█▌▀▄.▀·▐█ ▀. 
  ▐█ ▌▐▌▐█· ▄█▀▄ ▐█▐█•▐▀▀▪▄▄▀▀▀█▄
  ██ ██▌▐█▌▐█▌.▐▌ ███ ▐█▄▄▌▐█▄▪▐█
  ▀▀  █▪▀▀▀ ▀█▄▀▪. ▀   ▀▀▀  ▀▀▀▀ `);

game.set(game, player); // When this is commented out we receive "Validation Failed" as expected

game.strict = true;
// It seems as if we are logging false even for no matches,

game.set("roles", player);
console.log("----------------------------");

console.log(`                                     
  ▄▄ •  ▄▄▄· • ▌ ▄ ·. ▄▄▄ .
  ▐█ ▀ ▪▐█ ▀█ ·██ ▐███▪▀▄.▀·
  ▄█ ▀█▄▄█▀▀█ ▐█ ▌▐▌▐█·▐▀▀▪▄
  ▐█▄▪▐█▐█ ▪▐▌██ ██▌▐█▌▐█▄▄▌
  ·▀▀▀▀  ▀  ▀ ▀▀  █▪▀▀▀ ▀▀▀  `);

game.set("hi", "HELLO");

console.log("🚀 ~ game:", game);
