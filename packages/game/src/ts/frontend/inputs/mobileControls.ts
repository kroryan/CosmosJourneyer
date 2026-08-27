import ButtonInputControl from "@brianchirls/game-input/controls/ButtonInputControl";
import type StickInputControl from "@brianchirls/game-input/controls/StickInputControl";
import { Device } from "@brianchirls/game-input/Device";
import VirtualStick from "@brianchirls/game-input/devices/VirtualStick";
import { Capacitor } from "@capacitor/core";

type MobileButtonName =
    | "pause"
    | "map"
    | "land"
    | "warp"
    | "interact"
    | "space"
    | "down"
    | "zero"
    | "boost"
    | "brake"
    | "camera"
    | "target"
    | "jump"
    | "focus"
    | "ui"
    | "orbits"
    | "view"
    | "reset"
    | "previousMission"
    | "nextMission"
    | "dance"
    | "sit";

type PositionedControlName = MobileButtonName | "configure" | "leftStick" | "rightStick" | "menu";

type ControlPosition = {
    readonly xPercent: number;
    readonly yPercent: number;
};

const layoutStorageKey = "cosmosJourneyer.mobileControls.layout.v4";

const controlNames: ReadonlyArray<PositionedControlName> = [
    "map",
    "pause",
    "configure",
    "land",
    "warp",
    "interact",
    "space",
    "down",
    "zero",
    "boost",
    "brake",
    "camera",
    "target",
    "jump",
    "focus",
    "ui",
    "orbits",
    "view",
    "reset",
    "previousMission",
    "nextMission",
    "dance",
    "sit",
    "leftStick",
    "rightStick",
    "menu",
];

const defaultLayout: Record<PositionedControlName, ControlPosition> = {
    map: { xPercent: 42, yPercent: 18 },
    pause: { xPercent: 50, yPercent: 18 },
    configure: { xPercent: 58, yPercent: 58 },
    ui: { xPercent: 42, yPercent: 38 },
    orbits: { xPercent: 50, yPercent: 38 },
    view: { xPercent: 58, yPercent: 38 },
    focus: { xPercent: 42, yPercent: 28 },
    jump: { xPercent: 50, yPercent: 28 },
    previousMission: { xPercent: 42, yPercent: 48 },
    nextMission: { xPercent: 50, yPercent: 48 },
    reset: { xPercent: 58, yPercent: 28 },
    dance: { xPercent: 42, yPercent: 58 },
    sit: { xPercent: 50, yPercent: 58 },
    land: { xPercent: 85, yPercent: 38 },
    warp: { xPercent: 85, yPercent: 25 },
    target: { xPercent: 58, yPercent: 48 },
    interact: { xPercent: 85, yPercent: 51 },
    space: { xPercent: 78, yPercent: 47 },
    down: { xPercent: 78, yPercent: 61 },
    zero: { xPercent: 85, yPercent: 67 },
    boost: { xPercent: 30, yPercent: 58 },
    brake: { xPercent: 40, yPercent: 67 },
    camera: { xPercent: 58, yPercent: 18 },
    leftStick: { xPercent: 16, yPercent: 76 },
    rightStick: { xPercent: 68, yPercent: 76 },
    menu: { xPercent: 50, yPercent: 9 },
};

const buttonLabels: Record<MobileButtonName, string> = {
    pause: "II",
    map: "MAP",
    land: "LND",
    warp: "WRP",
    interact: "ACT",
    space: "SPACE",
    down: "DN",
    zero: "0",
    boost: "BST",
    brake: "BRK",
    camera: "CAM",
    target: "TGT",
    jump: "JMP",
    focus: "FCS",
    ui: "UI",
    orbits: "ORB",
    view: "VIEW",
    reset: "RST",
    previousMission: "M-",
    nextMission: "M+",
    dance: "DNC",
    sit: "SIT",
};

export const isTouchDevice = (): boolean =>
    Capacitor.isNativePlatform() ||
    (typeof navigator !== "undefined" &&
        (/Android/i.test(navigator.userAgent) ||
            navigator.maxTouchPoints > 0 ||
            (typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches)));

const shouldShowMobileControls = (): boolean => isTouchDevice();

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

const readPosition = (value: unknown): ControlPosition | null => {
    if (!isObjectRecord(value)) {
        return null;
    }

    const xPercent = value["xPercent"];
    const yPercent = value["yPercent"];
    if (typeof xPercent !== "number" || typeof yPercent !== "number") {
        return null;
    }

    return {
        xPercent: Math.min(96, Math.max(4, xPercent)),
        yPercent: Math.min(92, Math.max(8, yPercent)),
    };
};

const loadStoredLayout = (): Partial<Record<PositionedControlName, ControlPosition>> => {
    try {
        const rawLayout = window.localStorage.getItem(layoutStorageKey);
        if (rawLayout === null) {
            return {};
        }

        const parsedLayout: unknown = JSON.parse(rawLayout);
        if (!isObjectRecord(parsedLayout)) {
            return {};
        }

        const layout: Partial<Record<PositionedControlName, ControlPosition>> = {};
        for (const name of controlNames) {
            const position = readPosition(parsedLayout[name]);
            if (position !== null) {
                layout[name] = position;
            }
        }

        return layout;
    } catch {
        return {};
    }
};

const saveStoredLayout = (layout: Record<PositionedControlName, ControlPosition>): void => {
    try {
        window.localStorage.setItem(layoutStorageKey, JSON.stringify(layout));
    } catch {
        return;
    }
};

const storedLayout = loadStoredLayout();
const layout: Record<PositionedControlName, ControlPosition> = {
    map: storedLayout["map"] ?? defaultLayout.map,
    pause: storedLayout["pause"] ?? defaultLayout.pause,
    configure: storedLayout["configure"] ?? defaultLayout.configure,
    land: storedLayout["land"] ?? defaultLayout.land,
    warp: storedLayout["warp"] ?? defaultLayout.warp,
    interact: storedLayout["interact"] ?? defaultLayout.interact,
    space: storedLayout["space"] ?? defaultLayout.space,
    down: storedLayout["down"] ?? defaultLayout.down,
    zero: storedLayout["zero"] ?? defaultLayout.zero,
    boost: storedLayout["boost"] ?? defaultLayout.boost,
    brake: storedLayout["brake"] ?? defaultLayout.brake,
    camera: storedLayout["camera"] ?? defaultLayout.camera,
    target: storedLayout["target"] ?? defaultLayout.target,
    jump: storedLayout["jump"] ?? defaultLayout.jump,
    focus: storedLayout["focus"] ?? defaultLayout.focus,
    ui: storedLayout["ui"] ?? defaultLayout.ui,
    orbits: storedLayout["orbits"] ?? defaultLayout.orbits,
    view: storedLayout["view"] ?? defaultLayout.view,
    reset: storedLayout["reset"] ?? defaultLayout.reset,
    previousMission: storedLayout["previousMission"] ?? defaultLayout.previousMission,
    nextMission: storedLayout["nextMission"] ?? defaultLayout.nextMission,
    dance: storedLayout["dance"] ?? defaultLayout.dance,
    sit: storedLayout["sit"] ?? defaultLayout.sit,
    leftStick: storedLayout["leftStick"] ?? defaultLayout.leftStick,
    rightStick: storedLayout["rightStick"] ?? defaultLayout.rightStick,
    menu: storedLayout["menu"] ?? defaultLayout.menu,
};

const virtualStickRadius = 58;
const virtualStickKnobRadius = 18;

const getViewportSize = (): { readonly width: number; readonly height: number } => {
    const viewport = window.visualViewport;
    return {
        width: viewport?.width ?? window.innerWidth,
        height: viewport?.height ?? window.innerHeight,
    };
};

const applyPosition = (element: HTMLElement, position: ControlPosition): void => {
    element.style.setProperty("--control-left", `${position.xPercent}%`);
    element.style.setProperty("--control-top", `${position.yPercent}%`);
};

const isInsideElement = (element: HTMLElement, event: PointerEvent): boolean => {
    const rect = element.getBoundingClientRect();
    return (
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
    );
};

const root = document.createElement("div");
root.className = "mobileControls";
root.hidden = !shouldShowMobileControls();
document.body.appendChild(root);

const buttonElements: Partial<Record<MobileButtonName, HTMLButtonElement>> = {};

let isEditing = false;

const setEditing = (enabled: boolean): void => {
    isEditing = enabled;
    root.classList.toggle("mobileControls--editing", enabled);
};

const secondaryControlNames: ReadonlySet<MobileButtonName> = new Set([
    "pause",
    "map",
    "camera",
    "target",
    "jump",
    "focus",
    "ui",
    "orbits",
    "view",
    "reset",
    "previousMission",
    "nextMission",
    "dance",
    "sit",
]);

let isMenuOpen = false;

const setMenuOpen = (open: boolean, menuButton: HTMLButtonElement, menuPanel: HTMLElement): void => {
    isMenuOpen = open;
    root.classList.toggle("mobileControls--menuOpen", open);
    menuButton.setAttribute("aria-expanded", String(open));
    menuPanel.setAttribute("aria-hidden", String(!open));
};

const makeDraggable = (
    element: HTMLElement,
    name: PositionedControlName,
    onPositionChange?: (position: ControlPosition) => void,
): void => {
    element.addEventListener("pointerdown", (event): void => {
        if (!isEditing) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        element.setPointerCapture(event.pointerId);

        const startX = event.clientX;
        const startY = event.clientY;
        const startPosition = layout[name];

        const move = (moveEvent: PointerEvent): void => {
            const nextPosition = {
                xPercent: Math.min(
                    96,
                    Math.max(
                        4,
                        startPosition.xPercent + ((moveEvent.clientX - startX) / getViewportSize().width) * 100,
                    ),
                ),
                yPercent: Math.min(
                    92,
                    Math.max(
                        8,
                        startPosition.yPercent + ((moveEvent.clientY - startY) / getViewportSize().height) * 100,
                    ),
                ),
            };

            layout[name] = nextPosition;
            applyPosition(element, nextPosition);
            onPositionChange?.(nextPosition);
        };

        const finish = (): void => {
            element.removeEventListener("pointermove", move);
            element.removeEventListener("pointerup", finish);
            element.removeEventListener("pointercancel", finish);
            saveStoredLayout(layout);
        };

        element.addEventListener("pointermove", move);
        element.addEventListener("pointerup", finish);
        element.addEventListener("pointercancel", finish);
    });
};

class TouchButtonDevice extends Device {
    readonly control: ButtonInputControl;

    private pressed = false;

    constructor(name: MobileButtonName) {
        super();
        this.control = new ButtonInputControl(() => (this.pressed ? 1 : 0), {
            name,
            device: this,
        });
    }

    setPressed(pressed: boolean): void {
        if (this.pressed === pressed) {
            return;
        }

        this.pressed = pressed;
        this.emit("change");
    }
}

class TouchButton {
    readonly control: ButtonInputControl;

    private readonly device: TouchButtonDevice;

    constructor(parent: HTMLElement, name: MobileButtonName) {
        const button = document.createElement("button");
        button.className = `mobileControls__button mobileControls__button--${name}`;
        button.type = "button";
        button.textContent = buttonLabels[name];
        button.setAttribute("aria-label", buttonLabels[name]);
        if (secondaryControlNames.has(name)) {
            button.classList.add("mobileControls__button--secondary");
        }
        if (name === "camera") {
            button.setAttribute("aria-pressed", "false");
        }
        applyPosition(button, layout[name]);
        makeDraggable(button, name);
        this.device = new TouchButtonDevice(name);
        this.control = this.device.control;
        buttonElements[name] = button;

        button.addEventListener("pointerdown", (event): void => {
            if (isEditing) {
                return;
            }

            event.preventDefault();
            button.setPointerCapture(event.pointerId);
            this.device.setPressed(true);
        });

        const release = (event: PointerEvent): void => {
            event.preventDefault();
            this.device.setPressed(false);
        };

        button.addEventListener("pointerup", release);
        button.addEventListener("pointercancel", release);
        button.addEventListener("lostpointercapture", (): void => {
            this.device.setPressed(false);
        });

        parent.appendChild(button);
    }
}

const createMenuButton = (): void => {
    const menuPanel = document.createElement("div");
    menuPanel.className = "mobileControls__menuPanel";
    menuPanel.setAttribute("aria-hidden", "true");
    menuPanel.id = "mobileControlsMenu";
    root.appendChild(menuPanel);

    const button = document.createElement("button");
    button.className = "mobileControls__button mobileControls__button--menu";
    button.type = "button";
    button.textContent = "MENU";
    button.setAttribute("aria-label", "Open mobile controls menu");
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", menuPanel.id);
    applyPosition(button, layout.menu);
    makeDraggable(button, "menu");

    button.addEventListener("click", (event): void => {
        event.preventDefault();
        event.stopPropagation();
        setMenuOpen(!isMenuOpen, button, menuPanel);
    });

    root.appendChild(button);
};

const setButtonActive = (name: MobileButtonName, active: boolean): void => {
    const button = buttonElements[name];
    if (button === undefined) {
        return;
    }

    button.classList.toggle("mobileControls__button--active", active);
    if (name === "camera") {
        button.setAttribute("aria-pressed", String(active));
    }
};

const createConfigureButton = (): void => {
    const button = document.createElement("button");
    button.className = "mobileControls__button mobileControls__button--configure mobileControls__button--secondary";
    button.type = "button";
    button.textContent = "CFG";
    button.setAttribute("aria-label", "Configure mobile controls");
    applyPosition(button, layout.configure);
    makeDraggable(button, "configure");

    button.addEventListener("click", (event): void => {
        event.preventDefault();
        setEditing(!isEditing);
        button.textContent = isEditing ? "DONE" : "CFG";
        saveStoredLayout(layout);
    });

    root.appendChild(button);
};

const createStick = (name: "leftStick" | "rightStick", label: string): StickInputControl => {
    const zone = document.createElement("div");
    zone.className = `mobileControls__stickZone mobileControls__stickZone--${name}`;
    zone.setAttribute("aria-label", label);
    applyPosition(zone, layout[name]);

    const knob = document.createElement("div");
    knob.className = "mobileControls__stickKnob";
    knob.setAttribute("aria-hidden", "true");
    zone.appendChild(knob);
    root.appendChild(zone);

    const stick = new VirtualStick({
        element: document.body,
        radius: virtualStickRadius,
        mode: "static",
        x: (layout[name].xPercent / 100) * getViewportSize().width,
        y: (layout[name].yPercent / 100) * getViewportSize().height,
        filter: (event): boolean => !isEditing && isInsideElement(zone, event),
    });

    const control = stick.getControl(name);
    const syncStickPosition = (position: ControlPosition): void => {
        stick.x = (position.xPercent / 100) * getViewportSize().width;
        stick.y = (position.yPercent / 100) * getViewportSize().height;
    };
    const updateStickView = (): void => {
        const [x, y] = control.read();
        const travel = virtualStickRadius - virtualStickKnobRadius;
        knob.style.transform = `translate(${x * travel}px, ${-y * travel}px)`;
        zone.classList.toggle("mobileControls__stickZone--active", control.active());
    };

    makeDraggable(zone, name, syncStickPosition);
    stick.on("change", updateStickView);
    window.addEventListener("resize", (): void => {
        syncStickPosition(layout[name]);
    });
    updateStickView();

    return control;
};

const leftStick = createStick("leftStick", "Movement");
const rightStick = createStick("rightStick", "Look");
createMenuButton();
createConfigureButton();

const buttons: Record<MobileButtonName, ButtonInputControl> = {
    pause: new TouchButton(root, "pause").control,
    map: new TouchButton(root, "map").control,
    land: new TouchButton(root, "land").control,
    warp: new TouchButton(root, "warp").control,
    interact: new TouchButton(root, "interact").control,
    space: new TouchButton(root, "space").control,
    down: new TouchButton(root, "down").control,
    zero: new TouchButton(root, "zero").control,
    boost: new TouchButton(root, "boost").control,
    brake: new TouchButton(root, "brake").control,
    camera: new TouchButton(root, "camera").control,
    target: new TouchButton(root, "target").control,
    jump: new TouchButton(root, "jump").control,
    focus: new TouchButton(root, "focus").control,
    ui: new TouchButton(root, "ui").control,
    orbits: new TouchButton(root, "orbits").control,
    view: new TouchButton(root, "view").control,
    reset: new TouchButton(root, "reset").control,
    previousMission: new TouchButton(root, "previousMission").control,
    nextMission: new TouchButton(root, "nextMission").control,
    dance: new TouchButton(root, "dance").control,
    sit: new TouchButton(root, "sit").control,
};

export const MobileControls = {
    leftStick,
    rightStick,
    buttons,
    setVisible(visible: boolean): void {
        if (!isTouchDevice()) {
            return;
        }

        root.hidden = !visible;
    },
    setTutorialMode(enabled: boolean): void {
        if (!isTouchDevice()) {
            return;
        }

        root.hidden = false;
        root.classList.toggle("mobileControls--tutorial", enabled);
        if (!enabled) {
            root.hidden = !shouldShowMobileControls();
        }
    },
    setButtonActive,
};
