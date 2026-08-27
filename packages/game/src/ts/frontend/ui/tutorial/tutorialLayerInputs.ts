import Action from "@brianchirls/game-input/Action";
import PressInteraction from "@brianchirls/game-input/interactions/PressInteraction";

import { InputDevices } from "@/frontend/inputs/devices";
import { InputMap } from "@/frontend/inputs/inputMap";
import { MobileControls } from "@/frontend/inputs/mobileControls";

const keyboard = InputDevices.KEYBOARD;

const nextPanel = new PressInteraction(
    new Action({
        bindings: [keyboard.getControl("Space"), MobileControls.buttons.space],
    }),
);

const prevPanel = new PressInteraction(
    new Action({
        bindings: [keyboard.getControl("Backspace"), MobileControls.buttons.down],
    }),
);

export const TutorialControlsInputs = new InputMap("TutorialControls", {
    nextPanel,
    prevPanel,
});

TutorialControlsInputs.setEnabled(false);
