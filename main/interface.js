import { v4 as uuid } from "uuid";
import Oxel from "./idea.js";

export class ElementMap extends Map {
  constructor() {
    super();
  }

  // Associate a new SVG element with a specific object
  newElement(svgElement, associatedObject) {
    const id = "#" + uuid();
    svgElement.attr("id", id);
    this.set(id, associatedObject);
    return id;
  }
}

export class InterfaceOxel extends Oxel {
  constructor(
    name,
    ruleEngine = async () => true,
    layers,
    styles = [],
    animations = [],
    interactions = [],
    eventHandlers = [],
    ...args
  ) {
    super(name, (ruleEngine = async () => true), ...args);
    this.set("layers", layers);
    this.set("styles", new Oxel(styles));
    this.set("animations", new Oxel(animations));
    this.set("interactions", new Oxel(interactions));
    this.set("eventHandlers", new Oxel(eventHandlers));
    this.set("expressions", new Oxel());
  }

  // Delete this oxel
  deleteOxel() {
    this.get("layers").forEach((layerElement, layerName) => {
      d3.select(layerElement.node().parentNode).remove(); // Remove the SVG group
      this.get("layers").delete(layerName); // Remove the layer entry from the map
    });
    elementmap.forEach((value, key) => {
      if (value === this) {
        elementmap.delete(key);
      }
    });
  }

  renderOxelGraph(elementMap) {
    this.forEach((value, key) => {
      // Create a group for each key-value pair
      const group = svg
        .append("g")
        .attr("transform", `translate(${this.x}, ${this.y})`);

      // Create a rectangle for the oxel
      const rect = group
        .append("rect")
        .attr("width", this.width)
        .attr("height", this.height)
        .style("fill", this.color);

      // Create text for the oxel
      const text = group
        .append("text")
        .attr("x", this.width / 2)
        .attr("y", this.height / 2)
        .attr("dy", ".35em")
        .text(`${key}: ${value}`);

      // Register the group and its children in the ElementMap
      const groupId = elementMap.newElement(group, {
        key: key,
        value: value,
      });
      elementMap.newElement(rect, { key: key, value: value });
      elementMap.newElement(text, { key: key, value: value });

      // Use groupId for element's id
      group.attr("id", groupId);
    });
  }

  addStyle(layerName, style) {
    this.get("styles").set(layerName, style);
    this.applyStyles();
  }

  addAnimation(layerName, animation) {
    this.get("animations").set(layerName, animation);
    this.applyAnimations();
  }

  // Add interaction
  addInteraction(layerName, interaction) {
    this.get("interactions").set(layerName, interaction);
  }

  // Apply interaction
  applyInteraction(layerName) {
    const interaction = this.get("interactions").get(layerName);
    if (interaction) {
      interaction(this);
    }
  }

  applyStyles() {
    this.get("layers").forEach((group, layerName) => {
      const style = this.get("styles").get(layerName);
      if (style) {
        style.applyStyle(this, group, layerName);
      }
    });
  }

  applyAnimations() {
    this.get("layers").forEach((group, layerName) => {
      const animation = this.get("animations").get(layerName);
      if (animation) {
        animation.applyAnimation(this, group, layerName);
      }
    });
  }

  // Add event handler
  addEventHandler(event, handler) {
    this.get("eventHandlers").set(event, handler);
  }

  applyInteractions() {
    const interactionMap = this.get("interactions");
    if (interactionMap) {
      for (let [layerName, interaction] of interactionMap.entries()) {
        this.applyInteraction(layerName);
      }
    }
  }

  // Apply event handlers
  applyEventHandlers() {
    const eventMap = this.get("eventHandlers");
    if (eventMap) {
      for (let [event, handler] of eventMap.entries()) {
        for (let layerElement of this.get("layers").values()) {
          layerElement.on(event, () => handler(this));
        }
      }
    }
  }
}
