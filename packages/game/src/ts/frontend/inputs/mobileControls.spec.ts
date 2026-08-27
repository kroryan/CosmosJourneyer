import Action from "@brianchirls/game-input/Action";
import PressInteraction from "@brianchirls/game-input/interactions/PressInteraction";
import { describe, expect, it } from "vitest";

import { MobileControls } from "./mobileControls";

const dispatchPointerEvent = (element: Element, type: string): void => {
    const event = new PointerEvent(type, {
        bubbles: true,
        pointerId: 1,
        pointerType: "touch",
    });
    element.dispatchEvent(event);
};

describe("mobile controls", () => {
    it("emits button changes so press interactions can react", () => {
        const pauseButton = document.querySelector(".mobileControls__button--pause");
        expect(pauseButton).not.toBeNull();

        if (pauseButton === null) {
            return;
        }

        if (!("setPointerCapture" in pauseButton)) {
            Object.defineProperty(pauseButton, "setPointerCapture", { value: () => {} });
        }

        const pauseAction = new Action({ bindings: [MobileControls.buttons.pause] });
        const pauseInteraction = new PressInteraction(pauseAction);

        dispatchPointerEvent(pauseButton, "pointerdown");
        expect(pauseInteraction.state).toBe("complete");

        dispatchPointerEvent(pauseButton, "pointerup");
        expect(pauseInteraction.state).toBe("ready");
    });

    it("exposes the camera mode state on the camera button", () => {
        const cameraButton = document.querySelector(".mobileControls__button--camera");
        expect(cameraButton?.getAttribute("aria-pressed")).toBe("false");

        MobileControls.setButtonActive("camera", true);
        expect(cameraButton?.classList.contains("mobileControls__button--active")).toBe(true);
        expect(cameraButton?.getAttribute("aria-pressed")).toBe("true");

        MobileControls.setButtonActive("camera", false);
        expect(cameraButton?.classList.contains("mobileControls__button--active")).toBe(false);
        expect(cameraButton?.getAttribute("aria-pressed")).toBe("false");
    });
});
