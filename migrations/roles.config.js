// default roles if developer dont have roles
module.exports = [
  { name: "admin", permissions: ["can-edit", "can-ban"] },
  { name: "editor", permissions: ["can-edit"] }
];