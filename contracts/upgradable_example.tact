import "@stdlib/deploy";
import "./packages/utils/Upgradable";

contract UpgradableExampleV1 with Upgradable, Deployable {
    owner: Address;
    counter: Int as uint32 = 0;

    init(owner: Address) {
        self.owner = owner;
    }

    receive("Increment") {
        self.counter = self.counter + 1;
    }

    get fun counter(): Int {
        return self.counter;
    }
}

contract UpgradableExampleV2 with Upgradable {
    owner: Address;
    counter: Int as uint32 = 0;

    init(owner: Address) {
        self.owner = owner;
    }

    receive("Increment") {
        self.counter = self.counter + 1;
    }

    /* ------ Add new receiver ----- */
    receive("Double") {
        self.counter = self.counter * 2;
    }
    /* ----------------------------- */

    get fun counter(): Int {
        return self.counter;
    }
}

contract UpgradableExampleV3 with Upgradable {
    owner: Address;
    counter: Int as uint32 = 0;

    /* ------ Add new field and getter ----- */
    version: Int as uint32 = 3;

    get fun version(): Int {
        return self.version;
    }
    /* ------------------------------------ */

    init(owner: Address) {
        self.owner = owner;
    }

    receive("Increment") {
        self.counter = self.counter + 1;
    }

    receive("Double") {
        self.counter = self.counter * 2;
    }

    get fun counter(): Int {
        return self.counter;
    }
}
