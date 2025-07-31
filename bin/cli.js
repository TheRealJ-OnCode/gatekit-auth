const [command, ...args] = process.argv.slice(2);
switch (command) {
  case "roles:seed":
    require("./seedRoles")(args);
    break;
  case "roles:delete":
    require("./deleteRoles")(args);
    break;
  case "roles:clear":
    require("./deleteRoles")(["--all"]);
    break;
  default:
    console.log("❓ Unknown command. Available commands:");
    console.log("   npx gatekit-auth roles:seed");
    console.log("   npx gatekit-auth roles:delete --name admin");
    console.log("   npx gatekit-auth roles:clear");
    process.exit(1);
}