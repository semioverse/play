import Simulation from "./simulation.js";
import Hyperswarm from "hyperswarm";
import goodbye from "graceful-goodbye";
import crypto from "hypercore-crypto";
import b4a from "b4a";
import JSOG from "jsog";
import hash from "object-hash";

function generatePlayerId() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const idLength = 8;
  let playerId = "";

  for (let i = 0; i < idLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    const randomChar = characters.charAt(randomIndex);
    playerId += randomChar;
  }

  return playerId;
}

class Play extends Simulation {
  constructor(spaces) {
    super();
    this._conns = [];
    this._namemap = new Map();
    this._simulations = [new Simulation()];
    this._expressions = [];

    // Initialize hyperswarm instance
    this.swarm = new Hyperswarm();
    goodbye(() => this.swarm.destroy());

    // Join a common space
    this.space = spaces ? b4a.from(spaces, "hex") : crypto.randomBytes(32);
    this.discovery = this.swarm.join(this.space, {
      client: true,
      server: true,
    });

    this.swarm.on("connection", this.handleConnection.bind(this));
  }

  newSimulation() {
    this._simulations.push(new Simulation());
  }

  addSimulation(simulation) {
    if (simulation instanceof Simulation) {
      this._simulations.push(simulation);
    }
  }

  handleConnection(conn) {
    const name = b4a.toString(conn.remotePublicKey, "hex");
    this._namemap.set(name, generatePlayerId());
    console.log("* got a connection from:", this._namemap.get(name), "*");
    this._conns.push(conn);

    conn.on("error", (error) => {
      console.error(
        `Error on connection with ${this._namemap.get(name)}:`,
        error
      );
      this.removeConnection(conn);
    });

    conn.once("close", () => this.removeConnection(conn));
    conn.on("data", this.handleData.bind(this));
  }

  removeConnection(conn) {
    const index = this._conns.indexOf(conn);
    if (index > -1) {
      this._conns.splice(index, 1);
      console.log(
        "Connection removed. Remaining connections:",
        this._conns.length
      );
    }
  }

  handleData(data) {
    // Parse the received data
    console.log("data:", data);
    const expr = JSOG.parse(data.toString());
    this._expressions.push(expr);

    // Send the data to all simulations
    console.log("expr:", expr);
    this.sendToSimulations(data);
  }

  sendToSimulations(data) {
    for (let simulation of this.simulations) {
      simulation.send(data);
    }
  }
}

let play = new Play(
  "17fdd7cc6108d77c1b58e7926b910bd1b3013dd9db8ac41320dcb6f8d65b259d"
);

console.log(play);

export default Play;
