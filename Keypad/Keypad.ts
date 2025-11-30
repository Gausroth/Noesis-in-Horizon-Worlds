import { Component, Player, PropTypes, AudioGizmo, CodeBlockEvents, Entity } from 'horizon/core';
import { NoesisGizmo } from 'horizon/noesis';
class Keypad extends Component<typeof Keypad> {
    static propsDefinition = {
        code: { type: PropTypes.String, default: "0000" },
        maxCharCount: { type: PropTypes.Number, default: 0 },
        numberOfAttemps: { type: PropTypes.Number, default: 0 },
        enablePrivacy: { type: PropTypes.Boolean, default: false },
        clickSFX: { type: PropTypes.Entity },
        errorSFX: { type: PropTypes.Entity },
        passSFX: { type: PropTypes.Entity }
    };

    private dataContext = {
        Button: (value: string) => this.ButtonClicked(value),
        DisplayText: ""
    }

    private activePlayer: Player | undefined;
    private displayText: string = "";
    private numberOfAttemps: number = 0;
    private maxCharCount: number = 0;
    private isLocked: boolean = false;

    preStart() {
        this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnPlayerFocusUI, (player: Player, focusedOn: Entity) => this.OnPlayerFocusUI(player, focusedOn));
        if (this.props.maxCharCount === 0) this.maxCharCount = this.props.code.length;
        else this.maxCharCount = this.props.maxCharCount;
    }

    start() {
        this.activePlayer = this.world.getLocalPlayer();

        if (this.activePlayer === this.world.getServerPlayer()) return;

        this.entity.as(NoesisGizmo).dataContext = this.dataContext;
    }

    OnPlayerFocusUI(player: Player, focusedOn: Entity) {
        if (focusedOn !== this.entity) return;
        if (this.isLocked) this.UnfocusUI();
    }

    ButtonClicked(value: string) {
        if (this.isLocked) return;
        if (this.displayText === "ERROR") this.displayText = "";

        if (value === "X") this.displayText = "";
        else if (value === "E") {
            this.CheckCode();
            return;
        }
        else if ( this.displayText.length >= this.maxCharCount) return;
        else this.displayText += value;

        if (this.props.clickSFX && this.activePlayer) this.props.clickSFX.as(AudioGizmo).play({ fade: 0, players: [this.activePlayer] });

        if (this.props.enablePrivacy) {
            let privacyText = "";
            for (let i = 0; i < this.displayText.length; i++) {
                privacyText += "*";
            }
            this.dataContext.DisplayText = privacyText;
        }
        else this.dataContext.DisplayText = this.displayText;
    }

    CheckCode() {
        this.numberOfAttemps++;
        if (this.displayText === this.props.code) {
            if (this.props.passSFX && this.activePlayer) this.props.passSFX.as(AudioGizmo).play({ fade: 0, players: [this.activePlayer] });
            this.displayText = "PASS";
            this.UnfocusUI();
        }
        else {
            if (this.props.errorSFX && this.activePlayer) this.props.errorSFX.as(AudioGizmo).play({ fade: 0, players: [this.activePlayer] });
            this.displayText = "ERROR";
            if (this.props.numberOfAttemps > 0) {
                if (this.numberOfAttemps >= this.props.numberOfAttemps) {
                    this.displayText = "LOCKED";
                    this.isLocked = true;
                    this.UnfocusUI();
                }
            }
        }
        this.dataContext.DisplayText = this.displayText;
    }

    ResetAttempts() {
        this.isLocked = false;
        this.numberOfAttemps = 0;
    }

    UnfocusUI() {
        this.async.setTimeout(() => {
            this.activePlayer?.unfocusUI();
        }, 1000);
    }
}

Component.register(Keypad);
