import { gameplay } from "./gameplay.js";
import { packet } from "./network/packet.js";
import { renderer } from "./renderer.js";
import { tilemap } from "./tilemap.js";
import { panelTop } from "./ui/panel_top.js";

/**
 * @typedef Country
 * @property {number} id
 * @property {number} gold
 * @property {number} income
 * @property {number} army
 * @property {number} manpower
 */

/**
 * @typedef Province
 * @property {number} x
 * @property {number} y
 * @property {Country} country
 * @property {Country} occupiedByCountry
 * @property {Landmark} landmark
 * @property {Army} army
 */

/**
 * @typedef Landmark
 * @property {number} id
 */

/**
 * @typedef Army
 * @property {number} id
 * @property {boolean} moved
 */

export const COUNTRY = {
  NONE: -1,
  GREEN: 0,
  PURPLE: 1,
  RED: 2,
  YELLOW: 3,
};

export const LANDMARK = {
  NONE: -1,
  CAPITAL: 0,
  CHURCH: 1,
  FOREST: 2,
  HOUSE: 3,
  MOUNTAINS: 4,
  TOWER: 5
};

function Game() {
  /** @type {Country[]} */
  this.countries = [];
  /** @type {Province[]} */
  this.provinces = [];

  this.countryCount = 0;
  this.width = 0;
  this.height = 0;

  this.started = false;

  this.generate = function (countryCount, width, height) {
    const countries = [];
    const provinces = [];

    for (let i = 0; i < countryCount; ++i)
      countries.push({
        id: i,
        gold: 0,
        income: 0,
        army: 0,
        manpower: 0
      });

    for (let y = 0; y < height; ++y)
      for (let x = 0; x < width; ++x)
        provinces.push({
          x: x,
          y: y,
          country: { id: COUNTRY.NONE },
          occupiedByCountry: { id: COUNTRY.NONE },
          landmark: { id: LANDMARK.NONE },
          army: { id: COUNTRY.NONE, moved: false }
        });

    tilemap.generate(countries, provinces, countryCount, width, height);
    this.display(countries, provinces, countryCount, width, height);

    packet.syncWorld({
      countries: countries,
      provinces: provinces,
      countryCount: countryCount,
      width: width,
      height: height
    }, packet.SENDING, undefined);
  }

  this.display = function (countries, provinces, countryCount, width, height) {
    this.countries = countries;
    this.provinces = provinces;
    this.countryCount = countryCount;
    this.width = width;
    this.height = height;
    this.started = false;

    renderer.init(this.width, this.height);

    for (let y = 0; y < this.height; ++y)
      for (let x = 0; x < this.width; ++x)
        tilemap.draw(this.provinces[x + y * this.width]);
  }

  this.start = function () {
    this.started = true;
  }

  this.changeCountry = function (country) {
    if (this.started) return;

    panelTop.changeCountry(country);
    gameplay.changeCountry(country);
  }
}

export const game = new Game();