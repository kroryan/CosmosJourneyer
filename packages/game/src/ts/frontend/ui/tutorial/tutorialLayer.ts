import { Observable } from "@babylonjs/core/Misc/observable";
import { type IDisposable } from "@babylonjs/core/scene";

import { type ISoundPlayer } from "@/frontend/audio/soundPlayer";
import { pressInteractionToStrings } from "@/frontend/helpers/inputControlsString";
import { MobileControls } from "@/frontend/inputs/mobileControls";
import { promptModalBoolean } from "@/frontend/ui/dialogModal";

import { getGlobalKeyboardLayoutMap } from "@/utils/keyboardAPI";

import i18n from "@/i18n";

import { TutorialControlsInputs } from "./tutorialLayerInputs";
import { type Tutorial, type TutorialId } from "./tutorials/tutorial";

const interruptedTutorialStorageKey = "cosmosJourneyer.interruptedTutorial.v1";

export type InterruptedTutorial = {
    readonly tutorialId: TutorialId;
    readonly panelIndex: number;
};

type SetTutorialOptions = {
    readonly initialPanelIndex?: number;
    readonly persistForContinue?: boolean;
};

const tutorialIds: ReadonlySet<string> = new Set([
    "flight",
    "fuelScoop",
    "stationLanding",
    "starMap",
    "planetaryLanding",
    "template",
]);

const isTutorialId = (value: string): value is TutorialId => tutorialIds.has(value);

const readInterruptedTutorial = (): InterruptedTutorial | null => {
    try {
        const rawValue = window.localStorage.getItem(interruptedTutorialStorageKey);
        if (rawValue === null) {
            return null;
        }

        const parsedValue: unknown = JSON.parse(rawValue);
        if (typeof parsedValue !== "object" || parsedValue === null) {
            return null;
        }

        const value = parsedValue as { tutorialId?: unknown; panelIndex?: unknown };
        if (
            typeof value.tutorialId !== "string" ||
            !isTutorialId(value.tutorialId) ||
            typeof value.panelIndex !== "number" ||
            !Number.isInteger(value.panelIndex) ||
            value.panelIndex < 0
        ) {
            return null;
        }

        return {
            tutorialId: value.tutorialId,
            panelIndex: value.panelIndex,
        };
    } catch {
        return null;
    }
};

const writeInterruptedTutorial = (tutorialId: TutorialId, panelIndex: number): void => {
    try {
        window.localStorage.setItem(
            interruptedTutorialStorageKey,
            JSON.stringify({ tutorialId: tutorialId, panelIndex: panelIndex }),
        );
    } catch {
        return;
    }
};

const clearInterruptedTutorial = (): void => {
    try {
        window.localStorage.removeItem(interruptedTutorialStorageKey);
    } catch {
        return;
    }
};

export class TutorialLayer implements IDisposable {
    readonly root: HTMLDivElement;

    private readonly soundPlayer: ISoundPlayer;

    private readonly panel: HTMLDivElement;

    private readonly title: HTMLHeadingElement;

    private readonly contentContainer: HTMLDivElement;

    private readonly controls: HTMLDivElement;

    private readonly prevButton: HTMLButtonElement;

    private readonly nextButton: HTMLButtonElement;

    private tutorialPanelsHtml: string[] = [];

    private currentPanelIndex = 0;

    private currentTutorialId: TutorialId | null = null;

    private persistForContinue = false;

    readonly onQuitTutorial: Observable<void> = new Observable();

    readonly onEnabledChanged: Observable<boolean> = new Observable();

    constructor(soundPlayer: ISoundPlayer) {
        this.soundPlayer = soundPlayer;

        this.root = document.createElement("div");
        this.root.classList.add("tutorialLayer");

        this.panel = document.createElement("div");
        this.panel.classList.add("tutorialPanel");
        this.panel.classList.add("hidden");

        this.title = document.createElement("h1");
        this.title.innerText = "Tutorial";
        this.panel.appendChild(this.title);

        this.contentContainer = document.createElement("div");
        this.contentContainer.classList.add("tutorialContentContainer");
        this.panel.appendChild(this.contentContainer);

        this.controls = document.createElement("div");
        this.controls.classList.add("tutorialControls");

        this.prevButton = document.createElement("button");
        this.prevButton.type = "button";
        this.prevButton.setAttribute("aria-label", i18n.t("tutorials:common:previous"));
        const prevButtonTextSpan = document.createElement("span");
        prevButtonTextSpan.innerText = i18n.t("tutorials:common:previous");
        this.prevButton.appendChild(prevButtonTextSpan);

        this.nextButton = document.createElement("button");
        this.nextButton.type = "button";
        this.nextButton.setAttribute("aria-label", i18n.t("tutorials:common:next"));
        const nextButtonTextSpan = document.createElement("span");
        nextButtonTextSpan.innerText = i18n.t("tutorials:common:next");
        this.nextButton.appendChild(nextButtonTextSpan);

        void getGlobalKeyboardLayoutMap().then((keyboardLayoutMap) => {
            pressInteractionToStrings(TutorialControlsInputs.map.prevPanel, keyboardLayoutMap).forEach((key) => {
                const prevKeySpan = document.createElement("span");
                prevKeySpan.classList.add("keySpan");
                prevKeySpan.innerText = key;
                this.prevButton.appendChild(prevKeySpan);
            });

            pressInteractionToStrings(TutorialControlsInputs.map.nextPanel, keyboardLayoutMap).forEach((key) => {
                const nextKeySpan = document.createElement("span");
                nextKeySpan.classList.add("keySpan");
                nextKeySpan.innerText = key;
                this.nextButton.appendChild(nextKeySpan);
            });
        });

        this.controls.appendChild(this.prevButton);
        this.controls.appendChild(this.nextButton);

        this.panel.appendChild(this.controls);

        this.root.appendChild(this.panel);

        const previousPanel = (): void => {
            if (this.currentPanelIndex === 0) {
                return;
            }

            this.currentPanelIndex = Math.max(0, this.currentPanelIndex - 1);
            this.updatePanelState();
            this.prevButton.animate(
                [{ transform: "scale(1)" }, { transform: "scale(1.1)" }, { transform: "scale(1)" }],
                {
                    duration: 200,
                    easing: "ease",
                },
            );
            this.soundPlayer.playNow("click");
        };

        const nextPanel = async (): Promise<void> => {
            if (this.currentPanelIndex === this.tutorialPanelsHtml.length - 1) {
                TutorialControlsInputs.setEnabled(false);
                if (await promptModalBoolean(i18n.t("tutorials:common:quitConfirm"), this.soundPlayer)) {
                    this.quitTutorial();
                    return;
                }

                TutorialControlsInputs.setEnabled(true);

                return;
            }

            this.currentPanelIndex = Math.min(this.tutorialPanelsHtml.length - 1, this.currentPanelIndex + 1);
            this.updatePanelState();
            this.nextButton.animate(
                [{ transform: "scale(1)" }, { transform: "scale(1.1)" }, { transform: "scale(1)" }],
                {
                    duration: 200,
                    easing: "ease",
                },
            );
            this.soundPlayer.playNow("click");
        };

        this.prevButton.addEventListener("click", previousPanel);
        this.nextButton.addEventListener("click", () => {
            void nextPanel();
        });

        TutorialControlsInputs.map.prevPanel.on("complete", previousPanel);
        TutorialControlsInputs.map.nextPanel.on("complete", () => {
            void nextPanel();
        });
    }

    public async setTutorial(tutorial: Tutorial, options: SetTutorialOptions = {}): Promise<void> {
        if (this.isEnabled()) {
            this.setEnabled(false);
        }
        this.onQuitTutorial.clear();
        this.title.innerText = tutorial.getTitle();
        this.currentTutorialId = tutorial.id;
        this.persistForContinue = options.persistForContinue ?? true;
        if (!this.persistForContinue) {
            clearInterruptedTutorial();
        }
        this.tutorialPanelsHtml = [];
        this.currentPanelIndex = Math.max(0, options.initialPanelIndex ?? 0);
        this.contentContainer.replaceChildren();
        this.setEnabled(true);
        this.tutorialPanelsHtml = await tutorial.getContentPanelsHtml();
        this.currentPanelIndex = Math.min(this.currentPanelIndex, Math.max(0, this.tutorialPanelsHtml.length - 1));
        this.updatePanelState();
    }

    public quitTutorial(): void {
        this.setEnabled(false);
        clearInterruptedTutorial();
        this.currentTutorialId = null;
        this.persistForContinue = false;
        this.soundPlayer.playNow("click");
        this.onQuitTutorial.notifyObservers();
    }

    public setEnabled(enabled: boolean): void {
        if (this.isEnabled() === enabled) {
            return;
        }

        this.panel.classList.toggle("hidden", !enabled);
        TutorialControlsInputs.setEnabled(enabled);
        MobileControls.setTutorialMode(enabled);
        this.onEnabledChanged.notifyObservers(enabled);
    }

    public isEnabled(): boolean {
        return !this.panel.classList.contains("hidden");
    }

    public getInterruptedTutorial(): InterruptedTutorial | null {
        return readInterruptedTutorial();
    }

    public clearInterruptedTutorial(): void {
        clearInterruptedTutorial();
    }

    private updatePanelState(): void {
        this.contentContainer.innerHTML =
            this.tutorialPanelsHtml[this.currentPanelIndex] ?? "ERROR: panels out of bounds";

        const isFirstPanel = this.currentPanelIndex === 0;
        this.prevButton.disabled = isFirstPanel;
        this.prevButton.classList.toggle("disabled", isFirstPanel);

        if (this.currentTutorialId !== null && this.persistForContinue) {
            writeInterruptedTutorial(this.currentTutorialId, this.currentPanelIndex);
        }
    }

    dispose(): void {
        this.root.remove();
        this.onQuitTutorial.clear();
        this.onEnabledChanged.clear();
    }
}
