//import Idea from "./idea.js";
// mutual negation -> unity both are actually one

// we should be saving Maps AS WILDSYMBOLS

// Idea instances for all 16 logical connectives
export const ANY = new Map();
export const AND = new Map();
export const ALL = new Map();
export const NOT = new Map();
export const OR = new Map();
export const XOR = new Map();
export const IMPLY = new Map(); // if...then : material implication
export const XNOR = new Map(); // if and only if	: biconditional
export const NAND = new Map(); // not both	: alternative denial
export const NOR = new Map(); // neither...nor	: joint denial
export const NIMPLY = new Map(); //but not	: material nonimplication

// Can we understand these as being wild-card symbols? patched into a structure?

// logical reasoning on the soundness and completeness of modifications to these core circles

// meaning transformation is non-local, and is state-modification is identical to meaning transformation propogation.
// axioms for proving tautologies
export const TRUE = new Map(); //but not	: material nonimplication
export const FALSE = new Map(); //but not	: material nonimplication

TRUE.set(TRUE, TRUE);
TRUE.set(FALSE, TRUE);

FALSE.set(TRUE, FALSE);
FALSE.set(FALSE, FALSE);

// We should perhaps weave these from the NAND/NOR Gates

//  Now, weave the truth table for NOT
NOT.set([NOT, TRUE], FALSE);
NOT.set([NOT, FALSE], TRUE);

// Now, weave the truth table for AND
// Definition: (TRUE AND TRUE) => TRUE, (TRUE AND FALSE) => FALSE, (FALSE AND TRUE) => FALSE, (FALSE AND FALSE) => FALSE
AND.set([TRUE, AND, TRUE], TRUE);
AND.set([TRUE, AND, FALSE], FALSE);
AND.set([FALSE, AND, TRUE], FALSE);
AND.set([FALSE, AND, FALSE], FALSE);

// Now, weave the truth table for IMPLY
// Definition: (TRUE IMPLY TRUE) => TRUE, (TRUE IMPLY FALSE) => FALSE, (FALSE IMPLY TRUE) => TRUE, (FALSE IMPLY FALSE) => TRUE
IMPLY.set([TRUE, IMPLY, TRUE], TRUE);
IMPLY.set([TRUE, IMPLY, FALSE], FALSE);
IMPLY.set([FALSE, IMPLY, TRUE], TRUE);
IMPLY.set([FALSE, IMPLY, FALSE], TRUE);

// Weave the truth table for OR
// Definition: (TRUE OR TRUE) => TRUE, (TRUE OR FALSE) => TRUE, (FALSE OR TRUE) => TRUE, (FALSE OR FALSE) => FALSE
OR.set([TRUE, OR, TRUE], TRUE);
OR.set([TRUE, OR, FALSE], TRUE);
OR.set([FALSE, OR, TRUE], TRUE);
OR.set([FALSE, OR, FALSE], FALSE);

// Weave the truth table for XOR (exclusive OR)
// Definition: (TRUE XOR TRUE) => FALSE, (TRUE XOR FALSE) => TRUE, (FALSE XOR TRUE) => TRUE, (FALSE XOR FALSE) => FALSE
XOR.set([TRUE, XOR, TRUE], FALSE);
XOR.set([TRUE, XOR, FALSE], TRUE);
XOR.set([FALSE, XOR, TRUE], TRUE);
XOR.set([FALSE, XOR, FALSE], FALSE);

// Weave the truth table for XNOR (exclusive NOR or equivalence)
// Definition: (TRUE XNOR TRUE) => TRUE, (TRUE XNOR FALSE) => FALSE, (FALSE XNOR TRUE) => FALSE, (FALSE XNOR FALSE) => TRUE
XNOR.set([TRUE, XNOR, TRUE], TRUE);
XNOR.set([TRUE, XNOR, FALSE], FALSE);
XNOR.set([FALSE, XNOR, TRUE], FALSE);
XNOR.set([FALSE, XNOR, FALSE], TRUE);

// Weave the truth table for NAND (NOT AND)
// Definition: (TRUE NAND TRUE) => FALSE, (TRUE NAND FALSE) => TRUE, (FALSE NAND TRUE) => TRUE, (FALSE NAND FALSE) => TRUE
NAND.set([TRUE, NAND, TRUE], FALSE);
NAND.set([TRUE, NAND, FALSE], TRUE);
NAND.set([FALSE, NAND, TRUE], TRUE);
NAND.set([FALSE, NAND, FALSE], TRUE);

// Weave the truth table for NOR (NOT OR)
// Definition: (TRUE NOR TRUE) => FALSE, (TRUE NOR FALSE) => FALSE, (FALSE NOR TRUE) => FALSE, (FALSE NOR FALSE) => TRUE
NOR.set([TRUE, NOR, TRUE], FALSE);
NOR.set([TRUE, NOR, FALSE], FALSE);
NOR.set([FALSE, NOR, TRUE], FALSE);
NOR.set([FALSE, NOR, FALSE], TRUE);

// Weave the truth table for NIMPLY (NOT IMPLY or reverse implication)
// Definition: (TRUE NIMPLY TRUE) => FALSE, (TRUE NIMPLY FALSE) => TRUE, (FALSE NIMPLY TRUE) => FALSE, (FALSE NIMPLY FALSE) => FALSE
NIMPLY.set([TRUE, NIMPLY, TRUE], FALSE);
NIMPLY.set([TRUE, NIMPLY, FALSE], TRUE);
NIMPLY.set([FALSE, NIMPLY, TRUE], FALSE);
NIMPLY.set([FALSE, NIMPLY, FALSE], FALSE);

console.log(TRUE);

export const rules = new Idea();

// Weave the laws of Identity
rules.freshRule((a, b, c) => {
  rules.set([a, AND, a], a);
  rules.set([a, OR, a], a);
});

// Weave the laws of Domination
rules.freshRule((a, b, c) => {
  rules.set([a, AND, FALSE], FALSE);
  rules.set([a, OR, TRUE], TRUE);
});

// Weave the laws of Idempotent
rules.freshRule((a, b, c) => {
  rules.set([a, AND, a], a);
  rules.set([a, OR, a], a);
});

// Weave the laws of Double Negation
rules.freshRule((a, b, c) => {
  rules.set([NOT, [NOT, a]], a);
});

// Weave the laws of Commutativity
rules.freshRule((a, b, c) => {
  rules.set([a, AND, b], [b, AND, a]);
  rules.set([a, OR, b], [b, OR, a]);
});

// Weave the laws of Associativity
rules.freshRule((a, b, c) => {
  rules.set([[a, AND, b], AND, c], [a, AND, [b, AND, c]]);
  rules.set([[a, OR, b], OR, c], [a, OR, [b, OR, c]]);
});

// Weave the laws of Distributivity
rules.freshRule((a, b, c) => {
  rules.set([a, AND, [b, OR, c]], [[a, AND, b], OR, [a, AND, c]]);
  rules.set([a, OR, [b, AND, c]], [[a, OR, b], AND, [a, OR, c]]);
});

// Weave the laws of De Morgan
rules.freshRule((a, b, c) => {
  rules.set([NOT, [a, AND, b]], [[NOT, a], OR, [NOT, b]]);
  rules.set([NOT, [a, OR, b]], [[NOT, a], AND, [NOT, b]]);
});

// Weave the laws of Absorption
rules.freshRule((a, b, c) => {
  rules.set([a, AND, [a, OR, b]], a);
  rules.set([a, OR, [a, AND, b]], a);
});

// Weave the laws of Negations
rules.freshRule((a, b, c) => {
  rules.set([a, AND, [NOT, a]], FALSE);
  rules.set([a, OR, [NOT, a]], TRUE);
});

console.log(rules);
