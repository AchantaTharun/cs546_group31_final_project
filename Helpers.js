//This is General Purpose
import * as e_valid from "email-validator";
import { ObjectId } from "mongodb";

let emailc = (mail) => {
  try {
    if (!e_valid.validate(mail)) return false;
    return true;
  } catch (e) {
    return false;
  }
};

let checkId = (id) => {
  if (!id) throw "You must provide an id to search for";
  if (typeof id !== "string") throw "Id must be a string";
  if (id.trim().length === 0)
    throw "Id cannot be an empty string or just spaces";
  id = id.trim();
  if (!ObjectId.isValid(id)) throw "invalid object ID";
  return id;
};

let checkIdtf = (id) => {
  if (!id) return false;
  if (typeof id !== "string") return false;
  if (id.length === 0) return false;
  if (!ObjectId.isValid(id)) return false;
  return true;
};

let checkName = (name) => {
  if (typeof name === "string") {
    name = name.trim();
    if (name === "") throw "Name strings cannot be empty";
    let re = /^[^0-9\s]+$/gi;
    let results = name.match(re);
    if (results === null) throw "Name string invalid character used";
    if (name.length < 2 || name.length > 25) throw "Invalid name string size";
  } else {
    throw "The Name is not a string type";
  }
  return name;
};

//This is Mongoose Specific
let checkNametf = (name) => {
  if (typeof name === "string") {
    if (name === "") return false;
    let re = /^[^0-9\s]+$/gi;
    let results = name.match(re);
    if (results === null) return false;
    if (name.length < 2 || name.length > 25) return false;
  } else {
    return false;
  }
  return true;
};

let checkPassword = (password) => {
  if (typeof password === "string") {
    password = password.trim();
    if (password === "") throw "Passwords cannot be empty spaces";
    let re = /^[^\s]+$/gi;
    let results = password.match(re);
    if (results === null) throw "Space was present in the passowrd";
    re = /[0-9]/g;
    results = [];
    results = password.match(re);
    if (results === null) throw "No Digits were used";
    re = /[A-Z]/g;
    results = [];
    results = password.match(re);
    if (results === null) throw "No Uppercase alphabets were used";
    re = /^[a-z0-9]+$/gi;
    results = [];
    results = password.match(re);
    if (results !== null) throw "No special characters were used";
    if (password.length < 8) throw "Password must be atleast 8 characters long";
  } else {
    throw "The password cannot be of any other type";
  }
  return password;
};

let checkPasswordtf = (password) => {
  if (typeof password === "string") {
    if (password === "") return false;
    let re = /^[^\s]+$/gi;
    let results = password.match(re);
    if (results === null) return false;
    re = /[0-9]/g;
    results = [];
    results = password.match(re);
    if (results === null) return false;
    re = /[A-Z]/g;
    results = [];
    results = password.match(re);
    if (results === null) return false;
    re = /^[a-z0-9]+$/gi;
    results = [];
    results = password.match(re);
    if (results !== null) return false;
    if (password.length < 8) return false;
  } else {
    return false;
  }
  return true;
};

let dateCheck = (dateString) => {
  if (typeof dateString !== "string") return false;
  const parsedDate = new Date(dateString);
  return !isNaN(parsedDate) && dateString.trim().length > 0;
};

let checkString = (i) => {
  if (typeof i !== "string") throw "Input is not of the string data type";
  i = i.trim();
  if (i === "") throw "Empty Strings are not considered to be valid Input";
  return i;
};

let checkStringtf = (i) => {
  if (typeof i !== "string") return false;
  i = i.trim();
  if (i === "") return false;
  return true;
};

let isDate = (value) => {
  return value instanceof Date;
};

let isEarlierInSameDay = (date1, date2) => {
  const sameDay =
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear();
  if (sameDay) {
    return true;
  }
  return false;
};

let checkState = (state) => {
  if (typeof state !== "string")
    throw "State parameter is not of string datatype";
  state = state.trim();
  if (state === "") throw "Empty Spaced states are not allowed";
  const states = [
    "AL",
    "AK",
    "AZ",
    "AR",
    "CA",
    "CO",
    "CT",
    "DE",
    "FL",
    "GA",
    "HI",
    "ID",
    "IL",
    "IN",
    "IA",
    "KS",
    "KY",
    "LA",
    "ME",
    "MD",
    "MA",
    "MI",
    "MS",
    "MO",
    "MT",
    "NE",
    "NV",
    "NH",
    "NJ",
    "NM",
    "NY",
    "NC",
    "ND",
    "OH",
    "OK",
    "OR",
    "PA",
    "RI",
    "SC",
    "SD",
    "TN",
    "TX",
    "UT",
    "VT",
    "VA",
    "WA",
    "WV",
    "WI",
  ];
  if (state.length !== 2) throw "Only Abbreviations allowed for states";
  if (!states.includes(state.toUpperCase()))
    throw "Wrong Abbreviation used for State";
  return state.toUpperCase();
};

let checkStatetf = (state) => {
  if (typeof state !== "string") return false;
  state = state.trim();
  if (state === "") return false;
  const states = [
    "AL",
    "AK",
    "AZ",
    "AR",
    "CA",
    "CO",
    "CT",
    "DE",
    "FL",
    "GA",
    "HI",
    "ID",
    "IL",
    "IN",
    "IA",
    "KS",
    "KY",
    "LA",
    "ME",
    "MD",
    "MA",
    "MI",
    "MS",
    "MO",
    "MT",
    "NE",
    "NV",
    "NH",
    "NJ",
    "NM",
    "NY",
    "NC",
    "ND",
    "OH",
    "OK",
    "OR",
    "PA",
    "RI",
    "SC",
    "SD",
    "TN",
    "TX",
    "UT",
    "VT",
    "VA",
    "WA",
    "WV",
    "WI",
  ];
  if (state.length !== 2) return false;
  if (!states.includes(state.toUpperCase())) return false;
  return true;
};
let checkZip = (zip) => {
  if (typeof zip !== "string") throw "ZIP code can only be string";
  zip = zip.trim();
  if (zip.length != 5 || isNaN(zip)) throw "Invalid value for zip code";
  return zip;
};

export {
  checkName,
  checkNametf,
  checkPassword,
  checkPasswordtf,
  emailc,
  checkId,
  checkIdtf,
  dateCheck,
  checkString,
  checkStringtf,
  isDate,
  isEarlierInSameDay,
  checkState,
  checkZip,
};
