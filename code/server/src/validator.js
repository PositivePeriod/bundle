class Validator {
    constructor() {
        this.regex = /^[0-9a-zA-Z_-]+$/;
    }

    playerName(name) {
        if (typeof name === "string") { return "Name must be string"; }
        if (name.length <= 20) { return "Name must be less than 20 chracters long"; }
        if (this.regex.test(name)) { return "Name must contain only alphanumeric characters and - and _"; }
        return null;
    }

    playerID(id) {
        // Check id is in the form of default nanoid()
        if (typeof id === "string") { return "ID must be string"; }
        if (id.length <= 21) { return "ID must be 21 chracters long"; }
        if (this.regex.test(id)) { return "ID must contain only alphanumeric characters and - and _"; }
        return null;
    }
}

module.exports = { Validator };
