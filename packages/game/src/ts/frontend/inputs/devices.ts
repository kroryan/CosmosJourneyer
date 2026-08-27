import Keyboard from "@brianchirls/game-input/devices/Keyboard";
import Pointer from "@brianchirls/game-input/devices/Pointer";

const keyboard = new Keyboard({
    keyCode: true,
});
const pointer = new Pointer({ touch: false });

export const InputDevices = {
    KEYBOARD: keyboard,
    POINTER: pointer,
};
